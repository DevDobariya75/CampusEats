import { Router } from 'express'
import {
    createShop,
    getAllShops,
    getShopById,
    getMyShop,
    updateShop,
    toggleShopStatus,
    deleteShop,
    deactivateShop,
    activateShop,
    getShopEarnings
} from '../controllers/shops.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// Public routes
router.get('/', getAllShops)

// Protected routes - must come BEFORE generic /:shopId route
// Apply verifyJWT inline for these specific routes
router.get('/my-shop', verifyJWT, getMyShop)
router.get('/earnings', verifyJWT, getShopEarnings)

// Generic public route for getting specific shop by ID (must come after specific routes)
router.get('/:shopId', getShopById)

// Create shop with image upload (protected)
router.post('/', verifyJWT, upload.single('image'), createShop)

// Update shop with optional image upload (protected)
router.patch('/:shopId', verifyJWT, upload.single('image'), updateShop)

// Toggle shop status (protected)
router.patch('/:shopId/toggle', verifyJWT, toggleShopStatus)

// Delete shop (protected)
router.delete('/:shopId', verifyJWT, deleteShop)

// Admin only routes
router.patch('/admin/:shopId/deactivate', verifyJWT, deactivateShop)
router.patch('/admin/:shopId/activate', verifyJWT, activateShop)

export default router
