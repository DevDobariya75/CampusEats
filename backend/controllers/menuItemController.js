import MenuItem from '../models/MenuItem.js';
import Restaurant from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all menu items (with optional filters)
// @route   GET /api/menu-items
// @access  Public
export const getMenuItems = asyncHandler(async (req, res) => {
    const {
        restaurant,
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

    if (restaurant) {
        query.restaurant = restaurant;
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
        .populate('restaurant', 'name image')
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
        .populate('restaurant', 'name image address rating');

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
// @access  Private (Restaurant Owner/Admin)
export const createMenuItem = asyncHandler(async (req, res) => {
    // Verify restaurant exists and user owns it
    const restaurant = await Restaurant.findById(req.body.restaurant);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to add menu items to this restaurant'
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
// @access  Private (Restaurant Owner/Admin)
export const updateMenuItem = asyncHandler(async (req, res) => {
    let menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
// @access  Private (Restaurant Owner/Admin)
export const deleteMenuItem = asyncHandler(async (req, res) => {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
        return res.status(404).json({
            success: false,
            message: 'Menu item not found'
        });
    }

    // Verify ownership
    if (menuItem.restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @desc    Get menu items by restaurant
// @route   GET /api/menu-items/restaurant/:restaurantId
// @access  Public
export const getMenuItemsByRestaurant = asyncHandler(async (req, res) => {
    const menuItems = await MenuItem.find({
        restaurant: req.params.restaurantId,
        isAvailable: true
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
        success: true,
        count: menuItems.length,
        data: menuItems
    });
});
