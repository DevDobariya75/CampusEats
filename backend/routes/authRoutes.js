import express from 'express';
import {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    adminCreateUser
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
    registerValidation,
    loginValidation,
    validate
} from '../middleware/validator.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/admin/create-user', protect, authorize('admin'), registerValidation, validate, adminCreateUser);

export default router;
