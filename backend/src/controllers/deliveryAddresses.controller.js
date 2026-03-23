import DeliveryAddress from "../models/deliveryAddresses.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Add Delivery Address
const addDeliveryAddress = asyncHandler(async (req, res) => {
    const { label, addressLine, pinCode, isDefault } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Validation
    if (!addressLine) {
        throw new ApiError(400, "Address line is required")
    }

    if (!pinCode) {
        throw new ApiError(400, "Pin code is required")
    }

    // Validate pin code format (5-6 digits)
    if (!/^\d{5,6}$/.test(pinCode)) {
        throw new ApiError(400, "Pin code must be 5-6 digits")
    }

    // If this is set as default, unset other defaults
    let updateData = {
        customer: customerId,
        addressLine,
        pinCode,
        isDeleted: false,
        isDefault: isDefault || false
    }

    if (label) {
        updateData.label = label
    }

    if (isDefault) {
        await DeliveryAddress.updateMany(
            { customer: customerId },
            { $set: { isDefault: false } }
        )
    }

    const deliveryAddress = await DeliveryAddress.create(updateData)

    return res
        .status(201)
        .json(new ApiResponse(201, deliveryAddress, "Delivery address added successfully"))
})

// Get All Delivery Addresses for User
const getDeliveryAddresses = asyncHandler(async (req, res) => {
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    const addresses = await DeliveryAddress.find({
        customer: customerId,
        isDeleted: false
    }).sort({ isDefault: -1, createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, addresses, "Delivery addresses fetched successfully"))
})

// Get Delivery Address by ID
const getDeliveryAddressById = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!addressId) {
        throw new ApiError(400, "Address ID is required")
    }

    const address = await DeliveryAddress.findOne({
        _id: addressId,
        customer: customerId,
        isDeleted: false
    })

    if (!address) {
        throw new ApiError(404, "Delivery address not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Delivery address fetched successfully"))
})

// Update Delivery Address
const updateDeliveryAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    const { label, addressLine, pinCode, isDefault } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!addressId) {
        throw new ApiError(400, "Address ID is required")
    }

    // Validation - at least one field is required
    if (!label && !addressLine && !pinCode && isDefault === undefined) {
        throw new ApiError(400, "At least one field is required for update")
    }

    // Validate pin code if provided
    if (pinCode && !/^\d{5,6}$/.test(pinCode)) {
        throw new ApiError(400, "Pin code must be 5-6 digits")
    }

    // Check if address exists and belongs to user
    const address = await DeliveryAddress.findOne({
        _id: addressId,
        customer: customerId,
        isDeleted: false
    })

    if (!address) {
        throw new ApiError(404, "Delivery address not found")
    }

    // Prepare update data
    const updateData = {}

    if (label !== undefined) {
        updateData.label = label
    }

    if (addressLine) {
        updateData.addressLine = addressLine
    }

    if (pinCode) {
        updateData.pinCode = pinCode
    }

    if (isDefault === true) {
        // Unset default for all other addresses
        await DeliveryAddress.updateMany(
            {
                customer: customerId,
                _id: { $ne: addressId }
            },
            { $set: { isDefault: false } }
        )
        updateData.isDefault = true
    } else if (isDefault === false && address.isDefault) {
        // Only allow unsetting default if it's currently true
        const otherAddresses = await DeliveryAddress.findOne({
            customer: customerId,
            _id: { $ne: addressId },
            isDeleted: false
        })

        if (!otherAddresses) {
            throw new ApiError(400, "Cannot unset default - no other addresses available")
        }

        updateData.isDefault = false
    }

    const updatedAddress = await DeliveryAddress.findByIdAndUpdate(
        addressId,
        { $set: updateData },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAddress, "Delivery address updated successfully"))
})

// Delete Delivery Address (Soft Delete)
const deleteDeliveryAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!addressId) {
        throw new ApiError(400, "Address ID is required")
    }

    // Check if address exists and belongs to user
    const address = await DeliveryAddress.findOne({
        _id: addressId,
        customer: customerId,
        isDeleted: false
    })

    if (!address) {
        throw new ApiError(404, "Delivery address not found")
    }

    // Check if trying to delete the default address
    if (address.isDefault) {
        const otherAddresses = await DeliveryAddress.findOne({
            customer: customerId,
            _id: { $ne: addressId },
            isDeleted: false
        })

        if (otherAddresses) {
            // Set another address as default
            otherAddresses.isDefault = true
            await otherAddresses.save()
        }
    }

    // Soft delete
    const deletedAddress = await DeliveryAddress.findByIdAndUpdate(
        addressId,
        { $set: { isDeleted: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deletedAddress, "Delivery address deleted successfully"))
})

// Set Default Delivery Address
const setDefaultDeliveryAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!addressId) {
        throw new ApiError(400, "Address ID is required")
    }

    // Check if address exists and belongs to user
    const address = await DeliveryAddress.findOne({
        _id: addressId,
        customer: customerId,
        isDeleted: false
    })

    if (!address) {
        throw new ApiError(404, "Delivery address not found")
    }

    // Unset default for all other addresses
    await DeliveryAddress.updateMany(
        {
            customer: customerId,
            _id: { $ne: addressId }
        },
        { $set: { isDefault: false } }
    )

    // Set current address as default
    const updatedAddress = await DeliveryAddress.findByIdAndUpdate(
        addressId,
        { $set: { isDefault: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAddress, "Default delivery address set successfully"))
})

// Get Default Delivery Address
const getDefaultDeliveryAddress = asyncHandler(async (req, res) => {
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    const defaultAddress = await DeliveryAddress.findOne({
        customer: customerId,
        isDeleted: false,
        isDefault: true
    })

    if (!defaultAddress) {
        throw new ApiError(404, "No default delivery address found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, defaultAddress, "Default delivery address fetched successfully"))
})

export {
    addDeliveryAddress,
    getDeliveryAddresses,
    getDeliveryAddressById,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    setDefaultDeliveryAddress,
    getDefaultDeliveryAddress
}
