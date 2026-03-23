import Order from "../models/order.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

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

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required")
    }

    // Verify delivery address belongs to user
    const DeliveryAddress = require("../models/deliveryaddresses.model.js").default
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
        status: 'Pending',
        payment: paymentId,
        isDeleted: false
    })

    const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'name email phone')
        .populate('shop', 'name')
        .populate('deliveryAddress')
        .populate('payment')

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
    const Shop = require("../models/shops.model.js").default
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

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Shop orders fetched successfully"))
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

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Check if user is order customer or shop owner
    if (order.customer._id.toString() !== userId.toString()) {
        const Shop = require("../models/shops.model.js").default
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
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: order.shop,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to update this order")
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

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order status updated successfully"))
})

// Update Payment Reference
const updatePayment = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const { paymentId } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required")
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
