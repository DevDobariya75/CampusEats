import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get available orders for delivery (not yet accepted)
// @route   GET /api/delivery/available-orders
// @access  Private/DeliveryPartner
export const getAvailableOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status = 'ready' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get orders that are ready and not yet assigned to any delivery partner
    const orders = await Order.find({
        status: status || 'ready',
        deliveryPerson: { $exists: false }
    })
        .populate('user', 'name email phone address')
        .populate('shop', 'name contact')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: 1 });

    const total = await Order.countDocuments({
        status: status || 'ready',
        deliveryPerson: { $exists: false }
    });

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Accept delivery order
// @route   POST /api/delivery/orders/:id/accept
// @access  Private/DeliveryPartner
export const acceptOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Check if order is still available
    if (order.deliveryPerson) {
        return res.status(400).json({
            success: false,
            message: 'Order already accepted by another delivery partner'
        });
    }

    if (order.status !== 'ready') {
        return res.status(400).json({
            success: false,
            message: 'Order is not ready for delivery'
        });
    }

    // Assign delivery partner
    order.deliveryPerson = req.user.id;
    order.status = 'out_for_delivery';
    await order.save();

    // Populate and return updated order
    await order.populate('user', 'name email phone address');
    await order.populate('shop', 'name contact');

    res.status(200).json({
        success: true,
        message: 'Order accepted successfully',
        data: order
    });
});

// @desc    Update delivery order status
// @route   PUT /api/delivery/orders/:id/status
// @access  Private/DeliveryPartner
export const updateDeliveryStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Verify delivery partner ownership
    if (order.deliveryPerson.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this order'
        });
    }

    // Only allow delivery partner to update to out_for_delivery or delivered
    if (!['out_for_delivery', 'delivered'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Delivery partner can only set out_for_delivery or delivered'
        });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Delivery status updated successfully',
        data: order
    });
});

// @desc    Get delivery partner's assigned orders
// @route   GET /api/delivery/my-orders
// @access  Private/DeliveryPartner
export const getMyDeliveryOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { deliveryPerson: req.user.id };

    if (status) {
        query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
        .populate('user', 'name email phone address')
        .populate('shop', 'name contact')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Order.countDocuments(query);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Get delivery partner dashboard info
// @route   GET /api/delivery/dashboard
// @access  Private/DeliveryPartner
export const getDeliveryDashboard = asyncHandler(async (req, res) => {
    const availableOrders = await Order.countDocuments({
        status: 'ready',
        deliveryPerson: { $exists: false }
    });

    const myActiveOrders = await Order.countDocuments({
        deliveryPerson: req.user.id,
        status: 'out_for_delivery'
    });

    const myCompletedOrders = await Order.countDocuments({
        deliveryPerson: req.user.id,
        status: 'delivered'
    });

    const totalEarnings = await Order.aggregate([
        {
            $match: {
                deliveryPerson: req.user._id,
                status: 'delivered'
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$deliveryFee' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            stats: {
                availableOrders,
                myActiveOrders,
                myCompletedOrders,
                totalEarnings: totalEarnings[0]?.total || 0
            }
        }
    });
});

// @desc    Get single order details (for delivery partner)
// @route   GET /api/delivery/orders/:id
// @access  Private/DeliveryPartner
export const getDeliveryOrderDetails = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email phone address')
        .populate('shop', 'name contact address')
        .populate('orderItems.menuItem', 'name price');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    res.status(200).json({
        success: true,
        data: order
    });
});
