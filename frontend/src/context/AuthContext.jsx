import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { userApi } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  const refreshUser = useCallback(async () => {
    try {
      const response = await userApi.getCurrentUser()
      setUser(response.data)
      setError(null)
    } catch (err) {
      setUser(null)
      setError(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      await userApi.login(credentials)
      await refreshUser()
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [refreshUser])

  const register = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      await userApi.register(formData)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await userApi.logout()
      setUser(null)
      setError(null)
      setRequiresTwoFA(false)
      setTempLoginData(null)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Logout failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  const updateProfile = useCallback(async (formData) => {
    try {
      setLoading(true)
      setError(null)
      const response = await userApi.updateProfile(formData)
      setUser(response.data)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true)
      setError(null)
      await userApi.changePassword(passwordData)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Password change failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      refreshUser,
      updateProfile,
      changePassword,
      clearError: () => setError(null),
    }),
    [user, loading, error, login, logout, refreshUser, register, updateProfile, changePassword],
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
