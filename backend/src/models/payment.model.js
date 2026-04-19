import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true  // Payment MUST be linked to an order (industry standard)
    },
    method:{
        type: String,
    },
    status:{
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    amount:{
        type: Number,
        required: true
    },
    upiTransactionId:{
        type: String,
    },
    upiVpa:{
        type: String,
    },
    // Cashfree Integration Fields
    cashfreeOrderId:{
        type: String,
    },
    cashfreeSessionId:{
        type: String,
    },
    cashfreePaymentId:{
        type: String,
    },
    cashfreeSignature:{
        type: String,
    },
    paidAt:{
        type: Date,
    },
    deliveryCharges:{
        type: Number,
        default: 20,
        description: 'Delivery charges included in this payment'
    },
    breakdownAmount:{
        itemTotal: {
            type: Number,
            required: true,
            description: 'Total for food items'
        },
        deliveryCharges: {
            type: Number,
            default: 20,
            description: 'Delivery charges'
        },
        grandTotal: {
            type: Number,
            required: true,
            description: 'Final total amount (items + delivery)'
        }
    }
},{timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;