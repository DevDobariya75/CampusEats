import { body, validationResult } from 'express-validator';

// Check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['student', 'restaurant_owner', 'admin', 'delivery_person']).withMessage('Invalid role')
];

// User login validation
export const loginValidation = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Restaurant validation
export const restaurantValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Restaurant name is required')
        .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 }).withMessage('Description cannot be more than 500 characters'),
    body('cuisine')
        .optional()
        .isArray().withMessage('Cuisine must be an array'),
    body('deliveryTime')
        .optional()
        .isInt({ min: 10, max: 120 }).withMessage('Delivery time must be between 10 and 120 minutes'),
    body('deliveryFee')
        .optional()
        .isFloat({ min: 0 }).withMessage('Delivery fee must be a positive number')
];

// Menu item validation
export const menuItemValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Menu item name is required')
        .isLength({ max: 100 }).withMessage('Name cannot be more than 100 characters'),
    body('restaurant')
        .notEmpty().withMessage('Restaurant ID is required')
        .isMongoId().withMessage('Invalid restaurant ID'),
    body('price')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category')
        .isIn(['appetizer', 'main_course', 'dessert', 'beverage', 'combo', 'other']).withMessage('Invalid category'),
    body('description')
        .optional()
        .isLength({ max: 300 }).withMessage('Description cannot be more than 300 characters')
];

// Order validation
export const orderValidation = [
    body('restaurant')
        .notEmpty().withMessage('Restaurant ID is required')
        .isMongoId().withMessage('Invalid restaurant ID'),
    body('orderItems')
        .isArray({ min: 1 }).withMessage('Order must have at least one item'),
    body('orderItems.*.menuItem')
        .notEmpty().withMessage('Menu item ID is required')
        .isMongoId().withMessage('Invalid menu item ID'),
    body('orderItems.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('paymentMethod')
        .isIn(['card', 'cash', 'campus_card', 'online']).withMessage('Invalid payment method'),
    body('deliveryAddress')
        .optional()
        .isObject().withMessage('Delivery address must be an object')
];

// Review validation
export const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .optional()
        .isLength({ max: 500 }).withMessage('Comment cannot be more than 500 characters'),
    body('restaurant')
        .optional()
        .isMongoId().withMessage('Invalid restaurant ID'),
    body('menuItem')
        .optional()
        .isMongoId().withMessage('Invalid menu item ID')
];
