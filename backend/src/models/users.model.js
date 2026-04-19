import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    cognitoSub: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
    },
    role:{
        enum: ['customer', 'admin', 'shopkeeper', 'delivery'],
        default: 'customer',
        type: String,
        required: true
    },
    imageUrl:{
        type: String,
    },
    phone:{
        type: String,
        required: true
    },
    currentOrders:{
        type: Number,
        default: 0,
        min: 0
    },
    maxOrders:{
        type: Number,
        default: 4,
        min: 1
    },
    totalEarnings:{
        type: Number,
        default: 0,
        description: 'Total earnings for delivery partners'
    },
    totalDeliveryChargeEarnings:{
        type: Number,
        default: 0,
        description: 'Total delivery charge earnings (Rs 5 per delivery)'
    },
    isActive:{
        type: Boolean,
        default: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;