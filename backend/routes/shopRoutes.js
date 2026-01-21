import express from 'express';
import {
    getShops,
    getShop,
    createShop,
    updateShop,
    deleteShop,
    getMyShops
} from '../controllers/shopController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    shopValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.get('/', getShops);
router.get('/:id', getShop);
router.get('/owner/my-shops', protect, authorize('shopkeeper', 'admin'), getMyShops);

router.post('/', protect, authorize('shopkeeper', 'admin'), shopValidation, validate, createShop);
router.put('/:id', protect, authorize('shopkeeper', 'admin'), shopValidation, validate, updateShop);
router.delete('/:id', protect, authorize('shopkeeper', 'admin'), deleteShop);

export default router;
