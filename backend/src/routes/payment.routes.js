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

// Get payment statistics (MUST be before /:paymentId route!)
router.get('/stats', getPaymentStats)

// Create a new payment
router.post('/', createPayment)

// Get all customer's payments
router.get('/', getCustomerPayments)

// Get payments by order ID
router.get('/order/:orderId', getPaymentsByOrder)

// Get payment by ID (MUST be after specific routes!)
router.get('/:paymentId', getPaymentById)

// Update payment status
router.patch('/:paymentId/status', updatePaymentStatus)

// Verify UPI payment
router.post('/:paymentId/verify-upi', verifyUPIPayment)

export default router
