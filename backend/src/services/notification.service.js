import Notification from '../models/notifications.model.js'

export const createSystemNotification = async ({ recipientId, title, message, type = 'General', relatedOrder = null }) => {
  if (!recipientId || !title || !message) {
    return null
  }

  return Notification.create({
    recipient: recipientId,
    title,
    message,
    type,
    relatedOrder,
    isRead: false,
    isDeleted: false,
  })
}

export const createBulkSystemNotifications = async ({ recipientIds = [], title, message, type = 'General', relatedOrder = null }) => {
  const uniqueRecipientIds = [...new Set(recipientIds.filter(Boolean).map((id) => id.toString()))]
  if (!uniqueRecipientIds.length || !title || !message) {
    return []
  }

  const docs = uniqueRecipientIds.map((recipient) => ({
    recipient,
    title,
    message,
    type,
    relatedOrder,
    isRead: false,
    isDeleted: false,
  }))

  return Notification.insertMany(docs)
}
