import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/services'
import { setUnauthorizedListener } from '../api/client'

const AuthContext = createContext(null)

const ACCESS_TOKEN_KEY = 'cognitoAccessToken'
const ID_TOKEN_KEY = 'cognitoIdToken'
const REFRESH_TOKEN_KEY = 'cognitoRefreshToken'
const USER_EMAIL_KEY = 'cognitoUserEmail'
const USER_ROLE_KEY = 'cognitoUserRole'
const USER_PHONE_KEY = 'cognitoUserPhone'

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return true

  // Check if token expires within next minute
  const expirationTime = payload.exp * 1000 // Convert to milliseconds
  const currentTime = Date.now()
  const timeUntilExpiry = expirationTime - currentTime

  return timeUntilExpiry < 60000 // Token expired or expires within 1 minute
}

function buildFallbackUser() {
  const idToken = localStorage.getItem(ID_TOKEN_KEY)
  const payload = idToken ? decodeJwtPayload(idToken) : null
  const email = payload?.email || payload?.username || localStorage.getItem(USER_EMAIL_KEY) || ''
  const role = payload?.['custom:role'] || localStorage.getItem(USER_ROLE_KEY) || 'customer'
  const name = payload?.name || payload?.given_name || email.split('@')[0] || 'User'
  const phone = payload?.phone_number || localStorage.getItem(USER_PHONE_KEY) || ''

  if (!email) {
    return null
  }

  return {
    _id: payload?.sub || email,
    email,
    name,
    role,
    phone,
    imageUrl: payload?.picture || '',
    isActive: true,
  }
}

let cognitoModulePromise

async function loadCognitoModule() {
  if (!cognitoModulePromise) {
    cognitoModulePromise = (async () => {
      globalThis.global = globalThis
      globalThis.process = globalThis.process || { env: {} }
      return import('amazon-cognito-identity-js')
    })()
  }

  return cognitoModulePromise
}

function setSessionTokens({ accessToken, idToken, refreshToken, email }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (idToken) localStorage.setItem(ID_TOKEN_KEY, idToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  if (email) localStorage.setItem(USER_EMAIL_KEY, email)
}

function clearSessionTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(ID_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
  localStorage.removeItem(USER_PHONE_KEY)
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Handle unauthorized access (401 from API)
  const handleUnauthorized = useCallback(() => {
    clearSessionTokens()
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  // Refresh user and validate token
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    const idToken = localStorage.getItem(ID_TOKEN_KEY)
    
    // Check if token is expired
    if (token && isTokenExpired(token)) {
      handleUnauthorized()
      return
    }

    if (!token && !idToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await userApi.getCurrentUser()
      setUser(response.data)
      if (response.data?.role) {
        localStorage.setItem(USER_ROLE_KEY, response.data.role)
      }
      if (response.data?.phone) {
        localStorage.setItem(USER_PHONE_KEY, response.data.phone)
      }
      setError(null)
    } catch {
      const fallbackUser = buildFallbackUser()
      if (fallbackUser) {
        setUser(fallbackUser)
        setError(null)
        return
      }

      handleUnauthorized()
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    // Set up unauthorized listener for 401 responses
    setUnauthorizedListener(handleUnauthorized)

    // Check token expiration on mount
    refreshUser()
  }, [refreshUser, handleUnauthorized])

  const login = useCallback(
    async (credentials) => {
      try {
        setLoading(true)
        setError(null)

        const { AuthenticationDetails, CognitoUser, CognitoUserPool } = await loadCognitoModule()

        const userPool = new CognitoUserPool({
          UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_vtZ5ayLeL',
          ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '1e1urg04g36ej4r46lpeo3s8p4',
        })

        const normalizedEmail = credentials.email.trim().toLowerCase()
        const authDetails = new AuthenticationDetails({
          Username: normalizedEmail,
          Password: credentials.password,
        })

        const cognitoUser = new CognitoUser({
          Username: normalizedEmail,
          Pool: userPool,
        })

        const tokens = await new Promise((resolve, reject) => {
          cognitoUser.authenticateUser(authDetails, {
            onSuccess: (result) => {
              resolve({
                accessToken: result.getAccessToken().getJwtToken(),
                idToken: result.getIdToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken(),
              })
            },
            onFailure: (err) => reject(err),
          })
        })

        setSessionTokens({ ...tokens, email: normalizedEmail })
        const fallbackUser = buildFallbackUser()
        if (fallbackUser) {
          setUser(fallbackUser)
          localStorage.setItem(USER_ROLE_KEY, fallbackUser.role)
        }
        await refreshUser()
        return { success: true }
      } catch (err) {
        const message = err?.message || 'Login failed'
        setError(message)
        return { success: false, error: message }
      } finally {
        setLoading(false)
      }
    },
    [refreshUser],
  )

  const register = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await userApi.register(formData)
      const role = formData instanceof FormData ? formData.get('role') : null
      const phone = formData instanceof FormData ? formData.get('phone') : null
      if (typeof role === 'string' && role) {
        localStorage.setItem(USER_ROLE_KEY, role)
      }
      if (typeof phone === 'string' && phone) {
        localStorage.setItem(USER_PHONE_KEY, phone)
      }
      return { success: true, data: response.data }
    } catch (err) {
      const message = err.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyRegistrationOtp = useCallback(async ({ email, otp }) => {
    try {
      console.log('🔐 Frontend: verifyRegistrationOtp called with:', { email, otp })
      setLoading(true)
      setError(null)
      console.log('📡 Frontend: Calling API endpoint /users/register/confirm-otp')
      await userApi.confirmRegistration({ email, otp })
      console.log('✅ Frontend: OTP verification successful')
      return { success: true }
    } catch (err) {
      const message = err.message || 'OTP verification failed'
      console.log('❌ Frontend: OTP verification failed:', message)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const resendRegistrationOtp = useCallback(async (email) => {
    try {
      setError(null)
      await userApi.resendRegistrationOtp({ email })
      return { success: true }
    } catch (err) {
      const message = err.message || 'Failed to resend OTP'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    try {
      setError(null)
      await userApi.forgotPassword({ email })
      return { success: true }
    } catch (err) {
      const message = err.message || 'Failed to send reset OTP'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const resetPassword = useCallback(async ({ email, otp, newPassword }) => {
    try {
      setError(null)
      await userApi.resetPassword({ email, otp, newPassword })
      return { success: true }
    } catch (err) {
      const message = err.message || 'Password reset failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
      if (accessToken) {
        await userApi.logout({ accessToken })
      }
    } catch {
      // Ignore logout API errors and clear local session anyway.
    } finally {
      clearSessionTokens()
      setUser(null)
      setError(null)
    }

    return { success: true }
  }, [])

  const updateProfile = useCallback(async (formData) => {
    try {
      setError(null)
      const response = await userApi.updateProfile(formData)
      setUser(response.data)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Profile update failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const changePassword = useCallback(async (passwordData) => {
    try {
      setError(null)
      await userApi.changePassword(passwordData)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Password change failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      verifyRegistrationOtp,
      resendRegistrationOtp,
      forgotPassword,
      resetPassword,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
      clearError: () => setError(null),
    }),
    [
      user,
      loading,
      error,
      login,
      register,
      verifyRegistrationOtp,
      resendRegistrationOtp,
      forgotPassword,
      resetPassword,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
