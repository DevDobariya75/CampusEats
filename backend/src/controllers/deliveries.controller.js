import Delivery from "../models/deliveries.model.js"
import Order from "../models/order.model.js"
import User from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { assignPendingOutForDeliveryOrders, markOrderDelivered } from "../services/deliveryAssignment.service.js"
import { createSystemNotification } from "../services/notification.service.js"

const generateDeliveryVerificationCode = () => String(Math.floor(1000 + Math.random() * 9000))

const decrementPartnerLoad = async (partnerId) => {
    if (!partnerId) {
        return
    }

    const partner = await User.findById(partnerId).select('currentOrders')
    if (!partner) {
        return
    }

    const nextCurrentOrders = Math.max((partner.currentOrders || 0) - 1, 0)
    await User.findByIdAndUpdate(partnerId, { $set: { currentOrders: nextCurrentOrders } }, { new: true })
}

const safeNotify = async (payload) => {
    try {
        await createSystemNotification(payload)
    } catch {
        // Notification failures should not block request handling.
    }
}

// Assign Delivery to Partner
const assignDelivery = asyncHandler(async (req, res) => {
    const { orderId, deliveryPartnerId } = req.body
    const userRole = req.user?.role

    if (!userRole || userRole !== 'admin') {
        throw new ApiError(403, "Only admins can assign deliveries")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!deliveryPartnerId) {
        throw new ApiError(400, "Delivery partner ID is required")
    }

    // Verify order exists
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Verify delivery partner exists and has delivery role with available capacity
    const deliveryPartner = await User.findOneAndUpdate(
        {
            _id: deliveryPartnerId,
            role: 'delivery',
            isActive: true,
            isDeleted: false,
            $expr: {
                $lt: [
                    { $ifNull: ['$currentOrders', 0] },
                    { $ifNull: ['$maxOrders', 4] }
                ]
            }
        },
        { $inc: { currentOrders: 1 } },
        { new: true }
    )

    if (!deliveryPartner) {
        throw new ApiError(400, "Delivery partner not available or at max capacity")
    }

    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({
        order: orderId,
        isDeleted: false
    })

    if (existingDelivery) {
        throw new ApiError(400, "Delivery is already assigned to this order")
    }

    let delivery
    try {
        delivery = await Delivery.create({
            order: orderId,
            deliveryPartner: deliveryPartnerId,
            status: 'Assigned',
            isDeleted: false
        })

        await Order.findByIdAndUpdate(orderId, { $set: { deliveryPartnerId } })
    } catch (error) {
        await User.findByIdAndUpdate(deliveryPartnerId, { $inc: { currentOrders: -1 } })
        throw error
    }

    const populatedDelivery = await Delivery.findById(delivery._id)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedDelivery, "Delivery assigned successfully"))
})

// Get Delivery by Order
const getDeliveryByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const delivery = await Delivery.findOne({
        order: orderId,
        isDeleted: false
    })
        .populate('deliveryPartner', 'name email phone')
        .populate({
            path: 'order',
            select: 'totalAmount customer deliveryAddress shop specialNotes status',
            populate: [
                { path: 'customer', select: 'name email phone' },
                { path: 'deliveryAddress', select: 'label addressLine' },
                { path: 'shop', select: 'name phone address' }
            ]
        })

    if (!delivery) {
        throw new ApiError(404, "Delivery not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, delivery, "Delivery fetched successfully"))
})

// Get Delivery Partner Deliveries
const getPartnerDeliveries = asyncHandler(async (req, res) => {
    const { status } = req.query
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can access this endpoint")
    }

    const filter = {
        deliveryPartner: partnerId,
        isDeleted: false
    }

    if (status) {
        filter.status = status
    }

    await assignPendingOutForDeliveryOrders()

    const deliveries = await Delivery.find(filter)
        .populate('deliveryPartner', 'name email phone')
        .populate({
            path: 'order',
            select: 'totalAmount customer deliveryAddress shop specialNotes status',
            populate: [
                { path: 'customer', select: 'name email phone' },
                { path: 'deliveryAddress', select: 'label addressLine' },
                { path: 'shop', select: 'name phone address' }
            ]
        })
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, deliveries, "Partner deliveries fetched successfully"))
})

// Accept Delivery
const acceptDelivery = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can accept deliveries")
    }

    if (!deliveryId) {
        throw new ApiError(400, "Delivery ID is required")
    }

    const delivery = await Delivery.findOne({
        _id: deliveryId,
        deliveryPartner: partnerId,
        isDeleted: false
    })

    if (!delivery) {
        throw new ApiError(404, "Delivery not found")
    }

    if (delivery.status !== 'Assigned') {
        throw new ApiError(400, "Delivery has already been accepted or processed")
    }

    delivery.status = 'Accepted'
    delivery.acceptedAt = new Date()
    await delivery.save()

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    const acceptedOrder = await Order.findById(delivery.order)
        .populate('customer', 'name')
        .populate('shop', 'name owner')

    const shortOrderId = delivery.order.toString().slice(-6)
    if (acceptedOrder?.customer?._id) {
        await safeNotify({
            recipientId: acceptedOrder.customer._id,
            title: 'Delivery partner accepted your order',
            message: `Your order #${shortOrderId} has been accepted by a delivery partner.`,
            type: 'Order Update',
            relatedOrder: delivery.order
        })
    }

    if (acceptedOrder?.shop?.owner) {
        await safeNotify({
            recipientId: acceptedOrder.shop.owner,
            title: 'Delivery accepted',
            message: `A delivery partner accepted order #${shortOrderId}.`,
            type: 'Order Update',
            relatedOrder: delivery.order
        })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Delivery accepted successfully"))
})

// Mark as Picked Up
const markPickedUp = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can update delivery status")
    }

    if (!deliveryId) {
        throw new ApiError(400, "Delivery ID is required")
    }

    const delivery = await Delivery.findOne({
        _id: deliveryId,
        deliveryPartner: partnerId,
        isDeleted: false
    })

    if (!delivery) {
        throw new ApiError(404, "Delivery not found")
    }

    if (!['Assigned', 'Accepted'].includes(delivery.status)) {
        throw new ApiError(400, "Delivery must be assigned or accepted before marking as picked up")
    }

    delivery.status = 'Picked Up'
    delivery.pickedUpAt = new Date()
    await delivery.save()

    const verificationOrder = await Order.findById(delivery.order)
        .select('+deliveryVerificationCode +deliveryVerificationCodeGeneratedAt +deliveryVerificationVerifiedAt')

    let verificationCode = verificationOrder?.deliveryVerificationCode
    if (!verificationCode) {
        verificationCode = generateDeliveryVerificationCode()
        await Order.findByIdAndUpdate(
            delivery.order,
            {
                $set: {
                    deliveryVerificationCode: verificationCode,
                    deliveryVerificationCodeGeneratedAt: new Date(),
                    deliveryVerificationVerifiedAt: null
                }
            }
        )
    }

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    const pickedOrder = await Order.findById(delivery.order)
        .populate('customer', 'name')

    if (pickedOrder?.customer?._id) {
        await safeNotify({
            recipientId: pickedOrder.customer._id,
            title: 'Order picked up',
            message: `Your order #${delivery.order.toString().slice(-6)} is out for delivery. Share this code with your delivery partner: ${verificationCode}.`,
            type: 'Order Update',
            relatedOrder: delivery.order
        })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Order marked as picked up successfully"))
})

// Mark as Delivered
const markDelivered = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params
    const { verificationCode } = req.body || {}
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can complete deliveries")
    }

    if (!deliveryId) {
        throw new ApiError(400, "Delivery ID is required")
    }

    const delivery = await Delivery.findOne({
        _id: deliveryId,
        deliveryPartner: partnerId,
        isDeleted: false
    })

    if (!delivery) {
        throw new ApiError(404, "Delivery not found")
    }

    if (!['Accepted', 'Picked Up'].includes(delivery.status)) {
        throw new ApiError(400, "Order must be accepted or picked up before delivery")
    }

    // Verification code is optional - if provided validate it
    if (verificationCode) {
        if (!/^\d{4}$/.test(String(verificationCode).trim())) {
            throw new ApiError(400, "Delivery verification code must be 4 digits")
        }

        const orderForVerification = await Order.findById(delivery.order)
            .select('+deliveryVerificationCode')

        if (orderForVerification && orderForVerification.deliveryVerificationCode) {
            if (String(orderForVerification.deliveryVerificationCode) !== String(verificationCode).trim()) {
                throw new ApiError(400, "Invalid delivery verification code")
            }

            orderForVerification.deliveryVerificationVerifiedAt = new Date()
            await orderForVerification.save()
        }
    }

    try {
        await markOrderDelivered(delivery.order)
    } catch (error) {
        // Final safety fallback
        const latestOrder = await Order.findById(delivery.order)
        if (latestOrder && latestOrder.status !== 'Delivered') {
            if (latestOrder.deliveryPartnerId) {
                await decrementPartnerLoad(latestOrder.deliveryPartnerId)
            }
            await Order.findByIdAndUpdate(latestOrder._id, { $set: { status: 'Delivered' } })
        }

        const latestDelivery = await Delivery.findById(deliveryId)
        if (latestDelivery && latestDelivery.status !== 'Delivered') {
            latestDelivery.status = 'Delivered'
            latestDelivery.deliveredAt = new Date()
            latestDelivery.earningsAmount = 5  // Rs 5 for delivery partner
            latestDelivery.paymentStatus = 'Completed'
            latestDelivery.paidAt = new Date()
            await latestDelivery.save()

            // Update delivery partner earnings in fallback case too
            if (partnerId) {
                await User.findByIdAndUpdate(
                    partnerId,
                    {
                        $inc: {
                            totalEarnings: 5,
                            totalDeliveryChargeEarnings: 5
                        }
                    }
                )
            }
        }
    }

    // Update delivery status and earnings
    const updatedDelivery = await Delivery.findByIdAndUpdate(
        deliveryId,
        {
            $set: {
                status: 'Delivered',
                deliveredAt: new Date(),
                earningsAmount: 5,  // Rs 5 for delivery partner (25% of Rs 20)
                paymentStatus: 'Completed',
                paidAt: new Date()
            }
        },
        { new: true }
    )
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    // Update delivery partner earnings in User model
    if (partnerId) {
        await User.findByIdAndUpdate(
            partnerId,
            {
                $inc: {
                    totalEarnings: 5,
                    totalDeliveryChargeEarnings: 5
                }
            },
            { new: true }
        )
    }

    const deliveredOrder = await Order.findById(delivery.order)
        .populate('customer', 'name')
        .populate('shop', 'name owner')

    const shortDeliveredOrderId = delivery.order.toString().slice(-6)
    
    // Notify customer
    if (deliveredOrder?.customer?._id) {
        await safeNotify({
            recipientId: deliveredOrder.customer._id,
            title: 'Order delivered',
            message: `Your order #${shortDeliveredOrderId} has been delivered successfully. Enjoy your meal!`,
            type: 'Order Update',
            relatedOrder: delivery.order
        })
    }

    // Notify shop owner
    if (deliveredOrder?.shop?.owner) {
        await safeNotify({
            recipientId: deliveredOrder.shop.owner,
            title: 'Order delivered to customer',
            message: `Order #${shortDeliveredOrderId} was delivered to the customer.`,
            type: 'Order Update',
            relatedOrder: delivery.order
        })
    }

    // Notify delivery partner about earnings
    await safeNotify({
        recipientId: partnerId,
        title: 'Delivery completed',
        message: `Order #${shortDeliveredOrderId} delivered! You earned Rs 5.`,
        type: 'Earnings',
        relatedOrder: delivery.order
    })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Order delivered successfully"))
})

// Cancel Delivery
const cancelDelivery = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params
    const userId = req.user?._id
    const userRole = req.user?.role

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!deliveryId) {
        throw new ApiError(400, "Delivery ID is required")
    }

    const delivery = await Delivery.findOne({
        _id: deliveryId,
        isDeleted: false
    })

    if (!delivery) {
        throw new ApiError(404, "Delivery not found")
    }

    // Only delivery partner or admin can cancel
    if (userRole === 'delivery' && delivery.deliveryPartner.toString() !== userId.toString()) {
        throw new ApiError(403, "You don't have permission to cancel this delivery")
    }

    if (userRole !== 'delivery' && userRole !== 'admin') {
        throw new ApiError(403, "Only delivery partners or admins can cancel deliveries")
    }

    // Can't cancel if already delivered
    if (delivery.status === 'Delivered') {
        throw new ApiError(400, "Cannot cancel a delivered order")
    }

    const shouldReleaseLoad = ['Assigned', 'Accepted', 'Picked Up'].includes(delivery.status)

    delivery.status = 'Cancelled'
    await delivery.save()

    if (shouldReleaseLoad && delivery.deliveryPartner) {
        await decrementPartnerLoad(delivery.deliveryPartner)
    }

    // Update order status to Cancelled
    await Order.findByIdAndUpdate(
        delivery.order,
        { $set: { status: 'Cancelled' } }
    )

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Delivery cancelled successfully"))
})

// Get Delivery Statistics
const getDeliveryStats = asyncHandler(async (req, res) => {
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can access this endpoint")
    }

    const totalAssigned = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        isDeleted: false
    })

    const accepted = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        status: 'Accepted',
        isDeleted: false
    })

    const pickedUp = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        status: 'Picked Up',
        isDeleted: false
    })

    const delivered = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        status: 'Delivered',
        isDeleted: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalAssigned,
            accepted,
            pickedUp,
            delivered,
            totalDeliveries: totalAssigned,
            completedDeliveries: delivered
        }, "Delivery statistics fetched successfully"))
})

// Get Delivery Partner Earnings
const getPartnerEarnings = asyncHandler(async (req, res) => {
    const partnerId = req.user?._id
    const userRole = req.user?.role

    if (!partnerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'delivery') {
        throw new ApiError(403, "Only delivery partners can view earnings")
    }

    // Get completed deliveries count
    const completedDeliveries = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        status: 'Delivered',
        isDeleted: false
    })

    // Calculate total earnings: Rs 5 per completed delivery
    const totalDeliveryChargeEarnings = completedDeliveries * 5

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalDeliveries: completedDeliveries,
            totalEarnings: totalDeliveryChargeEarnings,
            totalDeliveryChargeEarnings: totalDeliveryChargeEarnings,
            earningsPerDelivery: 5,
            message: `Total earnings: Rs${totalDeliveryChargeEarnings} from ${completedDeliveries} deliveries`
        }, "Partner earnings fetched successfully"))
})

export {
    assignDelivery,
    getDeliveryByOrder,
    getPartnerDeliveries,
    acceptDelivery,
    markPickedUp,
    markDelivered,
    cancelDelivery,
    getDeliveryStats,
    getPartnerEarnings
}
