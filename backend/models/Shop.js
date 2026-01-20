import mongoose from 'mongoose';

const shopSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a shop name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    cuisine: {
        type: [String],
        default: []
    },
    image: {
        type: String,
        default: ''
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        campus: String
    },
    contact: {
        phone: String,
        email: String
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
    },
    deliveryTime: {
        type: Number,
        default: 30, // in minutes
        min: 10,
        max: 120
    },
    deliveryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    minOrder: {
        type: Number,
        default: 0,
        min: 0
    },
    openingHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOpen: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Shop', shopSchema);
