import Payment from "../models/payment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shops.model.js"
import Delivery from "../models/deliveries.model.js"
import User from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { completeReservation, releaseReservationById } from "../services/inventoryReservation.service.js"
import { createCashfreeOrder, verifyCashfreeSignature, createCashfreePaymentLink as createPaymentLinkService } from "../services/cashfree-config.js"

// Create Payment
const createPayment = asyncHandler(async (req, res) => {
    const { orderId, amount, method, upiVpa } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required - create order first")
    }

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required")
    }

    if (!method) {
        throw new ApiError(400, "Payment method is required")
    }

    const validMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash']
    if (!validMethods.includes(method)) {
        throw new ApiError(400, `Invalid payment method. Must be one of: ${validMethods.join(', ')}`)
    }

    // Verify order exists, belongs to customer, and check amount
    const order = await Order.findOne({
        _id: orderId,
        customer: customerId
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    // Security: Verify payment amount matches order GRAND TOTAL (items + delivery charges)
    const grandTotal = order.grandTotal || (order.totalAmount + 20)
    if (parseFloat(amount) !== grandTotal) {
        throw new ApiError(400, `Payment amount (${amount}) must match grand total including delivery charges (${grandTotal})`)
    }

    const payment = await Payment.create({
        customer: customerId,
        order: orderId || null,
        amount: parseFloat(amount),
        deliveryCharges: order.deliveryCharges || 20,
        method,
        upiVpa: method === 'UPI' ? upiVpa : null,
        status: 'Pending',
        breakdownAmount: {
            itemTotal: order.totalAmount,
            deliveryCharges: order.deliveryCharges || 20,
            grandTotal: grandTotal
        }
    })

    const populatedPayment = await Payment.findById(payment._id)
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedPayment, "Payment created successfully"))
})

// Get Payment by ID
const getPaymentById = asyncHandler(async (req, res) => {
    const { paymentId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required")
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        customer: customerId
    })
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status')

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment fetched successfully"))
})

// Get Payments by Order
const getPaymentsByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    const payments = await Payment.find({
        order: orderId
    })
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status')

    return res
        .status(200)
        .json(new ApiResponse(200, payments, "Payments fetched successfully"))
})

// Get Customer Payments
const getCustomerPayments = asyncHandler(async (req, res) => {
    const { status } = req.query
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    const filter = { customer: customerId }

    if (status) {
        filter.status = status
    }

    const payments = await Payment.find(filter)
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status')
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, payments, "Customer payments fetched successfully"))
})

// Update Payment Status
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentId } = req.params
    const { status, upiTransactionId } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required")
    }

    if (!status) {
        throw new ApiError(400, "Payment status is required")
    }

    const validStatuses = ['Pending', 'Completed', 'Failed']
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        customer: customerId
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    const updateData = { status }

    if (status === 'Completed') {
        updateData.paidAt = new Date()
        if (upiTransactionId) {
            updateData.upiTransactionId = upiTransactionId
        }

        // Update order status to Confirmed when payment is successful
        if (payment.order) {
            const paidOrder = await Order.findByIdAndUpdate(
                payment.order,
                { $set: { status: 'Confirmed' } },
                { returnDocument: 'after' }
            ).populate('shop')

            if (paidOrder?.inventoryReservation) {
                await completeReservation({ reservationId: paidOrder.inventoryReservation })
            }

            // Distribute earnings: Shop gets 50% of delivery charges (Rs 10)
            if (paidOrder?.shop) {
                const shopEarnings = paidOrder?.chargeBreakdown?.shopEarnings || 10
                await Shop.findByIdAndUpdate(
                    paidOrder.shop._id,
                    {
                        $inc: {
                            totalEarnings: shopEarnings,
                            totalDeliveryChargeEarnings: shopEarnings
                        }
                    },
                    { new: true }
                )
                console.log(`💰 Shop earnings updated: +Rs${shopEarnings} for order ${payment.order}`)
            }
        }
    }

    if (status === 'Failed' && payment.order) {
        const failedOrder = await Order.findById(payment.order)
        if (failedOrder?.inventoryReservation) {
            await releaseReservationById({
                reservationId: failedOrder.inventoryReservation,
                reason: 'payment_failed'
            })
        }
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { $set: updateData },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status chargeBreakdown')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPayment, "Payment status updated successfully"))
})

// Verify UPI Payment
const verifyUPIPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params
    const { upiTransactionId } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!paymentId) {
        throw new ApiError(400, "Payment ID is required")
    }

    if (!upiTransactionId) {
        throw new ApiError(400, "UPI Transaction ID is required")
    }

    const payment = await Payment.findOne({
        _id: paymentId,
        customer: customerId
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    if (payment.method !== 'UPI') {
        throw new ApiError(400, "This payment is not a UPI payment")
    }

    // Update payment to Completed
    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        {
            $set: {
                status: 'Completed',
                upiTransactionId,
                paidAt: new Date()
            }
        },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status chargeBreakdown')

    // Update order status to Confirmed
    if (payment.order) {
        const paidOrder = await Order.findByIdAndUpdate(
            payment.order,
            { $set: { status: 'Confirmed' } },
            { new: true }
        ).populate('shop')

        if (paidOrder?.inventoryReservation) {
            await completeReservation({ reservationId: paidOrder.inventoryReservation })
        }

        // Distribute earnings: Shop gets 50% of delivery charges
        if (paidOrder?.shop) {
            await Shop.findByIdAndUpdate(
                paidOrder.shop._id,
                {
                    $inc: {
                        totalEarnings: paidOrder.chargeBreakdown?.shopEarnings || 10,
                        totalDeliveryChargeEarnings: paidOrder.chargeBreakdown?.shopEarnings || 10
                    }
                }
            )
        }
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPayment, "UPI payment verified successfully"))
})

// Get Payment Statistics
const getPaymentStats = asyncHandler(async (req, res) => {
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Use customerId as string for queries - Mongoose will handle conversion
    const stats = await Payment.aggregate([
        { $match: { customer: customerId.toString ? customerId.toString() : customerId } },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" }
            }
        }
    ])

    const totalPayments = await Payment.countDocuments({ customer: customerId })
    const totalAmount = await Payment.aggregate([
        { $match: { customer: customerId.toString ? customerId.toString() : customerId } },
        {
            $group: {
                _id: null,
                total: { $sum: "$amount" }
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, {
            stats,
            totalPayments,
            totalAmountSpent: totalAmount[0]?.total || 0
        }, "Payment statistics fetched successfully"))
})

/**
 * Create Cashfree Payment Order
 * 
 * Initiates a Cashfree payment session in test mode.
 * Supports multiple payment methods: UPI, Card, Net Banking, Wallet
 */
const createCashfreePaymentOrder = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required")
    }

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
        _id: orderId,
        customer: customerId
    })
        .populate('customer', 'name email phone')

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    try {
        // Create Cashfree order
        const cashfreeResponse = await createCashfreeOrder({
            orderId: orderId.toString(),
            amount: amount,
            customerId: customerId.toString(),
            customerEmail: order.customer.email,
            customerPhone: order.customer.phone,
            customerName: order.customer.name,
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/${orderId}?paymentMethod=cashfree`,
            notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/payments/cashfree/webhook`
        })

        if (!cashfreeResponse.success) {
            throw new ApiError(500, cashfreeResponse.error || "Failed to create Cashfree order")
        }

        // Create payment record in database
        const payment = await Payment.create({
            customer: customerId,
            order: orderId,
            amount: parseFloat(amount),
            method: 'Cashfree',
            status: 'Pending',
            cashfreeOrderId: cashfreeResponse.cashfreeOrderId,
            cashfreeSessionId: cashfreeResponse.sessionId
        })

        const populatedPayment = await Payment.findById(payment._id)
            .populate('customer', 'name email phone')
            .populate('order', 'totalAmount')

        return res
            .status(201)
            .json(new ApiResponse(201, {
                payment: populatedPayment,
                sessionId: cashfreeResponse.sessionId,
                orderId: cashfreeResponse.cashfreeOrderId
            }, "Cashfree order created successfully"))
    } catch (error) {
        console.error("❌ Cashfree Order Creation Error:")
        console.error("   Error Message:", error.message)
        console.error("   Error Details:", error.response?.data || error)

        throw error instanceof ApiError 
            ? error 
            : new ApiError(500, error.message || "Failed to create Cashfree order")
    }
})

/**
 * Create Cashfree Payment Link
 * 
 * RECOMMENDED APPROACH - No iframe whitelisting needed!
 * Generates a payment link that user can click directly.
 * No CORS issues, works on any domain instantly.
 */
const createCashfreePaymentLink = asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!orderId) {
        throw new ApiError(400, "Order ID is required")
    }

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required")
    }

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
        _id: orderId,
        customer: customerId
    })
        .populate('customer', 'name email phone')

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    try {
        // Create Cashfree payment link
        const cashfreeResponse = await createPaymentLinkService({
            orderId: orderId.toString(),
            amount: amount,
            customerId: customerId.toString(),
            customerEmail: order.customer.email,
            customerPhone: order.customer.phone,
            customerName: order.customer.name,
            returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout/${orderId}?method=cashfree&status=success`,
            notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/payments/cashfree/webhook`
        })

        if (!cashfreeResponse.success) {
            throw new ApiError(500, cashfreeResponse.error || "Failed to create Cashfree payment link")
        }

        // Create payment record in database
        const payment = await Payment.create({
            customer: customerId,
            order: orderId,
            amount: parseFloat(amount),
            method: 'Cashfree',
            status: 'Pending',
            cashfreeOrderId: cashfreeResponse.referenceId,
            cashfreeSessionId: cashfreeResponse.linkId
        })

        const populatedPayment = await Payment.findById(payment._id)
            .populate('customer', 'name email phone')
            .populate('order', 'totalAmount')

        return res
            .status(201)
            .json(new ApiResponse(201, {
                payment: populatedPayment,
                paymentUrl: cashfreeResponse.paymentUrl,
                linkId: cashfreeResponse.linkId,
                redirectUrl: cashfreeResponse.paymentUrl // Direct redirect URL
            }, "Cashfree payment link created successfully - redirect user to paymentUrl"))
    } catch (error) {
        console.error("❌ Cashfree Payment Link Creation Error:")
        console.error("   Error Message:", error.message)
        console.error("   Error Details:", error.response?.data || error)

        throw error instanceof ApiError 
            ? error 
            : new ApiError(500, error.message || "Failed to create Cashfree payment link")
    }
})

/**
 * Verify Cashfree Payment Signature
 * 
 * Verifies the payment signature returned from Cashfree after payment completion.
 * Updates payment and order status on successful verification.
 */
const verifyCashfreePaymentSignature = asyncHandler(async (req, res) => {
    const { paymentId, orderId, referenceId, signature, paymentStatus } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!paymentId || !orderId || !referenceId || !signature) {
        throw new ApiError(400, "Payment verification details are required")
    }

    // Verify signature using Cashfree config
    const isSignatureValid = verifyCashfreeSignature({
        orderId,
        orderAmount: req.body.orderAmount,
        referenceId,
        signature,
        paymentStatus
    })

    if (!isSignatureValid) {
        throw new ApiError(400, "Payment verification failed - Invalid signature")
    }

    // Find payment record
    const payment = await Payment.findOne({
        _id: paymentId,
        customer: customerId
    })

    if (!payment) {
        throw new ApiError(404, "Payment not found")
    }

    // Determine payment status based on cashfree response
    let finalStatus = 'Pending'
    if (paymentStatus === 'SUCCESS') {
        finalStatus = 'Completed'
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
        finalStatus = 'Failed'
    }

    // Update payment record
    const updateData = {
        status: finalStatus,
        cashfreePaymentId: referenceId,
        cashfreeSignature: signature
    }

    if (finalStatus === 'Completed') {
        updateData.paidAt = new Date()
    }

    await Payment.findByIdAndUpdate(paymentId, { $set: updateData })

    // Handle order status update
    if (payment.order) {
        if (finalStatus === 'Completed') {
            // Update order to Confirmed when payment succeeds
            const paidOrder = await Order.findByIdAndUpdate(
                payment.order,
                { $set: { status: 'Confirmed' } },
                { new: true }
            ).populate('shop')

            // Complete inventory reservation if exists
            if (paidOrder?.inventoryReservation) {
                await completeReservation({ reservationId: paidOrder.inventoryReservation })
            }

            // Distribute earnings: Shop gets 50% of delivery charges
            if (paidOrder?.shop) {
                await Shop.findByIdAndUpdate(
                    paidOrder.shop._id,
                    {
                        $inc: {
                            totalEarnings: paidOrder.chargeBreakdown?.shopEarnings || 10,
                            totalDeliveryChargeEarnings: paidOrder.chargeBreakdown?.shopEarnings || 10
                        }
                    }
                )
            }
        } else if (finalStatus === 'Failed') {
            // Release inventory reservation if payment fails
            const failedOrder = await Order.findById(payment.order)
            if (failedOrder?.inventoryReservation) {
                await releaseReservationById({
                    reservationId: failedOrder.inventoryReservation,
                    reason: 'payment_failed'
                })
            }
        }
    }

    const updatedPayment = await Payment.findById(paymentId)
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status chargeBreakdown')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPayment, "Cashfree payment verified successfully"))
})

export {
    createPayment,
    getPaymentById,
    getPaymentsByOrder,
    getCustomerPayments,
    updatePaymentStatus,
    verifyUPIPayment,
    getPaymentStats,
    createCashfreePaymentOrder,
    createCashfreePaymentLink,
    verifyCashfreePaymentSignature
}
