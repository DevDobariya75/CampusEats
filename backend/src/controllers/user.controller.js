import User from '../models/users.model.js'
import Shop from '../models/shops.model.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import {
  changeCognitoPassword,
  confirmCognitoSignUp,
  confirmForgotPassword,
  loginWithCognito,
  refreshCognitoToken,
  resendCognitoSignUpCode,
  signOutCognitoSession,
  signUpCognitoUser,
  startForgotPassword,
} from '../services/auth.js'

const validRoles = ['customer', 'admin', 'shopkeeper', 'delivery']

const toSafeUser = (userDoc) => {
  if (!userDoc) {
    return null
  }

  const user = userDoc.toObject ? userDoc.toObject() : userDoc
  delete user.password
  delete user.refreshToken
  return user
}

const mapCognitoError = (error) => {
  if (!error?.name) {
    return new ApiError(500, 'Authentication service unavailable')
  }

  if (
    error?.name === 'InvalidParameterException' &&
    error?.message?.includes('USER_PASSWORD_AUTH flow not enabled for this client')
  ) {
    return new ApiError(
      500,
      'Cognito app client is misconfigured: enable USER_PASSWORD_AUTH in Cognito app client authentication flows.',
    )
  }

  if (
    error?.name === 'InvalidParameterException' &&
    error?.message?.includes('ADMIN_USER_PASSWORD_AUTH flow not enabled for this client')
  ) {
    return new ApiError(
      500,
      'Cognito app client is misconfigured: enable ADMIN_USER_PASSWORD_AUTH or USER_PASSWORD_AUTH in app client authentication flows.',
    )
  }

  if (
    error?.name === 'UnrecognizedClientException' ||
    error?.name === 'InvalidClientTokenId' ||
    error?.name === 'AccessDeniedException'
  ) {
    return new ApiError(
      500,
      'Server AWS credentials are missing/invalid for Cognito admin auth fallback. Configure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION or enable USER_PASSWORD_AUTH in app client.',
    )
  }

  if (
    error?.name === 'InvalidParameterException' &&
    error?.message?.includes('REFRESH_TOKEN_AUTH flow not enabled for this client')
  ) {
    return new ApiError(
      500,
      'Cognito app client is misconfigured: enable REFRESH_TOKEN_AUTH in Cognito app client authentication flows.',
    )
  }

  const errorMap = {
    UserNotConfirmedException: new ApiError(403, 'Account is not verified. Please confirm OTP first.'),
    NotAuthorizedException: new ApiError(401, 'Invalid email or password'),
    UserNotFoundException: new ApiError(401, 'Invalid email or password'),
    UsernameExistsException: new ApiError(409, 'Email already registered in Cognito'),
    InvalidPasswordException: new ApiError(400, 'Password does not meet Cognito policy'),
    CodeMismatchException: new ApiError(400, 'Invalid OTP code'),
    ExpiredCodeException: new ApiError(400, 'OTP has expired. Request a new code.'),
    LimitExceededException: new ApiError(429, 'Too many attempts. Please try again later.'),
  }

  return errorMap[error.name] || new ApiError(500, error.message || 'Authentication request failed')
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, shopName, shopDescription } = req.body

  const trimmedName = name?.trim()
  const normalizedEmail = email?.toLowerCase().trim()
  const trimmedRole = role?.trim()
  const trimmedPhone = phone?.trim()

  if (!trimmedName || !normalizedEmail || !password || !trimmedRole || !trimmedPhone) {
    throw new ApiError(400, 'Please fill all required fields before requesting OTP')
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new ApiError(400, 'Invalid email format')
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters')
  }

  if (!validRoles.includes(trimmedRole)) {
    throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(', ')}`)
  }

  if (trimmedRole === 'shopkeeper') {
    if (!shopName || !shopName.trim() || !shopDescription || !shopDescription.trim()) {
      throw new ApiError(400, 'Shop name and shop description are required for shopkeeper registration')
    }
  }

  const existingUser = await User.findOne({ email: normalizedEmail })
  if (existingUser?.isDeleted) {
    throw new ApiError(403, 'This user account is deleted')
  }

  if (existingUser?.isActive) {
    throw new ApiError(409, 'Email already registered')
  }

  let cognitoSignUp
  try {
    cognitoSignUp = await signUpCognitoUser({
      email: normalizedEmail,
      password,
      attributes: {
        name: trimmedName,
      },
    })
  } catch (error) {
    throw mapCognitoError(error)
  }

  let imageUrl = existingUser?.imageUrl || null
  if (req.file) {
    const uploadedImage = await uploadOnCloudinary(req.file.path)
    if (uploadedImage) {
      imageUrl = uploadedImage.url
    }
  }

  const upsertedUser = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        name: trimmedName,
        email: normalizedEmail,
        cognitoSub: cognitoSignUp?.UserSub,
        role: trimmedRole,
        phone: trimmedPhone,
        imageUrl,
        isActive: false,
        isDeleted: false,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  )

  let createdShop = null
  if (trimmedRole === 'shopkeeper') {
    const existingShop = await Shop.findOne({ owner: upsertedUser._id, isDeleted: false })
    if (!existingShop) {
      createdShop = await Shop.create({
        name: shopName.trim(),
        description: shopDescription.trim(),
        imageUrl,
        owner: upsertedUser._id,
        isOpen: true,
        isActive: true,
        isDeleted: false,
        totalSales: 0,
      })
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: toSafeUser(upsertedUser),
        shop: createdShop,
        requiresOtp: true,
      },
      'Registration initiated. Verify OTP sent to your email.',
    ),
  )
})

const confirmRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required')
  }

  try {
    await confirmCognitoSignUp({ email, code: otp })
  } catch (error) {
    throw mapCognitoError(error)
  }

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { $set: { isActive: true, isDeleted: false } },
    { new: true },
  )

  if (!user) {
    throw new ApiError(404, 'Local user profile not found. Register again first.')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: toSafeUser(user) }, 'Account verified successfully'))
})

const resendRegistrationOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, 'Email is required')
  }

  try {
    await resendCognitoSignUpCode(email)
  } catch (error) {
    throw mapCognitoError(error)
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Verification OTP sent again'))
})

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }

  let cognitoResult
  try {
    cognitoResult = await loginWithCognito({ email, password })
  } catch (error) {
    throw mapCognitoError(error)
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })

  if (!user || user.isDeleted) {
    throw new ApiError(403, 'User account is not available in application')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'User account is not active. Please verify your OTP first.')
  }

  const authResult = cognitoResult.AuthenticationResult || {}

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: toSafeUser(user),
        tokens: {
          accessToken: authResult.AccessToken,
          idToken: authResult.IdToken,
          refreshToken: authResult.RefreshToken,
          expiresIn: authResult.ExpiresIn,
          tokenType: authResult.TokenType || 'Bearer',
        },
      },
      'User logged in successfully',
    ),
  )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, refreshToken } = req.body

  if (!email || !refreshToken) {
    throw new ApiError(400, 'Email and refresh token are required')
  }

  try {
    const result = await refreshCognitoToken({ email, refreshToken })
    const authResult = result.AuthenticationResult || {}

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken: authResult.AccessToken,
          idToken: authResult.IdToken,
          refreshToken,
          expiresIn: authResult.ExpiresIn,
          tokenType: authResult.TokenType || 'Bearer',
        },
        'Access token refreshed successfully',
      ),
    )
  } catch (error) {
    throw mapCognitoError(error)
  }
})

const logoutUser = asyncHandler(async (req, res) => {
  const accessToken = req.header('Authorization')?.replace('Bearer ', '') || req.body?.accessToken

  try {
    await signOutCognitoSession(accessToken)
  } catch {
    // Ignore signout errors to keep logout idempotent.
  }

  return res.status(200).json(new ApiResponse(200, {}, 'User logged out successfully'))
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, 'Email is required')
  }

  try {
    await startForgotPassword(email)
  } catch (error) {
    throw mapCognitoError(error)
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Password reset OTP sent to your email'))
})

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email, OTP and new password are required')
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters')
  }

  try {
    await confirmForgotPassword({ email, code: otp, newPassword })
  } catch (error) {
    throw mapCognitoError(error)
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Password reset successfully'))
})

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'User not authenticated')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, toSafeUser(req.user), 'Current user fetched successfully'))
})

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if (!userId) {
    throw new ApiError(400, 'User ID is required')
  }

  const user = await User.findById(userId)

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, toSafeUser(user), 'User fetched successfully'))
})

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body
  const userId = req.user?._id

  if (!userId) {
    throw new ApiError(401, 'User not authenticated')
  }

  if (!name && !phone && !req.file) {
    throw new ApiError(400, 'At least one field is required for update')
  }

  const updateData = {}
  if (name) {
    updateData.name = name
  }

  if (phone) {
    updateData.phone = phone
  }

  if (req.file) {
    const uploadedImage = await uploadOnCloudinary(req.file.path)
    if (uploadedImage) {
      updateData.imageUrl = uploadedImage.url
    }
  }

  const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return res
    .status(200)
    .json(new ApiResponse(200, toSafeUser(user), 'User profile updated successfully'))
})

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, currentPassword, newPassword } = req.body
  const current = oldPassword || currentPassword

  if (!current || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required')
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters')
  }

  if (current === newPassword) {
    throw new ApiError(400, 'New password must be different from current password')
  }

  const accessToken = req.header('Authorization')?.replace('Bearer ', '')
  if (!accessToken) {
    throw new ApiError(401, 'Access token required')
  }

  try {
    await changeCognitoPassword({
      accessToken,
      oldPassword: current,
      newPassword,
    })
  } catch (error) {
    throw mapCognitoError(error)
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Password changed successfully'))
})

const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id

  if (!userId) {
    throw new ApiError(401, 'User not authenticated')
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isDeleted: true,
        isActive: false,
      },
    },
    { new: true },
  )

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return res.status(200).json(new ApiResponse(200, {}, 'User account deleted successfully'))
})

export {
  registerUser,
  confirmRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getUserById,
  updateUserProfile,
  changePassword,
  deleteUser,
  refreshAccessToken,
}
