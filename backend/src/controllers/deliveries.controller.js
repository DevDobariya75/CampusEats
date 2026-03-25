import Delivery from "../models/deliveries.model.js"
import Order from "../models/order.model.js"
import User from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

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

    // Verify delivery partner exists and has delivery role
    const deliveryPartner = await User.findOne({
        _id: deliveryPartnerId,
        role: 'delivery'
    })

    if (!deliveryPartner) {
        throw new ApiError(404, "Delivery partner not found")
    }

    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findOne({
        order: orderId,
        isDeleted: false
    })

    if (existingDelivery) {
        throw new ApiError(400, "Delivery is already assigned to this order")
    }

    const delivery = await Delivery.create({
        order: orderId,
        deliveryPartner: deliveryPartnerId,
        status: 'Assigned',
        isDeleted: false
    })

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
        .populate('order', 'totalAmount customer')

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

    const deliveries = await Delivery.find(filter)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer deliveryAddress')
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

    delivery.acceptedAt = new Date()
    await delivery.save()

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

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

    if (delivery.status !== 'Assigned') {
        throw new ApiError(400, "Delivery must be assigned before marking as picked up")
    }

    delivery.status = 'Picked Up'
    delivery.pickedUpAt = new Date()
    await delivery.save()

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedDelivery, "Order marked as picked up successfully"))
})

// Mark as Delivered
const markDelivered = asyncHandler(async (req, res) => {
    const { deliveryId } = req.params
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

    if (delivery.status !== 'Picked Up') {
        throw new ApiError(400, "Order must be picked up before delivery")
    }

    delivery.status = 'Delivered'
    delivery.deliveredAt = new Date()
    await delivery.save()

    // Update order status to Delivered
    await Order.findByIdAndUpdate(
        delivery.order,
        { $set: { status: 'Delivered' } }
    )

    const updatedDelivery = await Delivery.findById(deliveryId)
        .populate('deliveryPartner', 'name email phone')
        .populate('order', 'totalAmount customer')

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

    delivery.status = 'Cancelled'
    await delivery.save()

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

    const stats = await Delivery.aggregate([
        { $match: { deliveryPartner: partnerId, isDeleted: false } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])

    const totalDeliveries = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        isDeleted: false
    })

    const completedDeliveries = await Delivery.countDocuments({
        deliveryPartner: partnerId,
        status: 'Delivered',
        isDeleted: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalDeliveries,
            completedDeliveries,
            stats
        }, "Delivery statistics fetched successfully"))
})

export {
    assignDelivery,
    getDeliveryByOrder,
    getPartnerDeliveries,
    acceptDelivery,
    markPickedUp,
    markDelivered,
    cancelDelivery,
    getDeliveryStats
}
