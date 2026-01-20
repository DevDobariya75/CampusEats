import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getShopkeeperMenuItems,
    getShopkeeperOrders,
    updateOrderStatus,
    getShopkeeperSales,
    getShopkeeperDashboard
} from '../controllers/shopkeeperController.js';

const router = express.Router();

// Protect all shopkeeper routes
router.use(protect);
router.use(authorize('shop_owner'));

// Dashboard
router.get('/dashboard', getShopkeeperDashboard);

// Menu items management
router.get('/menu-items', getShopkeeperMenuItems);
router.post('/menu-items', addMenuItem);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

// Orders management
router.get('/orders', getShopkeeperOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Sales stats
router.get('/sales', getShopkeeperSales);

export default router;
