import mongoose from 'mongoose';

const menuItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a menu item name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    description: {
        type: String,
        maxlength: [300, 'Description cannot be more than 300 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['appetizer', 'main_course', 'dessert', 'beverage', 'combo', 'other']
    },
    image: {
        type: String,
        default: ''
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isVegan: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    allergens: {
        type: [String],
        default: []
    },
    calories: {
        type: Number,
        min: 0
    },
    preparationTime: {
        type: Number,
        default: 15, // in minutes
        min: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries
menuItemSchema.index({ restaurant: 1, category: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
