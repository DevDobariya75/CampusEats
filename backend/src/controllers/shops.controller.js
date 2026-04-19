import Shop from "../models/shops.model.js"
import Order from "../models/order.model.js"
import User from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

// Create Shop (only shopkeeper role)
const createShop = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const ownerId = req.user?._id
    const userRole = req.user?.role

    if (!ownerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'shopkeeper') {
        throw new ApiError(403, "Only shopkeepers can create shops")
    }

    // Check if shopkeeper already has a shop
    const existingShop = await Shop.findOne({ owner: ownerId, isDeleted: false })
    if (existingShop) {
        throw new ApiError(400, "Shopkeeper already has an active shop")
    }

    // Validation
    if (!name) {
        throw new ApiError(400, "Shop name is required")
    }

    const owner = await User.findById(ownerId).select('imageUrl')

    // Handle image upload (fallback to shopkeeper profile image)
    let imageUrl = owner?.imageUrl || null
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path)
        if (uploadedImage) {
            imageUrl = uploadedImage.url
        }
    }

    const shop = await Shop.create({
        name,
        description: description || "",
        imageUrl: imageUrl,
        owner: ownerId,
        isOpen: true,
        isActive: true,
        isDeleted: false,
        totalSales: 0
    })

    const createdShop = await shop.populate('owner', 'name email phone imageUrl')

    return res
        .status(201)
        .json(new ApiResponse(201, createdShop, "Shop created successfully"))
})

// Get All Shops
const getAllShops = asyncHandler(async (req, res) => {
    const { isOpen, search } = req.query

    const filter = {
        isDeleted: false,
        isActive: true
    }

    if (isOpen !== undefined) {
        filter.isOpen = isOpen === 'true'
    }

    if (search) {
        filter.name = { $regex: search, $options: 'i' }
    }

    const shops = await Shop.find(filter)
        .populate('owner', 'name email phone imageUrl')
        .sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, shops, "Shops fetched successfully"))
})

// Get Shop by ID
const getShopById = asyncHandler(async (req, res) => {
    const { shopId } = req.params

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    }).populate('owner', 'name email phone imageUrl')

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Shop fetched successfully"))
})

// Get My Shop (for logged-in shopkeeper)
const getMyShop = asyncHandler(async (req, res) => {
    const ownerId = req.user?._id

    if (!ownerId) {
        throw new ApiError(401, "User not authenticated")
    }

    const shop = await Shop.findOne({
        owner: ownerId,
        isDeleted: false
    }).populate('owner', 'name email phone imageUrl')

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, shop, "Your shop fetched successfully"))
})

// Update Shop (only owner)
const updateShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const { name, description, isOpen } = req.body
    const userId = req.user?._id

    if (!userId) {  
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    // Validation - at least one field is required
    if (!name && !description && isOpen === undefined && !req.file) {
        throw new ApiError(400, "At least one field is required for update")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    // Check ownership
    if (shop.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Only shop owner can update the shop")
    }

    const updateData = {}

    if (name) {
        updateData.name = name
    }

    if (description !== undefined) {
        updateData.description = description
    }

    if (isOpen !== undefined) {
        updateData.isOpen = isOpen
    }

    // Handle image upload
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path)
        if (uploadedImage) {
            updateData.imageUrl = uploadedImage.url
        }
    }

    const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: updateData },
        { new: true }
    ).populate('owner', 'name email phone imageUrl')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedShop, "Shop updated successfully"))
})

// Toggle Shop Status (open/close)
const toggleShopStatus = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    // Check ownership
    if (shop.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Only shop owner can toggle shop status")
    }

    shop.isOpen = !shop.isOpen
    await shop.save()

    return res
        .status(200)
        .json(new ApiResponse(200, shop, `Shop ${shop.isOpen ? 'opened' : 'closed'} successfully`))
})

// Delete Shop (soft delete)
const deleteShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    // Check ownership
    if (shop.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Only shop owner can delete the shop")
    }

    const deletedShop = await Shop.findByIdAndUpdate(
        shopId,
        {
            $set: {
                isDeleted: true,
                isActive: false
            }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deletedShop, "Shop deleted successfully"))
})

// Deactivate Shop (admin only)
const deactivateShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const userRole = req.user?.role

    if (userRole !== 'admin') {
        throw new ApiError(403, "Only admins can deactivate shops")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    const deactivatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: { isActive: false } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deactivatedShop, "Shop deactivated successfully"))
})

// Activate Shop (admin only)
const activateShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const userRole = req.user?.role

    if (userRole !== 'admin') {
        throw new ApiError(403, "Only admins can activate shops")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const shop = await Shop.findOne({
        _id: shopId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    const activatedShop = await Shop.findByIdAndUpdate(
        shopId,
        { $set: { isActive: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, activatedShop, "Shop activated successfully"))
})

// Get Shop Earnings (Delivery Charge Share)
const getShopEarnings = asyncHandler(async (req, res) => {
    const ownerId = req.user?._id
    const userRole = req.user?.role

    if (!ownerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (userRole !== 'shopkeeper') {
        throw new ApiError(403, "Only shop owners can view their earnings")
    }

    // Get shop data
    const shop = await Shop.findOne({
        owner: ownerId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(404, "Shop not found")
    }

    // Get completed orders count and calculate earnings
    const completedOrdersCount = await Order.countDocuments({
        shop: shop._id,
        status: 'Delivered',
        isDeleted: false
    })

    // Calculate total delivery charge earnings: Rs 10 per completed order
    const totalDeliveryChargeEarnings = completedOrdersCount * 10

    return res
        .status(200)
        .json(new ApiResponse(200, {
            shopId: shop._id,
            shopName: shop.name,
            totalOrders: completedOrdersCount,
            totalDeliveryChargeEarnings: totalDeliveryChargeEarnings,
            earningsPerOrder: 10,
            totalEarnings: totalDeliveryChargeEarnings,
            message: `Total delivery earnings: Rs${totalDeliveryChargeEarnings} from ${completedOrdersCount} orders`
        }, "Shop earnings fetched successfully"))
})

export {
    createShop,
    getAllShops,
    getShopById,
    getMyShop,
    updateShop,
    toggleShopStatus,
    deleteShop,
    deactivateShop,
    activateShop,
    getShopEarnings
}
