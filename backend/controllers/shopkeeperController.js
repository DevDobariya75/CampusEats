import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import Shop from '../models/Shop.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Add new menu item (Shopkeeper only)
// @route   POST /api/shopkeeper/menu-items
// @access  Private/Shopkeeper
export const addMenuItem = asyncHandler(async (req, res) => {
    const { name, price, category, description, image, isVegetarian, isVegan, isSpicy } = req.body;

    // Get shopkeeper's shop
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found for this shopkeeper'
        });
    }

    const menuItem = await MenuItem.create({
        name,
        price,
        category,
        description,
        image,
        shop: shop._id,
        isVegetarian,
        isVegan,
        isSpicy,
        isAvailable: true
    });

    res.status(201).json({
        success: true,
        message: 'Menu item added successfully',
        data: menuItem
    });
});

// @desc    Update menu item (Shopkeeper only)
// @route   PUT /api/shopkeeper/menu-items/:id
// @access  Private/Shopkeeper
export const updateMenuItem = asyncHandler(async (req, res) => {
    let menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop || menuItem.shop.toString() !== shop._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this menu item'
        });
    }

    const { name, price, category, description, image, isVegetarian, isVegan, isSpicy, isAvailable } = req.body;

    menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        {
            name,
            price,
            category,
            description,
            image,
            isVegetarian,
            isVegan,
            isSpicy,
            isAvailable
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Menu item updated successfully',
        data: menuItem
    });
});

// @desc    Delete menu item (Shopkeeper only)
// @route   DELETE /api/shopkeeper/menu-items/:id
// @access  Private/Shopkeeper
export const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop || menuItem.shop.toString() !== shop._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this menu item'
        });
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully'
    });
});

// @desc    Get shopkeeper's menu items
// @route   GET /api/shopkeeper/menu-items
// @access  Private/Shopkeeper
export const getShopkeeperMenuItems = asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    const menuItems = await MenuItem.find({ shop: shop._id }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: menuItems
    });
});

// @desc    Get shopkeeper's orders
// @route   GET /api/shopkeeper/orders
// @access  Private/Shopkeeper
export const getShopkeeperOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    const query = { shop: shop._id };

    if (status) {
        query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('deliveryPerson', 'name phone')
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

// @desc    Update order status (Shopkeeper only)
// @route   PUT /api/shopkeeper/orders/:id/status
// @access  Private/Shopkeeper
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const order = await Order.findById(req.params.id).populate('shop');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found'
        });
    }

    // Verify ownership
    if (order.shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this order'
        });
    }

    // Only allow shopkeeper to update to preparing or ready
    if (!['preparing', 'ready'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Shopkeeper can only set preparing or ready status'
        });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});

// @desc    Get shopkeeper's sales stats
// @route   GET /api/shopkeeper/sales
// @access  Private/Shopkeeper
export const getShopkeeperSales = asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgoStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgoStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Today's sales
    const todaySales = await Order.aggregate([
        {
            $match: {
                shop: shop._id,
                createdAt: { $gte: todayStart },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalPrice' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Last 7 days sales
    const weekSales = await Order.aggregate([
        {
            $match: {
                shop: shop._id,
                createdAt: { $gte: weekAgoStart },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalPrice' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Last month sales
    const monthSales = await Order.aggregate([
        {
            $match: {
                shop: shop._id,
                createdAt: { $gte: monthAgoStart },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$totalPrice' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Daily sales for last 7 days (for chart)
    const dailySales = await Order.aggregate([
        {
            $match: {
                shop: shop._id,
                createdAt: { $gte: weekAgoStart },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                total: { $sum: '$totalPrice' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            today: {
                total: todaySales[0]?.total || 0,
                orders: todaySales[0]?.count || 0
            },
            lastWeek: {
                total: weekSales[0]?.total || 0,
                orders: weekSales[0]?.count || 0
            },
            lastMonth: {
                total: monthSales[0]?.total || 0,
                orders: monthSales[0]?.count || 0
            },
            dailySalesData: dailySales.map(item => ({
                date: item._id,
                sales: item.total,
                orders: item.count
            }))
        }
    });
});

// @desc    Get shopkeeper's dashboard info
// @route   GET /api/shopkeeper/dashboard
// @access  Private/Shopkeeper
export const getShopkeeperDashboard = asyncHandler(async (req, res) => {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    const totalMenuItems = await MenuItem.countDocuments({ shop: shop._id });
    const totalOrders = await Order.countDocuments({ shop: shop._id });
    const pendingOrders = await Order.countDocuments({ shop: shop._id, status: 'pending' });
    const preparingOrders = await Order.countDocuments({ shop: shop._id, status: 'preparing' });

    res.status(200).json({
        success: true,
        data: {
            shop: {
                id: shop._id,
                name: shop.name,
                isActive: shop.isActive,
                isOpen: shop.isOpen
            },
            stats: {
                totalMenuItems,
                totalOrders,
                pendingOrders,
                preparingOrders
            }
        }
    });
});
