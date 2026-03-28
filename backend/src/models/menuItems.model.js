import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    price:{
        type: Number,
        required: true
    },
    imageUrl:{
        type: String,
    },
    category:{
        type: String,
    },
    isAvailable:{
        type: Boolean,
        default: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    stock:{
        type: Number,
        default: 0
    },
    sizes: [
        {
            name: {
                type: String,
                enum: ['Small', 'Medium', 'Large', 'XL (Big Size)'],
                default: 'Medium'
            },
            priceMultiplier: {
                type: Number,
                default: 1
            }
        }
    ]
},{timestamps: true});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;