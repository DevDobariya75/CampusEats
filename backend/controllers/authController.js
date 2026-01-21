import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: 'customer', // public self-signup is always customer
        phone,
        address
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address
        }
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            message: 'Account is inactive. Please contact administrator.'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar
        }
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        avatar: req.body.avatar
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return res.status(401).json({
            success: false,
            message: 'Password is incorrect'
        });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        token,
        message: 'Password updated successfully'
    });
});

// @desc    Admin creates a user with a specific role (shopkeeper/delivery_partner/admin/customer)
// @route   POST /api/auth/admin/create-user
// @access  Private (Admin)
export const adminCreateUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, address } = req.body;

    if (!['customer', 'shopkeeper', 'admin', 'delivery_partner'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, role, phone, address });
    res.status(201).json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});
