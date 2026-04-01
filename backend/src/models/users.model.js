import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
    password:{
        type: String,
        required: true
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
    isActive:{
        type: Boolean,
        default: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    refreshToken:{
        type: String,
    }
},{timestamps: true});

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 10); //10 is the salt rounds
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
        _id: this._id,
        email: this.email,
        name: this.name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',
    }
);
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
        }
    );
}

const User = mongoose.model('User', userSchema);

export default User;