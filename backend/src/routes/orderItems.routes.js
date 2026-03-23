import { Router } from 'express'
import {
    createOrderItems,
    getOrderItems,
    getOrderItemById,
    updateOrderItemQuantity,
    deleteOrderItem
} from '../controllers/orderItems.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All order items routes require authentication
router.use(verifyJWT)

// Create order items
router.post('/', createOrderItems)

// Get all items for an order
router.get('/:orderId', getOrderItems)

// Get specific order item
router.get('/:orderId/item/:itemId', getOrderItemById)

// Update order item quantity
router.patch('/:orderId/item/:itemId', updateOrderItemQuantity)

// Delete order item
router.delete('/:orderId/item/:itemId', deleteOrderItem)

export default router
