import Order from "../models/order.model.js"
import DeliveryAddress from "../models/deliveryAddresses.model.js"
import Shop from "../models/shops.model.js"
import Payment from "../models/payment.model.js"
import Cart from "../models/carts.model.js"
import CartItem from "../models/cartItems.model.js"
import Delivery from "../models/deliveries.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { assignDeliveryPartner } from "../services/deliveryAssignment.service.js"
import { createSystemNotification } from "../services/notification.service.js"

const safeNotify = async (payload) => {
    try {
        await createSystemNotification(payload)
    } catch {
        // Notification failures should not fail order operations.
    }
}

// Create Order
const createOrder = asyncHandler(async (req, res) => {
    const { shopId, deliveryAddressId, totalAmount, specialNotes, paymentId } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Validation
    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    if (!deliveryAddressId) {
        throw new ApiError(400, "Delivery address is required")
    }

    if (!totalAmount || totalAmount <= 0) {
        throw new ApiError(400, "Valid total amount is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false,
        isActive: true
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    if (!shop.isOpen) {
        throw new ApiError(400, "Shop is currently closed")
    }

    // Verify delivery address belongs to user
    const address = await DeliveryAddress.findOne({
        _id: deliveryAddressId,
        customer: customerId,
        isDeleted: false
    })

    if (!address) {
        throw new ApiError(404, "Delivery address not found")
    }

    const order = await Order.create({
        customer: customerId,
        shop: shopId,
        deliveryAddress: deliveryAddressId,
        totalAmount: parseFloat(totalAmount),
        specialNotes: specialNotes || "",
        status: 'Pending',  // Waiting for payment
        payment: null,      // Payment will be linked after successful payment
        isDeleted: false
    })

    // Clear cart for this customer and shop after order creation.
    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (cart) {
        await CartItem.deleteMany({ cart: cart._id })
        cart.cartItems = []
        await cart.save()
    }

    const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')
        .populate('deliveryPartnerId', 'name email phone')

    const shortOrderId = order._id.toString().slice(-6)
    await safeNotify({
        recipientId: shop.owner,
        title: 'You got a new order',
        message: `${req.user?.name || 'A customer'} placed order #${shortOrderId} for Rs ${order.totalAmount}.`,
        type: 'Order Update',
        relatedOrder: order._id
    })

    await safeNotify({
        recipientId: customerId,
        title: 'Order placed successfully',
        message: `Your order #${shortOrderId} has been placed. The shop is preparing it now.`,
        type: 'Order Update',
        relatedOrder: order._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, populatedOrder, "Order created successfully"))
})

// Get All Orders for Customer
const getCustomerOrders = asyncHandler(async (req, res) => {
    const customerId = req.user?._id
    const { status, sortBy } = req.query

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    const filter = {
        customer: customerId,
        isDeleted: false
    }

    if (status) {
        filter.status = status
    }

    let query = Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')
        .populate('deliveryPartnerId', 'name email phone')

    if (sortBy === 'oldest') {
        query = query.sort({ createdAt: 1 })
    } else {
        query = query.sort({ createdAt: -1 })
    }

    const orders = await query

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Customer orders fetched successfully"))
})

// Get All Orders for Shop (shopkeeper)
const getShopOrders = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const userId = req.user?._id
    const { status, sortBy } = req.query

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    // Verify shop belongs to user
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to view orders for this shop")
    }

    const filter = {
        shop: shopId,
        isDeleted: false
    }

    if (status) {
        filter.status = status
    }

    let query = Order.find(filter)
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')

    if (sortBy === 'oldest') {
        query = query.sort({ createdAt: 1 })
    } else {
        query = query.sort({ createdAt: -1 })
    }

    const orders = await query

    const orderIds = orders.map((item) => item._id)
    const deliveryRows = await Delivery.find({
        order: { $in: orderIds },
        isDeleted: false
    })
        .select('order status acceptedAt deliveryPartner')
        .populate('deliveryPartner', 'name phone')

    const deliveryMap = new Map(deliveryRows.map((item) => [item.order.toString(), item]))
    const ordersWithDeliveryInfo = orders.map((item) => {
        const delivery = deliveryMap.get(item._id.toString())
        const plain = item.toObject()
        const assignedPartner = plain.deliveryPartnerId || delivery?.deliveryPartner || null
        return {
            ...plain,
            assignedPartner,
            deliveryStatus: delivery?.status || null,
            deliveryAcceptedAt: delivery?.acceptedAt || null
        }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, ordersWithDeliveryInfo, "Shop orders fetched successfully"))
})

// Get Order by ID
const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const order = await Order.findOne({
        _id: orderId,
        isDeleted: false
    })
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')
        .populate('deliveryPartnerId', 'name email phone')

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Check if user is order customer or shop owner
    if (order.customer._id.toString() !== userId.toString()) {
        const shop = await Shop.findOne({
            _id: order.shop._id,
            owner: userId
        })

        if (!shop) {
            throw new ApiError(403, "You don't have permission to view this order")
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order fetched successfully"))
})

// Update Order Status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const { status } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!status) {
        throw new ApiError(400, "Order status is required")
    }

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const order = await Order.findOne({
        _id: orderId,
        isDeleted: false
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Verify shop owner
    const shop = await Shop.findOne({
        _id: order.shop,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to update this order")
    }

    let assignmentMessage = ""
    let assignmentResult = null
    if (status === 'Out for Delivery' && !order.deliveryPartnerId) {
        try {
            assignmentResult = await assignDeliveryPartner(order._id)
            if (!assignmentResult.assigned) {
                assignmentMessage = ` ${assignmentResult.message}`
            }
        } catch (error) {
            assignmentMessage = " Delivery assignment is pending"
        }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status } },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')
        .populate('deliveryPartnerId', 'name email phone')

    const shortOrderId = updatedOrder._id.toString().slice(-6)
    await safeNotify({
        recipientId: updatedOrder.customer?._id,
        title: 'Order status updated',
        message: `Your order #${shortOrderId} is now ${status}.`,
        type: 'Order Update',
        relatedOrder: updatedOrder._id
    })

    if (status === 'Out for Delivery' && assignmentResult && !assignmentResult.assigned) {
        await safeNotify({
            recipientId: shop.owner,
            title: 'Delivery partner unavailable',
            message: `Order #${shortOrderId} is out for delivery, but no delivery partner is currently available.`,
            type: 'General',
            relatedOrder: updatedOrder._id
        })
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, `Order status updated successfully.${assignmentMessage}`))
})

// Update Payment Reference
const updatePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ApiError(400, "Request body is required. Send { paymentId: 'value' }")
    }

    const { paymentId } = req.body

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required. Send { paymentId: 'value' }")
    }

    const order = await Order.findOne({
        _id: orderId,
        isDeleted: false
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Verify customer
    if (order.customer.toString() !== userId.toString()) {
        throw new ApiError(403, "Only order customer can update payment")
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { payment: paymentId } },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Payment updated successfully"))
})

// Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const order = await Order.findOne({
        _id: orderId,
        isDeleted: false
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Verify customer
    if (order.customer.toString() !== userId.toString()) {
        throw new ApiError(403, "Only order customer can cancel the order")
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['Pending', 'Confirmed']
    if (!cancellableStatuses.includes(order.status)) {
        throw new ApiError(400, `Cannot cancel order with status: ${order.status}`)
    }

    const cancelledOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: 'Cancelled' } },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')

    return res
        .status(200)
        .json(new ApiResponse(200, cancelledOrder, "Order cancelled successfully"))
})

// Delete Order (soft delete - admin only)
const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const userRole = req.user?.role

    if (userRole !== 'admin') {
        throw new ApiError(403, "Only admins can delete orders")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const order = await Order.findOne({
        _id: orderId,
        isDeleted: false
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    const deletedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { isDeleted: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deletedOrder, "Order deleted successfully"))
})

export {
    createOrder,
    getCustomerOrders,
    getShopOrders,
    getOrderById,
    updateOrderStatus,
    updatePayment,
    cancelOrder,
    deleteOrder
}
