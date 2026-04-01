import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/users.model.js";
import { getCognitoUserProfile, verifyCognitoToken } from "../services/auth.js";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const looksLikeCognitoUsername = (value = "") => !value.includes("@") || uuidPattern.test(value)

export const verifyJWT = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.header("Authorization")?.replace("Bearer ","") || req.cookies?.accessToken
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }

        const decodedToken = await verifyCognitoToken(token)
        let cognitoProfile = null

        try {
            cognitoProfile = await getCognitoUserProfile(token)
        } catch {
            cognitoProfile = null
        }

        const tokenEmail = decodedToken?.email?.toLowerCase()
        const tokenUsername = decodedToken?.username?.toLowerCase()
        const tokenSub = decodedToken?.sub
        const profileEmail = cognitoProfile?.email?.toLowerCase()
        const resolvedEmail = profileEmail || tokenEmail || (tokenUsername?.includes("@") ? tokenUsername : undefined)
        const resolvedName = cognitoProfile?.name || decodedToken?.name || (resolvedEmail ? resolvedEmail.split('@')[0] : 'User')
        const resolvedPhone = cognitoProfile?.phone || decodedToken?.phone_number || '0000000000'
        const resolvedRole = decodedToken?.['custom:role'] || 'customer'

        if (!resolvedEmail && !tokenUsername && !tokenSub) {
            throw new ApiError(401, "Invalid Cognito token")
        }

        let user = await User.findOne({
            $or: [
                ...(tokenSub ? [{ cognitoSub: tokenSub }] : []),
                ...(resolvedEmail ? [{ email: resolvedEmail }] : []),
                ...(tokenEmail ? [{ email: tokenEmail }] : []),
                ...(tokenUsername && tokenUsername !== tokenEmail && tokenUsername !== resolvedEmail ? [{ email: tokenUsername }] : []),
            ]
        })

        if (user?.isDeleted) {
            throw new ApiError(401,"Access denied for this user")
        }

        if (!user) {
            const fallbackEmail = resolvedEmail
            if (!fallbackEmail) {
                throw new ApiError(401, "Access denied for this user")
            }

            user = await User.create({
                name: resolvedName,
                email: fallbackEmail,
                cognitoSub: tokenSub,
                role: resolvedRole,
                phone: resolvedPhone,
                isActive: true,
                isDeleted: false,
            })
        } else {
            let shouldSave = false

            if (!user.isActive) {
                user.isActive = true
                shouldSave = true
            }

            if (tokenSub && user.cognitoSub !== tokenSub) {
                user.cognitoSub = tokenSub
                shouldSave = true
            }

            if (resolvedEmail && user.email !== resolvedEmail && looksLikeCognitoUsername(user.email)) {
                user.email = resolvedEmail
                shouldSave = true
            }

            if (resolvedName && looksLikeCognitoUsername(user.name || '')) {
                user.name = resolvedName
                shouldSave = true
            }

            if ((!user.phone || user.phone === '0000000000') && resolvedPhone) {
                user.phone = resolvedPhone
                shouldSave = true
            }

            if (shouldSave) {
                await user.save({ validateBeforeSave: false })
            }
        }

        req.user=user;
        req.cognitoClaims = decodedToken
        next()
    } catch (error) {
        throw new ApiError(401 ,error?.message || "Invalid Access Token")
    }
    
})