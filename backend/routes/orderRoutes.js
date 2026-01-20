import express from 'express';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    orderValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.post('/', protect, orderValidation, validate, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('restaurant_owner', 'admin', 'delivery_person'), updateOrderStatus);
router.put('/:id/cancel', protect, authorize('student'), cancelOrder);

export default router;
