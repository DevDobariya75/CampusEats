import mongoose from "mongoose";

const deliveryAddressSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    label:{
        type: String,
    },
    addressLine:{
        type: String,
        required: true
    },
    pinCode:{
        type: String,
        required: true
    },
    isDeleted:{
        type: Boolean,
        default: false
    },
    isDefault:{
        type: Boolean,
        default: false
    }
},{timestamps: true});

const DeliveryAddress = mongoose.model('DeliveryAddress', deliveryAddressSchema);