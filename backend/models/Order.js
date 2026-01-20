import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    specialInstructions: String
});

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    orderItems: [orderItemSchema],
    deliveryAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        campus: String,
        building: String,
        room: String
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'campus_card', 'online'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryFee: {
        type: Number,
        required: true,
        default: 0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    deliveryPerson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    estimatedDeliveryTime: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    specialInstructions: String
}, {
    timestamps: true
});

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });

export default mongoose.model('Order', orderSchema);
