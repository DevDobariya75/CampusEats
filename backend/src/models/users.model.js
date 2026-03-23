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
    passwordHash:{
        type: String,
        required: true
    },
    role:{
        enum: ['customer', 'admin', 'shopkeeper', 'delivery'],
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
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

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    // Hash the password before saving
    this.password = await bcrypt.hash(this.password, 10); //10 is the salt rounds
    next();
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
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
    },
)
}
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
        },
    );  
}

const User = mongoose.model('User', userSchema);

export default User;