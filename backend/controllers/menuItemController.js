import MenuItem from '../models/MenuItem.js';
import Shop from '../models/Shop.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all menu items (with optional filters)
// @route   GET /api/menu-items
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
    const {
        shop,
        category,
        search,
        isVegetarian,
        isVegan,
        isSpicy,
        isAvailable,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (shop) {
        query.shop = shop;
    }

    if (category) {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (isVegetarian === 'true') {
        query.isVegetarian = true;
    }

    if (isVegan === 'true') {
        query.isVegan = true;
    }

    if (isSpicy === 'true') {
        query.isSpicy = true;
    }

    if (isAvailable !== undefined) {
        query.isAvailable = isAvailable === 'true';
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const menuItems = await MenuItem.find(query)
        .populate('shop', 'name image')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

    const total = await MenuItem.countDocuments(query);

    res.status(200).json({
        success: true,
        count: menuItems.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: menuItems
    });
});

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Public
export const getMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id)
        .populate('shop', 'name image address rating');

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    res.status(200).json({
        success: true,
        data: menuItem
    });
});

// @desc    Create menu item
// @route   POST /api/menu-items
// @access  Private (Shop Owner/Admin)
export const createMenuItem = asyncHandler(async (req, res) => {
    // Verify shop exists and user owns it
    const shop = await Shop.findById(req.body.shop);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to add menu items to this shop'
        });
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
        success: true,
        data: menuItem
    });
});

// @desc    Update menu item
// @route   PUT /api/menu-items/:id
// @access  Private (Shop Owner/Admin)
export const updateMenuItem = asyncHandler(async (req, res) => {
    let menuItem = await MenuItem.findById(req.params.id).populate('shop');

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    if (menuItem.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this menu item'
        });
    }

    menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: menuItem
    });
});

// @desc    Delete menu item
// @route   DELETE /api/menu-items/:id
// @access  Private (Shop Owner/Admin)
export const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id).populate('shop');

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    if (menuItem.shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this menu item'
        });
    }

    await menuItem.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Menu item deleted successfully'
    });
});

// @desc    Get menu items by shop
// @route   GET /api/menu-items/shop/:shopId
// @access  Public
export const getMenuItemsByShop = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({
        shop: req.params.shopId,
        isAvailable: true
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: menuItems.length,
        data: menuItems
    });
});
