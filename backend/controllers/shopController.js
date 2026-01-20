import Shop from '../models/Shop.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
export const getShops = asyncHandler(async (req, res) => {
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

    const shops = await Shop.find(query)
        .populate('owner', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

    const total = await Shop.countDocuments(query);

    res.status(200).json({
        success: true,
        count: shops.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: shops
    });
});

// @desc    Get single shop
// @route   GET /api/shops/:id
// @access  Public
export const getShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id)
        .populate('owner', 'name email phone');

    if (!shop || !shop.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    res.status(200).json({
        success: true,
        data: shop
    });
});

// @desc    Create shop
// @route   POST /api/shops
// @access  Private (Shop Owner/Admin)
export const createShop = asyncHandler(async (req, res) => {
    // Add owner to body
    req.body.owner = req.user.id;

    const shop = await Shop.create(req.body);

    res.status(201).json({
        success: true,
        data: shop
    });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Owner/Admin)
export const updateShop = asyncHandler(async (req, res) => {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    // Make sure user is shop owner or admin
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this shop'
        });
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: shop
    });
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private (Owner/Admin)
export const deleteShop = asyncHandler(async (req, res) => {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found'
        });
    }

    // Make sure user is shop owner or admin
    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this shop'
        });
    }

    // Soft delete
    shop.isActive = false;
    await shop.save();

    res.status(200).json({
        success: true,
        message: 'Shop deleted successfully'
    });
});

// @desc    Get shops by owner
// @route   GET /api/shops/owner/my-shops
// @access  Private (Shop Owner)
export const getMyShops = asyncHandler(async (req, res) => {
    const shops = await Shop.find({ owner: req.user.id });

    res.status(200).json({
        success: true,
        count: shops.length,
        data: shops
    });
});
