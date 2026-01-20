import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    createShopkeeper,
    createDeliveryPartner,
    getAllUsers,
    getAllShopsAdmin,
    toggleShopStatus,
    getAllOrdersAdmin,
    getAdminStats,
    toggleUserStatus
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// User management
router.post('/create-shopkeeper', createShopkeeper);
router.post('/create-delivery-partner', createDeliveryPartner);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Shop management
router.get('/shops', getAllShopsAdmin);
router.put('/shops/:id/toggle-status', toggleShopStatus);

// Order management
router.get('/orders', getAllOrdersAdmin);

// Dashboard & stats
router.get('/stats', getAdminStats);

export default router;
