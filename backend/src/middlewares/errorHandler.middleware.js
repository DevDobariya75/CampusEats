import { ApiError } from "../utils/ApiError.js"

export const errorHandler = (err, req, res, next) => {
    // If it's our custom ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            statusCode: err.statusCode,
            message: err.message,
            errors: err.errors,
            success: false
        })
    }

    // JWT specific errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            statusCode: 401,
            message: "Invalid token",
            errors: [err.message],
            success: false
        })
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            statusCode: 401,
            message: "Token expired",
            errors: [err.message],
            success: false
        })
    }

    // MongoDB/Mongoose errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            statusCode: 400,
            message: "Validation error",
            errors: Object.values(err.errors).map(e => e.message),
            success: false
        })
    }

    if (err.name === "CastError") {
        return res.status(400).json({
            statusCode: 400,
            message: "Invalid ID format",
            errors: ["Invalid MongoDB ObjectId"],
            success: false
        })
    }

    // Duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0]
        return res.status(400).json({
            statusCode: 400,
            message: "Duplicate entry",
            errors: [`${field} already exists`],
            success: false
        })
    }

    // Default error
    res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message || "Internal Server Error",
        errors: [],
        success: false
    })
}
