import Review from '../models/Review.js';
import Shop from '../models/Shop.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res) => {
    const { shop, menuItem, page = 1, limit = 10 } = req.query;

    const query = {};

    if (shop) {
        query.shop = shop;
    }

    if (menuItem) {
        query.menuItem = menuItem;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find(query)
        .populate('user', 'name avatar')
        .populate('shop', 'name')
        .populate('menuItem', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.status(200).json({
        success: true,
        count: reviews.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        data: reviews
    });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id)
        .populate('user', 'name avatar')
        .populate('shop', 'name')
        .populate('menuItem', 'name');

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found'
        });
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
    const { shop, menuItem, order, rating, comment, images } = req.body;

    // Verify user has ordered from this shop/menu item
    if (order) {
        const orderData = await Order.findById(order);
        if (!orderData || orderData.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to review this order'
            });
        }
        req.body.isVerified = true;
    }

    // Check if review already exists
    const existingReviewQuery = {
        user: req.user.id
    };

    if (shop) {
        existingReviewQuery.shop = shop;
        if (order) {
            existingReviewQuery.order = order;
        }
    }

    if (menuItem) {
        existingReviewQuery.menuItem = menuItem;
    }

    const existingReview = await Review.findOne(existingReviewQuery);

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: 'Review already exists for this item'
        });
    }

    req.body.user = req.user.id;
    const review = await Review.create(req.body);

    // Update shop rating if shop review
    if (shop) {
        await updateShopRating(shop);
    }

    // Update menu item rating if menu item review
    if (menuItem) {
        await updateMenuItemRating(menuItem);
    }

    const populatedReview = await Review.findById(review._id)
        .populate('user', 'name avatar')
        .populate('shop', 'name')
        .populate('menuItem', 'name');

    res.status(201).json({
        success: true,
        data: populatedReview
    });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
    let review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found'
        });
    }

    // Make sure user owns the review
    if (review.user.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this review'
        });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('user', 'name avatar');

    // Update ratings
    if (review.shop) {
        await updateShopRating(review.shop);
    }

    if (review.menuItem) {
        await updateMenuItemRating(review.menuItem);
    }

    res.status(200).json({
        success: true,
        data: review
    });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: 'Review not found'
        });
    }

    // Make sure user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this review'
        });
    }

    const shopId = review.shop;
    const menuItemId = review.menuItem;

    await review.deleteOne();

    // Update ratings
    if (shopId) {
        await updateShopRating(shopId);
    }

    if (menuItemId) {
        await updateMenuItemRating(menuItemId);
    }

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});

// Helper function to update shop rating
const updateShopRating = async (shopId) => {
    const reviews = await Review.find({ shop: shopId });
    
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        await Shop.findByIdAndUpdate(shopId, {
            rating: parseFloat(avgRating.toFixed(2)),
            numReviews: reviews.length
        });
    }
};

// Helper function to update menu item rating
const updateMenuItemRating = async (menuItemId) => {
    const reviews = await Review.find({ menuItem: menuItemId });
    
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
        await MenuItem.findByIdAndUpdate(menuItemId, {
            rating: parseFloat(avgRating.toFixed(2)),
            numReviews: reviews.length
        });
    }
};
