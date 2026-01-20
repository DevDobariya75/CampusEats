import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant'
    },
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    images: {
        type: [String],
        default: []
    },
    isVerified: {
        type: Boolean,
        default: false // Verified if user actually ordered
    }
}, {
    timestamps: true
});

// Ensure user can only review if they have an order
reviewSchema.index({ user: 1, restaurant: 1 });
reviewSchema.index({ user: 1, menuItem: 1 });

export default mongoose.model('Review', reviewSchema);
