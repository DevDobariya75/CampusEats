import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
    deliveryPartner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status:{
        type: String,
        enum: ['Assigned', 'Accepted', 'Picked Up', 'Delivered', 'Cancelled'],
        default: 'Assigned'
    },
    acceptedAt:{
        type: Date,
    },
    pickedUpAt:{
        type: Date,
    },
    deliveredAt:{
        type: Date,
    },
    isDeleted:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;