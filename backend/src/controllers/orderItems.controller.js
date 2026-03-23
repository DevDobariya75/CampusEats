import OrderItem from "../models/orderItems.model.js"
import Order from "../models/order.model.js"
import MenuItem from "../models/menuItems.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create Order Items (when order is placed)
const createOrderItems = asyncHandler(async (req, res) => {
    const { orderId, items } = req.body

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ApiError(400, "Items array is required")
    }

    // Verify order exists
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    const createdItems = []

    for (let item of items) {
        if (!item.menuItemId || !item.quantity) {
            throw new ApiError(400, "Each item must have menuItemId and quantity")
        }

        // Get menu item details
        const menuItem = await MenuItem.findById(item.menuItemId)
        if (!menuItem || menuItem.isDeleted) {
            throw new ApiError(404, `Menu item ${item.menuItemId} not found`)
        }

        const orderItem = await OrderItem.create({
            order: orderId,
            menuItem: item.menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            imageUrl: menuItem.imageUrl,
            subTotal: menuItem.price * item.quantity
        })

        createdItems.push(orderItem)
    }

    const populatedItems = await OrderItem.find({ order: orderId })
        .populate('menuItem', 'name price imageUrl')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedItems, "Order items created successfully"))
})

// Get Order Items
const getOrderItems = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    // Verify order exists
    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    const orderItems = await OrderItem.find({ order: orderId })
        .populate('menuItem', 'name price imageUrl category')

    return res
        .status(200)
        .json(new ApiResponse(200, orderItems, "Order items fetched successfully"))
})

// Get Order Item by ID
const getOrderItemById = asyncHandler(async (req, res) => {
    const { orderId, itemId } = req.params

    if (!orderId || !itemId) {
        throw new ApiError(400, "Order ID and Item ID are required")
    }

    const orderItem = await OrderItem.findOne({
        _id: itemId,
        order: orderId
    }).populate('menuItem', 'name price imageUrl category')

    if (!orderItem) {
        throw new ApiError(404, "Order item not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orderItem, "Order item fetched successfully"))
})

// Update Order Item Quantity
const updateOrderItemQuantity = asyncHandler(async (req, res) => {
    const { orderId, itemId } = req.params
    const { quantity } = req.body

    if (!orderId || !itemId) {
        throw new ApiError(400, "Order ID and Item ID are required")
    }

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Valid quantity is required")
    }

    const orderItem = await OrderItem.findOne({
        _id: itemId,
        order: orderId
    })

    if (!orderItem) {
        throw new ApiError(404, "Order item not found")
    }

    orderItem.quantity = parseInt(quantity)
    if (orderItem.price) {
        orderItem.subTotal = orderItem.price * parseInt(quantity)
    }
    await orderItem.save()

    const updatedItem = await OrderItem.findById(itemId)
        .populate('menuItem', 'name price imageUrl')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedItem, "Order item updated successfully"))
})

// Delete Order Item
const deleteOrderItem = asyncHandler(async (req, res) => {
    const { orderId, itemId } = req.params

    if (!orderId || !itemId) {
        throw new ApiError(400, "Order ID and Item ID are required")
    }

    const orderItem = await OrderItem.findOneAndDelete({
        _id: itemId,
        order: orderId
    })

    if (!orderItem) {
        throw new ApiError(404, "Order item not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Order item deleted successfully"))
})

// Get Order Total from Items
const getOrderTotal = asyncHandler(async (req, res) => {
    const { orderId } = req.params

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const orderItems = await OrderItem.find({ order: orderId })

    let totalAmount = 0
    let itemCount = 0

    orderItems.forEach(item => {
        if (item.subTotal) {
            totalAmount += item.subTotal
        }
        itemCount += item.quantity || 1
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalAmount,
            itemCount,
            itemsCount: orderItems.length
        }, "Order total calculated successfully"))
})

export {
    createOrderItems,
    getOrderItems,
    getOrderItemById,
    updateOrderItemQuantity,
    deleteOrderItem,
    getOrderTotal
}
