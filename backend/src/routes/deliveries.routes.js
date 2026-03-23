import { Router } from 'express'
import {
    assignDelivery,
    getDeliveryByOrder,
    getPartnerDeliveries,
    acceptDelivery,
    markPickedUp,
    markDelivered,
    cancelDelivery,
    getDeliveryStats
} from '../controllers/deliveries.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All delivery routes require authentication
router.use(verifyJWT)

// Assign delivery (admin only)
router.post('/', assignDelivery)

// Get delivery by order ID
router.get('/order/:orderId', getDeliveryByOrder)

// Get all deliveries for a partner
router.get('/', getPartnerDeliveries)

// Accept delivery
router.patch('/:deliveryId/accept', acceptDelivery)

// Mark as picked up
router.patch('/:deliveryId/picked-up', markPickedUp)

// Mark as delivered
router.patch('/:deliveryId/delivered', markDelivered)

// Cancel delivery
router.patch('/:deliveryId/cancel', cancelDelivery)

// Get delivery statistics
router.get('/stats', getDeliveryStats)

export default router
