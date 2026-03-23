import Payment from "../models/payment.model.js"
import Order from "../models/order.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Create Payment
const createPayment = asyncHandler(async (req, res) => {
    const { orderId, amount, method, upiVpa } = req.body
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

    if (!method) {
        throw new ApiError(400, "Payment method is required")
    }

    const validMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash']
    if (!validMethods.includes(method)) {
        throw new ApiError(400, `Invalid payment method. Must be one of: ${validMethods.join(', ')}`)
    }

    // Verify order belongs to customer
    const order = await Order.findOne({
        _id: orderId,
        customer: customerId
    })

    if (!order) {
        throw new ApiError(404, "Order not found")
    }

    const payment = await Payment.create({
        customer: customerId,
        order: orderId,
        amount: parseFloat(amount),
        method,
        upiVpa: method === 'UPI' ? upiVpa : null,
        status: 'Pending'
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
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { $set: updateData },
        { new: true }
    )
        .populate('customer', 'name email phone')
        .populate('order', 'totalAmount status')

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
        .populate('order', 'totalAmount status')

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

    const stats = await Payment.aggregate([
        { $match: { customer: customerId } },
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
        { $match: { customer: customerId } },
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

export {
    createPayment,
    getPaymentById,
    getPaymentsByOrder,
    getCustomerPayments,
    updatePaymentStatus,
    verifyUPIPayment,
    getPaymentStats
}
