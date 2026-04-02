import mongoose from "mongoose";

const reservationItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const inventoryReservationSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true,
        index: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    items: {
        type: [reservationItemSchema],
        required: true,
        default: []
    },
    status: {
        type: String,
        enum: ['active', 'pending_payment', 'completed', 'releasing', 'released'],
        default: 'active',
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    releasedAt: {
        type: Date,
        default: null
    },
    releaseReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

const InventoryReservation = mongoose.model('InventoryReservation', inventoryReservationSchema);

export default InventoryReservation;
