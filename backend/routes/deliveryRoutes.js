import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getAvailableOrders,
    acceptOrder,
    updateDeliveryStatus,
    getMyDeliveryOrders,
    getDeliveryDashboard,
    getDeliveryOrderDetails
} from '../controllers/deliveryController.js';

const router = express.Router();

// Protect all delivery routes
router.use(protect);
router.use(authorize('delivery_person'));

// Dashboard
router.get('/dashboard', getDeliveryDashboard);

// Available orders
router.get('/available-orders', getAvailableOrders);

// My orders
router.get('/my-orders', getMyDeliveryOrders);

// Order operations
router.post('/orders/:id/accept', acceptOrder);
router.put('/orders/:id/status', updateDeliveryStatus);
router.get('/orders/:id', getDeliveryOrderDetails);

export default router;
