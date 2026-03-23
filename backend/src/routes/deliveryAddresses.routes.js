import { Router } from 'express'
import {
    addDeliveryAddress,
    getDeliveryAddresses,
    getDeliveryAddressById,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    setDefaultDeliveryAddress,
    getDefaultDeliveryAddress
} from '../controllers/deliveryAddresses.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// All delivery address routes require authentication
router.use(verifyJWT)

// Add new delivery address
router.post('/', addDeliveryAddress)

// Get all delivery addresses for user
router.get('/', getDeliveryAddresses)

// Get default delivery address
router.get('/default', getDefaultDeliveryAddress)

// Get delivery address by ID
router.get('/:addressId', getDeliveryAddressById)

// Update delivery address
router.patch('/:addressId', updateDeliveryAddress)

// Set as default delivery address
router.patch('/:addressId/set-default', setDefaultDeliveryAddress)

// Delete delivery address
router.delete('/:addressId', deleteDeliveryAddress)

export default router
