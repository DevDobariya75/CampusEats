import { Router } from 'express'
import {
    createPayment,
    getPaymentById,
    getPaymentsByOrder,
    getCustomerPayments,
    updatePaymentStatus,
    verifyUPIPayment,
    getPaymentStats
} from '../controllers/payment.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All payment routes require authentication
router.use(verifyJWT)

// Create a new payment
router.post('/', createPayment)

// Get payment by ID
router.get('/:paymentId', getPaymentById)

// Get all customer's payments
router.get('/', getCustomerPayments)

// Get payments by order ID
router.get('/order/:orderId', getPaymentsByOrder)

// Update payment status
router.patch('/:paymentId/status', updatePaymentStatus)

// Verify UPI payment
router.post('/:paymentId/verify-upi', verifyUPIPayment)

// Get payment statistics
router.get('/stats', getPaymentStats)

export default router
