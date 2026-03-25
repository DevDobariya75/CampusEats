import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Lock, LogOut, Upload, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { userApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { AnimatedGradientBg } from '../components/ui/3DElements'
import { getInitials, formatDate } from '../utils/helpers'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, refreshUser, logout, updateProfile, changePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('edit') // 'edit', 'password', 'security'
  
  // Edit profile state
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('name', name)
      formData.append('phone', phone)
      if (profilePicture) {
        formData.append('profilePicture', profilePicture)
      }

      const result = await updateProfile(formData)
      if (result.success) {
        setMessage('Profile updated successfully!')
        setProfilePicture(null)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    try {
      setPasswordLoading(true)
      const result = await changePassword({
        currentPassword,
        newPassword,
      })
      if (result.success) {
        setPasswordMessage('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(result.error || 'Failed to change password')
      }
    } catch (err) {
      setPasswordError(err.message || 'An error occurred')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <AnimatedGradientBg />

        <div className="relative py-12 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.name || 'User')}</span>
                    )}
                  </motion.div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold font-display text-slate-900 mb-2">{user?.name}</h1>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-slate-200">
                {[
                  { id: 'edit', label: 'Edit Profile', icon: User },
                  { id: 'password', label: 'Change Password', icon: Lock },
                  { id: 'security', label: 'Security', icon: MapPin },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(id)}
                    className={`px-4 py-3 font-semibold transition-all flex items-center gap-2 borderr-b-2 ${
                      activeTab === id
                        ? 'text-orange-600 border-b-2 border-orange-600'
                        : 'text-slate-600 border-b-2 border-transparent hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Edit Profile Tab */}
            {activeTab === 'edit' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{message}</p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Name */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Profile Picture */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Profile Picture
                    </label>
                    <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-200 rounded-xl hover:border-orange-400 cursor-pointer transition-all">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Click to upload a new profile picture</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                {passwordMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{passwordMessage}</p>
                  </motion.div>
                )}

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </motion.div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Current Password */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* New Password */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Manage Addresses</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/addresses')}
                    className="px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Go to Addresses
                  </motion.button>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Logout</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
