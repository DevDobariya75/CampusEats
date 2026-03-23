import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    imageUrl:{
        type: String,
    },
    isOpen:{
        type: Boolean,
        default: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    isActive:{
        type: Boolean,
        default: true
    },
    totalSales:{
        type: Number,
        default: 0
    }
},{timestamps: true});

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;