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
    activateShop
} from '../controllers/shops.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// Public routes
router.get('/', getAllShops)
router.get('/:shopId', getShopById)

// Protected routes
router.use(verifyJWT)

// Create shop with image upload
router.post('/', upload.single('image'), createShop)

// Get my shop
router.get('/my-shop', getMyShop)

// Update shop with optional image upload
router.patch('/:shopId', upload.single('image'), updateShop)

// Toggle shop status
router.patch('/:shopId/toggle', toggleShopStatus)

// Delete shop
router.delete('/:shopId', deleteShop)

// Admin only routes
router.patch('/admin/:shopId/deactivate', deactivateShop)
router.patch('/admin/:shopId/activate', activateShop)

export default router
