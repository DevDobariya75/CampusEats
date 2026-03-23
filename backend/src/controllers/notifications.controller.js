import Notification from "../models/notifications.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create Notification
const createNotification = asyncHandler(async (req, res) => {
    const { recipientId, title, message, type, relatedOrder } = req.body

    // Validation
    if (!recipientId) {
        throw new ApiError(400, "Recipient ID is required")
    }

    if (!title) {
        throw new ApiError(400, "Notification title is required")
    }

    if (!message) {
        throw new ApiError(400, "Notification message is required")
    }

    if (!type) {
        throw new ApiError(400, "Notification type is required")
    }

    const validTypes = ['Order Update', 'Promotion', 'General']
    if (!validTypes.includes(type)) {
        throw new ApiError(400, `Invalid notification type. Must be one of: ${validTypes.join(', ')}`)
    }

    const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        relatedOrder: relatedOrder || null,
        isRead: false,
        isDeleted: false
    })

    const populatedNotification = await Notification.findById(notification._id)
        .populate('recipient', 'name email')
        .populate('relatedOrder', '_id status')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedNotification, "Notification created successfully"))
})

// Get All Notifications for User
const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    const { isRead, type } = req.query

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const filter = {
        recipient: userId,
        isDeleted: false
    }

    if (isRead !== undefined) {
        filter.isRead = isRead === 'true'
    }

    if (type) {
        filter.type = type
    }

    const notifications = await Notification.find(filter)
        .populate('recipient', 'name email')
        .populate('relatedOrder', '_id status')
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, notifications, "Notifications fetched successfully"))
})

// Get Notification by ID
const getNotificationById = asyncHandler(async (req, res) => {
    const { notificationId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!notificationId) {
        throw new ApiError(400, "Notification ID is required")
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
        isDeleted: false
    })
        .populate('recipient', 'name email')
        .populate('relatedOrder', '_id status')

    if (!notification) {
        throw new ApiError(404, "Notification not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, notification, "Notification fetched successfully"))
})

// Mark Notification as Read
const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!notificationId) {
        throw new ApiError(400, "Notification ID is required")
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
        isDeleted: false
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found")
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { isRead: true } },
        { new: true }
    )
        .populate('recipient', 'name email')
        .populate('relatedOrder', '_id status')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedNotification, "Notification marked as read"))
})

// Mark All Notifications as Read
const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const result = await Notification.updateMany(
        {
            recipient: userId,
            isDeleted: false,
            isRead: false
        },
        { $set: { isRead: true } }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, { modifiedCount: result.modifiedCount }, "All notifications marked as read"))
})

// Mark Notification as Unread
const markAsUnread = asyncHandler(async (req, res) => {
    const { notificationId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!notificationId) {
        throw new ApiError(400, "Notification ID is required")
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
        isDeleted: false
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found")
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { isRead: false } },
        { new: true }
    )
        .populate('recipient', 'name email')
        .populate('relatedOrder', '_id status')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedNotification, "Notification marked as unread"))
})

// Delete Notification (soft delete)
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!notificationId) {
        throw new ApiError(400, "Notification ID is required")
    }

    const notification = await Notification.findOne({
        _id: notificationId,
        recipient: userId,
        isDeleted: false
    })

    if (!notification) {
        throw new ApiError(404, "Notification not found")
    }

    const deletedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { $set: { isDeleted: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deletedNotification, "Notification deleted successfully"))
})

// Delete All Notifications for User
const deleteAllNotifications = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const result = await Notification.updateMany(
        {
            recipient: userId,
            isDeleted: false
        },
        { $set: { isDeleted: true } }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedCount: result.modifiedCount }, "All notifications deleted successfully"))
})

// Get Unread Count
const getUnreadCount = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isDeleted: false,
        isRead: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, { unreadCount }, "Unread count fetched successfully"))
})

export {
    createNotification,
    getUserNotifications,
    getNotificationById,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    deleteAllNotifications,
    getUnreadCount
}
