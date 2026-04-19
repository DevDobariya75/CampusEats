import mongoose from 'mongoose'
import Delivery from '../models/deliveries.model.js'
import Order from '../models/order.model.js'
import User from '../models/users.model.js'
import { ApiError } from '../utils/ApiError.js'
import { createSystemNotification } from './notification.service.js'

const isTransactionUnsupportedError = (error) => {
  const message = error?.message || ''
  return (
    message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
    message.includes('replica set')
  )
}

const safeAbortTransaction = async (session) => {
  try {
    await session.abortTransaction()
  } catch {
    // Ignore abort failures so fallback logic can still run.
  }
}

const safeNotify = async (payload) => {
  try {
    await createSystemNotification(payload)
  } catch {
    // Notification failures should not block core delivery flow.
  }
}

const notifyAssignedPartner = async ({ partner, orderId }) => {
  if (!partner?._id) {
    return
  }

  const shortOrderId = orderId?.toString().slice(-6) || ''
  const atCapacity = Number(partner.currentOrders || 0) >= Number(partner.maxOrders || 4)
  const almostFull = Number(partner.currentOrders || 0) >= Math.max(Number(partner.maxOrders || 4) - 1, 1)

  let message = `You have a new delivery request. Order #${shortOrderId} has been assigned to you.`
  if (atCapacity) {
    message = `${message} You are now at full capacity. Please complete current deliveries first.`
  } else if (almostFull) {
    message = `${message} Hurry up, you have only a few delivery slots left.`
  }

  await safeNotify({
    recipientId: partner._id,
    title: 'New delivery assigned',
    message,
    type: 'Order Update',
    relatedOrder: orderId,
  })
}

const decrementPartnerLoad = async (partnerId, session = null) => {
  if (!partnerId) {
    return
  }

  let partnerQuery = User.findById(partnerId).select('currentOrders')
  if (session) {
    partnerQuery = partnerQuery.session(session)
  }

  const partner = await partnerQuery
  if (!partner) {
    return
  }

  const nextCurrentOrders = Math.max((partner.currentOrders || 0) - 1, 0)
  const updateOptions = session ? { session, returnDocument: 'after' } : { returnDocument: 'after' }
  await User.findByIdAndUpdate(partnerId, { $set: { currentOrders: nextCurrentOrders } }, updateOptions)
}

const assignDeliveryPartnerWithoutTransaction = async (orderId) => {
  const order = await Order.findOne({ _id: orderId, isDeleted: false })
  if (!order) {
    throw new ApiError(404, 'Order not found for assignment')
  }

  if (order.deliveryPartnerId) {
    return {
      assigned: true,
      deliveryPartnerId: order.deliveryPartnerId,
      message: 'Delivery partner already assigned',
    }
  }

  const partner = await User.findOneAndUpdate(
    {
      role: 'delivery',
      isActive: true,
      isDeleted: false,
      $expr: {
        $lt: [{ $ifNull: ['$currentOrders', 0] }, { $ifNull: ['$maxOrders', 4] }],
      },
    },
    { $inc: { currentOrders: 1 } },
    {
      returnDocument: 'after',
      sort: { currentOrders: 1, _id: 1 },
    },
  )

  if (!partner) {
    return {
      assigned: false,
      deliveryPartnerId: null,
      message: 'No delivery partners available right now',
    }
  }

  const assignedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      isDeleted: false,
      $or: [{ deliveryPartnerId: null }, { deliveryPartnerId: { $exists: false } }],
    },
    { $set: { deliveryPartnerId: partner._id } },
    { returnDocument: 'after' },
  )

  if (!assignedOrder) {
    await User.findByIdAndUpdate(partner._id, { $inc: { currentOrders: -1 } })
    const latestOrder = await Order.findById(orderId)
    return {
      assigned: Boolean(latestOrder?.deliveryPartnerId),
      deliveryPartnerId: latestOrder?.deliveryPartnerId || null,
      message: latestOrder?.deliveryPartnerId
        ? 'Delivery partner already assigned'
        : 'Delivery assignment is pending',
    }
  }

  const existingDelivery = await Delivery.findOne({ order: orderId, isDeleted: false })
  if (!existingDelivery) {
    await Delivery.create({
      deliveryPartner: partner._id,
      order: orderId,
      status: 'Assigned',
      isDeleted: false,
    })
  }

  await notifyAssignedPartner({ partner, orderId })

  return {
    assigned: true,
    deliveryPartnerId: partner._id,
    message: 'Delivery partner assigned successfully',
  }
}

const markOrderDeliveredWithoutTransaction = async (orderId) => {
  const order = await Order.findOne({ _id: orderId, isDeleted: false })
  if (!order) {
    throw new ApiError(404, 'Order not found')
  }

  if (order.deliveryPartnerId) {
    await decrementPartnerLoad(order.deliveryPartnerId)
  }

  await Order.findByIdAndUpdate(orderId, { $set: { status: 'Delivered' } }, { returnDocument: 'after' })

  await Delivery.findOneAndUpdate(
    { order: orderId, isDeleted: false },
    { 
      $set: { 
        status: 'Delivered', 
        deliveredAt: new Date(),
        earningsAmount: 5,  // Rs 5 for delivery partner
        paymentStatus: 'Completed',
        paidAt: new Date()
      } 
    },
    { returnDocument: 'after' },
  )

  // Update delivery partner earnings in User model (without transaction fallback)
  if (order.deliveryPartnerId) {
    await User.findByIdAndUpdate(
      order.deliveryPartnerId,
      {
        $inc: {
          totalEarnings: 5,
          totalDeliveryChargeEarnings: 5
        }
      }
    )
  }

  return {
    success: true,
    message: 'Order delivered and delivery load updated',
  }
}

export const assignDeliveryPartner = async (orderId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const order = await Order.findOne({ _id: orderId, isDeleted: false }).session(session)
    if (!order) {
      throw new ApiError(404, 'Order not found for assignment')
    }

    if (order.deliveryPartnerId) {
      await session.commitTransaction()
      return {
        assigned: true,
        deliveryPartnerId: order.deliveryPartnerId,
        message: 'Delivery partner already assigned',
      }
    }

    const partner = await User.findOneAndUpdate(
      {
        role: 'delivery',
        isActive: true,
        isDeleted: false,
        $expr: {
          $lt: [
            { $ifNull: ['$currentOrders', 0] },
            { $ifNull: ['$maxOrders', 4] },
          ],
        },
      },
      { $inc: { currentOrders: 1 } },
      {
        returnDocument: 'after',
        session,
        sort: { currentOrders: 1, _id: 1 },
      },
    )

    if (!partner) {
      await session.commitTransaction()
      return {
        assigned: false,
        deliveryPartnerId: null,
        message: 'No delivery partners available right now',
      }
    }

    order.deliveryPartnerId = partner._id
    await order.save({ session })

    await Delivery.create(
      [
        {
          deliveryPartner: partner._id,
          order: order._id,
          status: 'Assigned',
          isDeleted: false,
        },
      ],
      { session },
    )

    await session.commitTransaction()

    await notifyAssignedPartner({ partner, orderId: order._id })

    return {
      assigned: true,
      deliveryPartnerId: partner._id,
      message: 'Delivery partner assigned successfully',
    }
  } catch (error) {
    await safeAbortTransaction(session)
    if (isTransactionUnsupportedError(error)) {
      return assignDeliveryPartnerWithoutTransaction(orderId)
    }
    throw error
  } finally {
    session.endSession()
  }
}

export const markOrderDelivered = async (orderId) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const order = await Order.findOne({ _id: orderId, isDeleted: false }).session(session)
    if (!order) {
      throw new ApiError(404, 'Order not found')
    }

    if (order.deliveryPartnerId) {
      await decrementPartnerLoad(order.deliveryPartnerId, session)
    }

    await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: 'Delivered' } },
      { session, returnDocument: 'after' },
    )

    // Update delivery and add earnings amount
    await Delivery.findOneAndUpdate(
      { order: orderId, isDeleted: false },
      { 
        $set: { 
          status: 'Delivered', 
          deliveredAt: new Date(),
          earningsAmount: 5,  // Rs 5 for delivery partner
          paymentStatus: 'Completed',
          paidAt: new Date()
        } 
      },
      { session, returnDocument: 'after' },
    )

    // Update delivery partner earnings in User model
    if (order.deliveryPartnerId) {
      await User.findByIdAndUpdate(
        order.deliveryPartnerId,
        {
          $inc: {
            totalEarnings: 5,
            totalDeliveryChargeEarnings: 5
          }
        },
        { session }
      )
    }

    await session.commitTransaction()

    return {
      success: true,
      message: 'Order delivered and delivery load updated',
    }
  } catch (error) {
    await safeAbortTransaction(session)
    if (isTransactionUnsupportedError(error)) {
      return markOrderDeliveredWithoutTransaction(orderId)
    }
    throw error
  } finally {
    session.endSession()
  }
}

export const assignPendingOutForDeliveryOrders = async (limit = 20) => {
  const pendingOrders = await Order.find({
    status: 'Out for Delivery',
    isDeleted: false,
    $or: [{ deliveryPartnerId: null }, { deliveryPartnerId: { $exists: false } }],
  })
    .select('_id')
    .sort({ createdAt: 1 })
    .limit(limit)

  let assignedCount = 0
  for (const order of pendingOrders) {
    try {
      const result = await assignDeliveryPartner(order._id)
      if (result.assigned) {
        assignedCount += 1
      }
    } catch {
      // Ignore per-order failures so reconciliation can continue.
    }
  }

  return { checked: pendingOrders.length, assigned: assignedCount }
}
