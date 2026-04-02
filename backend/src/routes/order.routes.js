import { Router } from 'express'
import {
    holdCheckoutReservation,
    getCheckoutReservation,
    releaseCheckoutReservation,
    createOrder,
    getCustomerOrders,
    getShopOrders,
    getOrderById,
    updateOrderStatus,
    updatePayment,
    cancelOrder,
    deleteOrder
} from '../controllers/order.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All order routes require authentication
router.use(verifyJWT)

// Create a new order
router.post('/', createOrder)

// Reserve stock for checkout (10-minute temporary hold)
router.post('/reservations/hold', holdCheckoutReservation)

// Get reservation details
router.get('/reservations/:reservationId', getCheckoutReservation)

// Release reservation manually (cancel/exit checkout)
router.post('/reservations/:reservationId/release', releaseCheckoutReservation)

// Get customer's orders
router.get('/', getCustomerOrders)

// Get shop's orders
router.get('/shop/:shopId', getShopOrders)

// Get order by ID
router.get('/:orderId', getOrderById)

// Update order status
router.patch('/:orderId/status', updateOrderStatus)

// Update payment reference
router.patch('/:orderId/payment', updatePayment)

// Cancel order
router.patch('/:orderId/cancel', cancelOrder)

// Delete order (soft delete - admin only)
router.delete('/:orderId', deleteOrder)

export default router
