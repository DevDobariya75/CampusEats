import User from "../models/users.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

// Helper function to generate tokens
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone } = req.body

    // Validation
    if (!name || !email || !password || !role || !phone) {
        throw new ApiError(400, "All fields are required")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ApiError(400, "Invalid email format")
    }

    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters")
    }

    // Validate role against model enum
    const validRoles = ['customer', 'admin', 'shopkeeper', 'delivery']
    if (!validRoles.includes(role)) {
        throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`)
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new ApiError(409, "Email already registered")
    }

    // Handle profile picture upload
    let profilePicture = null
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path)
        if (uploadedImage) {
            profilePicture = uploadedImage.url
        }
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password, // Schema will hash this
        role,
        phone,
        profilePicture,
        isActive: true,
        isDeleted: false
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    // Validation
    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    // Find user
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }

    if (user.isDeleted) {
        throw new ApiError(401, "User account has been deleted")
    }

    if (!user.isActive) {
        throw new ApiError(401, "User account is inactive")
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password")
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        sameSite: 'strict'
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        )
})

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
    // User should be authenticated before this
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        sameSite: 'strict'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "User not authenticated")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

// Get User by ID
const getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User ID is required")
    }

    const user = await User.findById(userId).select("-password -refreshToken")

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"))
})

// Update User Profile
const updateUserProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Validation
    if (!name && !phone && !req.file) {
        throw new ApiError(400, "At least one field is required for update")
    }

    const updateData = {}
    if (name) {
        updateData.name = name
    }
    if (phone) {
        updateData.phone = phone
    }

    // Handle profile picture upload
    if (req.file) {
        const uploadedImage = await uploadOnCloudinary(req.file.path)
        if (uploadedImage) {
            updateData.profilePicture = uploadedImage.url
        }
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
    ).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile updated successfully"))
})

// Change Password
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    // Validation
    if (!oldPassword) {
        throw new ApiError(400, "Old password is required")
    }

    if (!newPassword) {
        throw new ApiError(400, "New password is required")
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "New password must be at least 6 characters")
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "New password must be different from old password")
    }

    // Get user with password field
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Check old password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Old password is incorrect")
    }

    // Update password
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
})

// Delete User (Soft Delete)
const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: {
                isDeleted: true,
                isActive: false
            }
        },
        { new: true }
    )

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    // Clear tokens
    const options = {
        httpOnly: true,
        sameSite: 'strict'
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User account deleted successfully"))
})

// Refresh Access Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        const options = {
            httpOnly: true,
            sameSite: 'strict'
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getUserById,
    updateUserProfile,
    changePassword,
    deleteUser,
    refreshAccessToken
}
