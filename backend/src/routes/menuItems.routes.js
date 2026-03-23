import { Router } from 'express'
import {
    addMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    toggleItemAvailability,
    deleteMenuItem,
    updateStock
} from '../controllers/menuItems.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// Get menu items for a shop (public)
router.get('/:shopId', getMenuItems)

// Get menu item by ID (public)
router.get('/:shopId/item/:itemId', getMenuItemById)

// Protected routes
router.use(verifyJWT)

// Add new menu item with image upload
router.post('/:shopId', upload.single('image'), addMenuItem)

// Update menu item with image upload
router.patch('/:shopId/item/:itemId', upload.single('image'), updateMenuItem)

// Toggle item availability
router.patch('/:shopId/item/:itemId/toggle', toggleItemAvailability)

// Update stock
router.patch('/:shopId/item/:itemId/stock', updateStock)

// Delete menu item
router.delete('/:shopId/item/:itemId', deleteMenuItem)

export default router
