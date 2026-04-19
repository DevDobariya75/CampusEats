import { Router } from 'express'
import {
    assignDelivery,
    getDeliveryByOrder,
    getPartnerDeliveries,
    acceptDelivery,
    markPickedUp,
    markDelivered,
    cancelDelivery,
    getDeliveryStats,
    getPartnerEarnings
} from '../controllers/deliveries.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All delivery routes require authentication
router.use(verifyJWT)

// Specific routes - must come BEFORE generic ones
// Get delivery statistics
router.get('/stats', getDeliveryStats)

// Get delivery partner earnings
router.get('/partner/earnings', getPartnerEarnings)

// Assign delivery (admin only)
router.post('/', assignDelivery)

// Get delivery by order ID
router.get('/order/:orderId', getDeliveryByOrder)

// Get all deliveries for a partner (must come after specific /:deliveryId routes)
router.get('/', getPartnerDeliveries)

// Accept delivery
router.patch('/:deliveryId/accept', acceptDelivery)

// Mark as picked up
router.patch('/:deliveryId/picked-up', markPickedUp)

// Mark as delivered
router.patch('/:deliveryId/delivered', markDelivered)

// Cancel delivery
router.patch('/:deliveryId/cancel', cancelDelivery)

export default router
