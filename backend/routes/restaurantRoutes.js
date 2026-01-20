import express from 'express';
import {
    getRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    restaurantValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/:id', getRestaurant);
router.get('/owner/my-restaurants', protect, authorize('restaurant_owner', 'admin'), getMyRestaurants);

router.post('/', protect, authorize('restaurant_owner', 'admin'), restaurantValidation, validate, createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), restaurantValidation, validate, updateRestaurant);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteRestaurant);

export default router;
