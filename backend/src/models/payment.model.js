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
        required: true
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
    paidAt:{
        type: Date,
    }
},{timestamps: true});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;