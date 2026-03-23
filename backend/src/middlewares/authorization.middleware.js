import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Check if user has specific role(s)
export const checkRole = (...allowedRoles) => {
    return asyncHandler(async (req, _, next) => {
        if (!req.user) {
            throw new ApiError(401, "User not authenticated")
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, `Access denied. Required role: ${allowedRoles.join(" or ")}`)
        }

        next()
    })
}

// Specific role checkers
export const isAdmin = checkRole("admin")
export const isShopkeeper = checkRole("shopkeeper")
export const isCustomer = checkRole("customer")
export const isDeliveryPartner = checkRole("delivery_partner")
