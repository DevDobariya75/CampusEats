import Restaurant from '../models/Restaurant.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = asyncHandler(async (req, res) => {
    const {
        search,
        cuisine,
        minRating,
        isOpen,
        campus,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (cuisine) {
        query.cuisine = { $in: cuisine.split(',') };
    }

    if (minRating) {
        query.rating = { $gte: parseFloat(minRating) };
    }

    if (isOpen === 'true') {
        query.isOpen = true;
    }

    if (campus) {
        query['address.campus'] = campus;
    }

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const restaurants = await Restaurant.find(query)
        .populate('owner', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

    const total = await Restaurant.countDocuments(query);

    res.status(200).json({
        success: true,
        count: restaurants.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: restaurants
    });
});

// @desc    Get single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id)
        .populate('owner', 'name email phone');

    if (!restaurant || !restaurant.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant Owner/Admin)
export const createRestaurant = asyncHandler(async (req, res) => {
    // Add owner to body
    req.body.owner = req.user.id;

    const restaurant = await Restaurant.create(req.body);

    res.status(201).json({
        success: true,
        data: restaurant
    });
});

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Owner/Admin)
export const updateRestaurant = asyncHandler(async (req, res) => {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this restaurant'
        });
    }

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: restaurant
    });
});

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Owner/Admin)
export const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            message: 'Restaurant not found'
        });
    }

    // Make sure user is restaurant owner or admin
    if (restaurant.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this restaurant'
        });
    }

    // Soft delete
    restaurant.isActive = false;
    await restaurant.save();

    res.status(200).json({
        success: true,
        message: 'Restaurant deleted successfully'
    });
});

// @desc    Get restaurants by owner
// @route   GET /api/restaurants/owner/my-restaurants
// @access  Private (Restaurant Owner)
export const getMyRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ owner: req.user.id });

    res.status(200).json({
        success: true,
        count: restaurants.length,
        data: restaurants
    });
});
