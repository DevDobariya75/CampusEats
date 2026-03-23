import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedOrder:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    type:{
        type: String,
        enum: ['Order Update', 'Promotion', 'General'],
        required: true
    },
    title:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    isRead:{
        type: Boolean,
        default: false
    },
},{timestamps: true});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;