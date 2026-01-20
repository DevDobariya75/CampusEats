import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';
import crypto from 'crypto';

// @desc    Create shopkeeper account (Admin only)
// @route   POST /api/admin/create-shopkeeper
// @access  Private/Admin
export const createShopkeeper = asyncHandler(async (req, res) => {
    const { name, email, phone, shopName, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'Email already registered'
        });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex');

    // Create shopkeeper account
    const user = await User.create({
        name,
        email,
        password: tempPassword,
        role: 'shop_owner',
        phone,
        address: { campus: address?.campus || 'Main Campus' },
        isActive: true
    });

    // Create shop
    const shop = await Shop.create({
        name: shopName,
        owner: user._id,
        address: {
            campus: address?.campus || 'Main Campus',
            street: address?.street || '',
            building: address?.building || ''
        },
        contact: {
            phone,
            email
        },
        isActive: true,
        isOpen: true
    });

    res.status(201).json({
        success: true,
        message: 'Shopkeeper account created successfully',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                temporaryPassword: tempPassword
            },
            shop: {
                id: shop._id,
                name: shop.name
            }
        }
    });
});

// @desc    Create delivery partner account (Admin only)
// @route   POST /api/admin/create-delivery-partner
// @access  Private/Admin
export const createDeliveryPartner = asyncHandler(async (req, res) => {
    const { name, email, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'Email already registered'
        });
    }

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString('hex');

    // Create delivery partner account
    const user = await User.create({
        name,
        email,
        password: tempPassword,
        role: 'delivery_person',
        phone,
        address: { campus: address?.campus || 'Main Campus' },
        isActive: true
    });

    res.status(201).json({
        success: true,
        message: 'Delivery partner account created successfully',
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            temporaryPassword: tempPassword
        }
    });
});

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (role) {
        query.role = role;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
        ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
        .select('-password')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Get all shops (Admin only)
// @route   GET /api/admin/shops
// @access  Private/Admin
export const getAllShopsAdmin = asyncHandler(async (req, res) => {
    const { search, status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { 'contact.email': { $regex: search, $options: 'i' } }
        ];
    }

    if (status === 'active') {
        query.isActive = true;
    } else if (status === 'inactive') {
        query.isActive = false;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const shops = await Shop.find(query)
        .populate('owner', 'name email phone')
        .limit(limitNum)
        .skip(skip)
        .sort({ createdAt: -1 });

    const total = await Shop.countDocuments(query);

    res.status(200).json({
        success: true,
        data: shops,
        pagination: {
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    });
});

// @desc    Toggle shop status (Admin only)
// @route   PUT /api/admin/shops/:id/toggle-status
// @access  Private/Admin
export const toggleShopStatus = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    shop.isActive = !shop.isActive;
    await shop.save();

    res.status(200).json({
        success: true,
        message: `Shop ${shop.isActive ? 'enabled' : 'disabled'} successfully`,
        data: shop
    });
});

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
    const { status, shop, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
        query.status = status;
    }

    if (shop) {
        query.shop = shop;
    }

    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('shop', 'name')
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

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalShops = await Shop.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$totalPrice' }
            }
        }
    ]);

    const todayOrders = await Order.countDocuments({
        createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
    });

    const usersByRole = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalUsers,
            totalShops,
            totalOrders,
            todayOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        }
    });
});

// @desc    Disable user account (Admin only)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: user
    });
});
