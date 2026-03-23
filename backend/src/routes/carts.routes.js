import { Router } from 'express'
import {
    getOrCreateCart,
    getCartItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    getCartSummary
} from '../controllers/carts.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All cart routes require authentication
router.use(verifyJWT)

// Get or create cart for a shop
router.get('/:shopId', getOrCreateCart)

// Get all cart items for a shop
router.get('/:shopId/items', getCartItems)

// Add item to cart
router.post('/:shopId/items', addItemToCart)

// Update cart item quantity
router.patch('/:shopId/items/:itemId', updateCartItemQuantity)

// Remove item from cart
router.delete('/:shopId/items/:itemId', removeCartItem)

// Get cart summary
router.get('/:shopId/summary', getCartSummary)

// Clear entire cart
router.delete('/:shopId', clearCart)

export default router
