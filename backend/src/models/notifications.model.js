import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedOrder:{
        
    }
})