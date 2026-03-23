import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart',
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
    },
    ImageUrl:{
        type: String,
    },
    menuItem:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    }
},{timestamps: true});

const CartItem = mongoose.model('CartItem', cartItemSchema);
export default CartItem;