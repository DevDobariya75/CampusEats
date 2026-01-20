import express from 'express';
import {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import {
    reviewValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.get('/', getReviews);
router.get('/:id', getReview);

router.post('/', protect, reviewValidation, validate, createReview);
router.put('/:id', protect, reviewValidation, validate, updateReview);
router.delete('/:id', protect, deleteReview);

export default router;
