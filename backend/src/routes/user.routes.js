import { Router } from 'express'
import {
    registerUser,
    confirmRegistrationOtp,
    resendRegistrationOtp,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    getCurrentUser,
    getUserById,
    updateUserProfile,
    changePassword,
    deleteUser,
    refreshAccessToken
} from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.middleware.js'

const router = Router()

// Public routes
router.post('/register', upload.single('profilePicture'), registerUser)
router.post('/register/confirm-otp', confirmRegistrationOtp)
router.post('/register/resend-otp', resendRegistrationOtp)
router.post('/login', loginUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/refresh-token', refreshAccessToken)

// Protected routes
router.use(verifyJWT) // Apply auth middleware to all routes below this

router.post('/logout', logoutUser)
router.get('/current-user', getCurrentUser)
router.get('/:userId', getUserById)
router.patch('/profile', upload.single('profilePicture'), updateUserProfile)
router.post('/change-password', changePassword)
router.delete('/', deleteUser)

export default router
