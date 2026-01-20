import express from 'express';
import {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemsByRestaurant
} from '../controllers/menuItemController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    menuItemValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/restaurant/:restaurantId', getMenuItemsByRestaurant);
router.get('/:id', getMenuItem);

router.post('/', protect, authorize('restaurant_owner', 'admin'), menuItemValidation, validate, createMenuItem);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), menuItemValidation, validate, updateMenuItem);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteMenuItem);

export default router;
