import express from 'express';
import {
    getMenuItems,
    getMenuItem,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenuItemsByShop
} from '../controllers/menuItemController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    menuItemValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.get('/', getMenuItems);
router.get('/shop/:shopId', getMenuItemsByShop);
router.get('/:id', getMenuItem);

router.post('/', protect, authorize('shop_owner', 'admin'), menuItemValidation, validate, createMenuItem);
router.put('/:id', protect, authorize('shop_owner', 'admin'), menuItemValidation, validate, updateMenuItem);
router.delete('/:id', protect, authorize('shop_owner', 'admin'), deleteMenuItem);

export default router;
