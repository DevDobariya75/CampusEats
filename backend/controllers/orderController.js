import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, restaurant, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No order items'
        });
    }

    // Verify restaurant exists
    const restaurantData = await Restaurant.findById(restaurant);
    if (!restaurantData || !restaurantData.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    if (!restaurantData.isOpen) {
        return res.status(400).json({
            success: false,
            message: 'Restaurant is currently closed'
        });
    }

    // Calculate prices
    let itemsPrice = 0;
    const orderItemsWithDetails = [];

    for (const item of orderItems) {
        const menuItem = await MenuItem.findById(item.menuItem);

        if (!menuItem || !menuItem.isAvailable) {
            return res.status(404).json({
                success: false,
                message: `Menu item ${item.menuItem} not found or unavailable`
            });
        }

        const itemPrice = menuItem.price * item.quantity;
        itemsPrice += itemPrice;

        orderItemsWithDetails.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
        });
    }

    // Calculate delivery fee
    const deliveryFee = restaurantData.deliveryFee || 0;

    // Calculate tax (assuming 10% tax)
    const taxPrice = (itemsPrice + deliveryFee) * 0.1;

    // Total price
    const totalPrice = itemsPrice + deliveryFee + taxPrice;

    // Check minimum order
    if (itemsPrice < restaurantData.minOrder) {
        return res.status(400).json({
            success: false,
            message: `Minimum order amount is $${restaurantData.minOrder}`
        });
    }

    // Create order
    const order = await Order.create({
        user: req.user.id,
        restaurant,
        orderItems: orderItemsWithDetails,
        deliveryAddress: deliveryAddress || req.user.address,
        paymentMethod,
        itemsPrice,
        deliveryFee,
        taxPrice,
        totalPrice,
        specialInstructions,
        estimatedDeliveryTime: new Date(Date.now() + restaurantData.deliveryTime * 60000)
    });

    const populatedOrder = await Order.findById(order._id)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name image');

    res.status(201).json({
        success: true,
        data: populatedOrder
    });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter by user role
    if (req.user.role === 'student') {
        query.user = req.user.id;
    } else if (req.user.role === 'restaurant_owner') {
        const restaurants = await Restaurant.find({ owner: req.user.id });
        query.restaurant = { $in: restaurants.map(r => r._id) };
    }

    if (status) {
        query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name image')
        .populate('orderItems.menuItem', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        count: orders.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: orders
    });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone address')
        .populate('restaurant', 'name image address contact')
        .populate('orderItems.menuItem')
        .populate('deliveryPerson', 'name phone');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Make sure user has access to this order
    if (
        req.user.role === 'student' && order.user._id.toString() !== req.user.id
    ) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this order'
        });
    }

    if (req.user.role === 'restaurant_owner') {
        const restaurant = await Restaurant.findById(order.restaurant._id);
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant Owner/Admin/Delivery Person)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status'
        });
    }

    const order = await Order.findById(req.params.id).populate('restaurant');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Authorization checks
    if (req.user.role === 'restaurant_owner') {
        const restaurant = await Restaurant.findById(order.restaurant._id);
        if (restaurant.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }
    }

    // Cancel order - only allowed before preparation
    if (status === 'cancelled' && !['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
            success: false,
            message: 'Order cannot be cancelled at this stage'
        });
    }

    order.status = status;

    if (status === 'delivered') {
        order.deliveredAt = new Date();
    }

    if (status === 'out_for_delivery' && req.user.role === 'delivery_person') {
        order.deliveryPerson = req.user.id;
    }

    await order.save();

    res.status(200).json({
        success: true,
        data: order
    });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Student)
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    if (order.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to cancel this order'
        });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
        return res.status(400).json({
            success: false,
            message: 'Order cannot be cancelled at this stage'
        });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});
