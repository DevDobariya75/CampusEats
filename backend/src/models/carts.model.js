import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},{timestamps: true});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;