import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    payment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
        required: false
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status:{
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    totalAmount:{
        type: Number,
        required: true
    },
    specialNotes:{
        type: String,
    },
    deliveryAddress:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryAddress',
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Order = mongoose.model('Order', orderSchema);
export default Order;