import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    
})