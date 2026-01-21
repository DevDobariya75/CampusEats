import express from 'express';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder,
    getAvailableOrders,
    acceptOrderForDelivery,
    markOrderDelivered
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    orderValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.post('/', protect, orderValidation, validate, createOrder);
router.get('/', protect, getOrders);

// Delivery partner specific (must be before :id routes)
router.get('/delivery/available', protect, authorize('delivery_partner'), getAvailableOrders);
router.put('/:id/accept', protect, authorize('delivery_partner'), acceptOrderForDelivery);
router.put('/:id/deliver', protect, authorize('delivery_partner'), markOrderDelivered);

router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('shopkeeper', 'admin'), updateOrderStatus);
router.put('/:id/cancel', protect, authorize('customer'), cancelOrder);

export default router;
