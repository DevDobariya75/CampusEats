import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    menuItem:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name:{
        type: String,
    },
    price:{
        type: Number,
    },
    quantity:{
        type: Number,
        required: true
    },
    subTotal:{
        type: Number,
    },
    imageUrl:{
        type: String,
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
},{timestamps: true});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
export default OrderItem;