import MenuItem from "../models/menuItems.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Add Menu Item
const addMenuItem = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const { name, description, price, imageUrl, category, stock } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    // Validation
    if (!name) {
        throw new ApiError(400, "Item name is required")
    }

    if (!price || price <= 0) {
        throw new ApiError(400, "Valid price is required")
    }

    if (stock !== undefined && stock < 0) {
        throw new ApiError(400, "Stock cannot be negative")
    }

    // Verify shop belongs to user
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to add items to this shop")
    }

    const menuItem = await MenuItem.create({
        shop: shopId,
        name,
        description: description || "",
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        category: category || "General",
        isAvailable: true,
        isDeleted: false,
        stock: stock || 0
    })

    const populatedItem = await MenuItem.findById(menuItem._id).populate('shop', 'name')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedItem, "Menu item added successfully"))
})

// Get All Menu Items of a Shop
const getMenuItems = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const { category, isAvailable, search } = req.query

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const filter = {
        shop: shopId,
        isDeleted: false
    }

    if (isAvailable !== undefined) {
        filter.isAvailable = isAvailable === 'true'
    }

    if (category) {
        filter.category = category
    }

    if (search) {
        filter.name = { $regex: search, $options: 'i' }
    }

    const menuItems = await MenuItem.find(filter)
        .populate('shop', 'name')
        .sort({ category: 1, name: 1 })

    return res
        .status(200)
        .json(new ApiResponse(200, menuItems, "Menu items fetched successfully"))
})

// Get Menu Item by ID
const getMenuItemById = asyncHandler(async (req, res) => {
    const { itemId } = req.params

    if (!itemId) {
        throw new ApiError(400, "Item ID is required")
    }

    const menuItem = await MenuItem.findOne({
        _id: itemId,
        isDeleted: false
    }).populate('shop', 'name')

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, menuItem, "Menu item fetched successfully"))
})

// Update Menu Item
const updateMenuItem = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const { name, description, price, imageUrl, category, stock, isAvailable } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    // Validation - at least one field is required
    if (!name && !description && !price && !imageUrl && !category && stock === undefined && isAvailable === undefined) {
        throw new ApiError(400, "At least one field is required for update")
    }

    // Validate price if provided
    if (price !== undefined && (price <= 0 || isNaN(price))) {
        throw new ApiError(400, "Valid price is required")
    }

    // Validate stock if provided
    if (stock !== undefined && stock < 0) {
        throw new ApiError(400, "Stock cannot be negative")
    }

    const menuItem = await MenuItem.findOne({
        _id: itemId,
        shop: shopId,
        isDeleted: false
    })

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    // Verify shop belongs to user
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to update items in this shop")
    }

    const updateData = {}

    if (name) {
        updateData.name = name
    }

    if (description !== undefined) {
        updateData.description = description
    }

    if (price) {
        updateData.price = parseFloat(price)
    }

    if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl
    }

    if (category) {
        updateData.category = category
    }

    if (stock !== undefined) {
        updateData.stock = stock
    }

    if (isAvailable !== undefined) {
        updateData.isAvailable = isAvailable
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        { $set: updateData },
        { new: true }
    ).populate('shop', 'name')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedItem, "Menu item updated successfully"))
})

// Toggle Menu Item Availability
const toggleItemAvailability = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    const menuItem = await MenuItem.findOne({
        _id: itemId,
        shop: shopId,
        isDeleted: false
    })

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    // Verify shop belongs to user
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to modify items in this shop")
    }

    menuItem.isAvailable = !menuItem.isAvailable
    await menuItem.save()

    return res
        .status(200)
        .json(new ApiResponse(200, menuItem, `Item ${menuItem.isAvailable ? 'made available' : 'made unavailable'} successfully`))
})

// Delete Menu Item (soft delete)
const deleteMenuItem = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    const menuItem = await MenuItem.findOne({
        _id: itemId,
        shop: shopId,
        isDeleted: false
    })

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    // Verify shop belongs to user
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to delete items from this shop")
    }

    const deletedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        { $set: { isDeleted: true } },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, deletedItem, "Menu item deleted successfully"))
})

// Update Stock
const updateStock = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const { stock } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    if (stock === undefined || stock < 0 || isNaN(stock)) {
        throw new ApiError(400, "Valid stock quantity is required")
    }

    const menuItem = await MenuItem.findOne({
        _id: itemId,
        shop: shopId,
        isDeleted: false
    })

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found")
    }

    // Verify shop belongs to user
    const Shop = require("../models/shops.model.js").default
    const shop = await Shop.findOne({
        _id: shopId,
        owner: userId,
        isDeleted: false
    })

    if (!shop) {
        throw new ApiError(403, "You don't have permission to update stock for this shop")
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        { $set: { stock: parseInt(stock) } },
        { new: true }
    ).populate('shop', 'name')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedItem, "Item stock updated successfully"))
})

export {
    addMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    toggleItemAvailability,
    deleteMenuItem,
    updateStock
}
