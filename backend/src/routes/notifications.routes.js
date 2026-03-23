import { Router } from 'express'
import {
    createNotification,
    getUserNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
} from '../controllers/notifications.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

// Protected routes
router.use(verifyJWT)

// Create notification
router.post('/', createNotification)

// Get all notifications for user
router.get('/', getUserNotifications)

// Get unread count
router.get('/unread-count', getUnreadCount)

// Get notification by ID
router.get('/:notificationId', getNotificationById)

// Mark notification as read
router.patch('/:notificationId/read', markAsRead)

// Mark notification as unread
router.patch('/:notificationId/unread', markAsUnread)

// Mark all notifications as read
router.patch('/read-all', markAllAsRead)

// Delete notification
router.delete('/:notificationId', deleteNotification)

// Delete all notifications
router.delete('/delete-all', deleteAllNotifications)

export default router
