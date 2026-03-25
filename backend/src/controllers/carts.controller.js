import Cart from "../models/carts.model.js"
import CartItem from "../models/cartItems.model.js"
import MenuItem from "../models/menuItems.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Get or Create Cart for Shop
const getOrCreateCart = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    let cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    }).populate({
        path: 'cartItems',
        model: 'CartItem',
        populate: { path: 'menuItem', model: 'MenuItem' }
    })

    if (!cart) {
        cart = await Cart.create({
            shop: shopId,
            customer: customerId
        })
    }

    const cartWithItems = await Cart.findById(cart._id)
        .populate('shop', 'name')
        .populate('customer', 'name email phone')

    return res
        .status(200)
        .json(new ApiResponse(200, cartWithItems, "Cart retrieved successfully"))
})

// Get Cart Items
const getCartItems = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "Cart is empty"))
    }

    const cartItems = await CartItem.find({
        cart: cart._id
    }).populate('menuItem', 'name price imageUrl')

    return res
        .status(200)
        .json(new ApiResponse(200, cartItems, "Cart items fetched successfully"))
})

// Add Item to Cart
const addItemToCart = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const { menuItemId, quantity } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    if (!menuItemId) {
        throw new ApiError(400, "Menu item ID is required")
    }

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Valid quantity is required")
    }

    // Get menu item details
    const menuItem = await MenuItem.findById(menuItemId)
    if (!menuItem || menuItem.isDeleted) {
        throw new ApiError(404, "Menu item not found")
    }

    // Get or create cart
    let cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        cart = await Cart.create({
            shop: shopId,
            customer: customerId
        })
    }

    // Check if item already exists in cart
    let cartItem = await CartItem.findOne({
        cart: cart._id,
        menuItem: menuItemId
    })

    if (cartItem) {
        // Update quantity
        cartItem.quantity += parseInt(quantity)
        await cartItem.save()
    } else {
        // Create new cart item
        cartItem = await CartItem.create({
            cart: cart._id,
            menuItem: menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: parseInt(quantity),
            ImageUrl: menuItem.imageUrl,
            subTotal: menuItem.price * parseInt(quantity)
        })
        
        // Add cartItem to cart's cartItems array if not already present
        if (!cart.cartItems.includes(cartItem._id)) {
            cart.cartItems.push(cartItem._id)
            await cart.save()
        }
    }

    const populatedItem = await CartItem.findById(cartItem._id).populate('menuItem', 'name price imageUrl')

    return res
        .status(201)
        .json(new ApiResponse(201, populatedItem, "Item added to cart successfully"))
})

// Update Cart Item Quantity
const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const { quantity } = req.body
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    if (!quantity || quantity < 1) {
        throw new ApiError(400, "Valid quantity is required")
    }

    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const cartItem = await CartItem.findOne({
        _id: itemId,
        cart: cart._id
    })

    if (!cartItem) {
        throw new ApiError(404, "Cart item not found")
    }

    cartItem.quantity = parseInt(quantity)
    if (cartItem.price) {
        cartItem.subTotal = cartItem.price * parseInt(quantity)
    }
    await cartItem.save()

    const updatedItem = await CartItem.findById(itemId).populate('menuItem', 'name price imageUrl')

    return res
        .status(200)
        .json(new ApiResponse(200, updatedItem, "Cart item updated successfully"))
})

// Remove Item from Cart
const removeCartItem = asyncHandler(async (req, res) => {
    const { shopId, itemId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId || !itemId) {
        throw new ApiError(400, "Shop ID and Item ID are required")
    }

    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const cartItem = await CartItem.findOneAndDelete({
        _id: itemId,
        cart: cart._id
    })

    if (!cartItem) {
        throw new ApiError(404, "Cart item not found")
    }

    // Remove cartItem ID from cart's cartItems array
    cart.cartItems = cart.cartItems.filter(item => item.toString() !== itemId)
    await cart.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Item removed from cart successfully"))
})

// Clear Cart
const clearCart = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    await CartItem.deleteMany({ cart: cart._id })

    // Clear cartItems array from cart
    cart.cartItems = []
    await cart.save()

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Cart cleared successfully"))
})

// Get Cart Summary
const getCartSummary = asyncHandler(async (req, res) => {
    const { shopId } = req.params
    const customerId = req.user?._id

    if (!customerId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!shopId) {
        throw new ApiError(400, "Shop ID is required")
    }

    const cart = await Cart.findOne({
        shop: shopId,
        customer: customerId
    })

    if (!cart) {
        return res
            .status(200)
            .json(new ApiResponse(200, {
                itemCount: 0,
                totalPrice: 0,
                items: []
            }, "Cart is empty"))
    }

    const cartItems = await CartItem.find({ cart: cart._id }).populate('menuItem', 'price')

    let totalPrice = 0
    cartItems.forEach(item => {
        if (item.price && item.quantity) {
            totalPrice += item.price * item.quantity
        }
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            itemCount: cartItems.length,
            totalPrice,
            items: cartItems
        }, "Cart summary fetched successfully"))
})

export {
    getOrCreateCart,
    getCartItems,
    addItemToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    getCartSummary
}
