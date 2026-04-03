import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, User, Upload, Mail, Camera, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { shopsApi } from '../api/services'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { AnimatedGradientBg } from '../components/ui/3DElements'
import { getInitials, formatDate } from '../utils/helpers'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const isShopkeeper = user?.role === 'shopkeeper'
  
  // Edit profile state
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [shopId, setShopId] = useState('')
  const [shopForm, setShopForm] = useState({ name: '', description: '' })
  const [shopImage, setShopImage] = useState(null)
  const [shopPreview, setShopPreview] = useState('')
  const [shopLoading, setShopLoading] = useState(false)
  const [shopSaving, setShopSaving] = useState(false)
  const [shopMessage, setShopMessage] = useState('')
  const [shopError, setShopError] = useState('')

  useEffect(() => {
    setName(user?.name || '')
    setPhone(user?.phone || '')
  }, [user?.name, user?.phone])

  useEffect(() => {
    if (!isShopkeeper) {
      return
    }

    let mounted = true

    const loadShop = async () => {
      try {
        setShopLoading(true)
        setShopError('')
        const response = await shopsApi.getMine()
        const currentShop = response.data

        if (!mounted) {
          return
        }

        setShopId(currentShop?._id || '')
        setShopForm({
          name: currentShop?.name || '',
          description: currentShop?.description || '',
        })
        setShopPreview(currentShop?.imageUrl || currentShop?.owner?.imageUrl || user?.imageUrl || '')
        setShopImage(null)
      } catch (err) {
        if (!mounted) {
          return
        }

        const errorText = String(err.message || '').toLowerCase()
        if (errorText.includes('shop not found')) {
          setShopId('')
          setShopForm({ name: '', description: '' })
          setShopPreview(user?.imageUrl || '')
          return
        }

        setShopError(err.message || 'Failed to load shop profile')
      } finally {
        if (mounted) {
          setShopLoading(false)
        }
      }
    }

    loadShop()

    return () => {
      mounted = false
    }
  }, [isShopkeeper, user?.imageUrl])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageOnlyUpload = async () => {
    if (!profilePicture) return
    
    try {
      setImageUploading(true)
      setError('')
      const formData = new FormData()
      formData.append('profilePicture', profilePicture)
      
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage('Profile picture updated successfully via Cloudinary!')
        setProfilePicture(null)
        setProfilePreview(null)
        setTimeout(() => setMessage(''), 3000)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An error occurred during upload.')
    } finally {
      setImageUploading(false)
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

  const handleShopImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setShopImage(file)
    setShopPreview(URL.createObjectURL(file))
  }

  const handleShopSave = async (event) => {
    event.preventDefault()
    setShopError('')
    setShopMessage('')

    if (!shopForm.name.trim()) {
      setShopError('Shop name is required')
      return
    }

    try {
      setShopSaving(true)

      const formData = new FormData()
      formData.append('name', shopForm.name.trim())
      formData.append('description', shopForm.description.trim())
      if (shopImage) {
        formData.append('image', shopImage)
      }

      const response = shopId
        ? await shopsApi.update(shopId, formData)
        : await shopsApi.create(formData)

      const updatedShop = response.data
      setShopId(updatedShop?._id || shopId)
      setShopForm({
        name: updatedShop?.name || shopForm.name,
        description: updatedShop?.description || shopForm.description,
      })
      setShopPreview(updatedShop?.imageUrl || shopPreview)
      setShopImage(null)
      setShopMessage(shopId ? 'Shop profile updated successfully.' : 'Shop profile created successfully.')
    } catch (err) {
      setShopError(err.message || 'Failed to save shop profile')
    } finally {
      setShopSaving(false)
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

        <div className="relative py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-6 mb-8">
                {/* Avatar */}
                <div className="relative border border-slate-300 dark:border-white/20 rounded-full p-1 bg-white dark:bg-white/5 shadow-md dark:shadow-none backdrop-blur-md">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-black shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                  >
                    {profilePreview || user?.imageUrl ? (
                      <img src={profilePreview || user?.imageUrl} alt={user?.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{getInitials(user?.name || 'User')}</span>
                    )}
                  </motion.div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-2">{user?.name}</h1>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-2">
                    <Mail className="w-4 h-4 text-orange-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <User className="w-4 h-4 text-orange-400" />
                    <span className="capitalize font-bold uppercase tracking-widest text-xs">{user?.role}</span>
                  </div>
                </div>
              </div>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none rounded-3xl p-8"
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
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold"
                        required
                      />
                    </div>
                  </motion.div>

                  {/* Profile Picture Upload UX */}
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      Profile Picture
                    </label>
                    <div className="flex flex-col gap-4">
                      <label className="flex items-center justify-center w-full min-h-[160px] border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl hover:border-orange-400 cursor-pointer transition-all bg-slate-50 dark:bg-white/5 overflow-hidden group relative">
                        {profilePreview ? (
                          <div className="absolute inset-0 w-full h-full">
                            <img src={profilePreview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                                <Camera className="w-4 h-4" /> Change Selection
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <Upload className="w-10 h-10 text-orange-500 mx-auto mb-3" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-wider">Click to browse or drag and drop</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">JPG, PNG, GIF up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>

                      <AnimatePresence>
                        {profilePicture && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <button
                              type="button"
                              onClick={handleImageOnlyUpload}
                              disabled={imageUploading}
                              className="w-full py-3.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 rounded-xl font-black shadow-sm dark:shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                            >
                              {imageUploading ? (
                                <><LoadingSpinner size="sm" /> Uploading to Cloudinary...</>
                              ) : (
                                <><Upload className="w-4 h-4" /> Upload Picture Now</>
                              )}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </form>
            </motion.div>

            {isShopkeeper && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-8 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none rounded-3xl p-8"
              >
                <div className="mb-4">
                  <p className="text-xs font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
                    {shopId ? 'Shop Profile' : 'Create Your Shop'}
                  </p>
                </div>

                {shopMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-700">{shopMessage}</p>
                  </motion.div>
                )}

                {shopError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{shopError}</p>
                  </motion.div>
                )}

                <form onSubmit={handleShopSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/10 shrink-0">
                    <img
                      src={shopPreview || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600'}
                      alt={shopForm.name || 'Shop'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Shop Name</span>
                      <input
                        type="text"
                        value={shopForm.name}
                        onChange={(e) => setShopForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                        placeholder="Enter your shop name"
                      />
                    </label>
                  </div>

                  <label className="block md:col-span-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Shop Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleShopImageChange}
                      className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Description</span>
                    <textarea
                      rows="3"
                      value={shopForm.description}
                      onChange={(e) => setShopForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      placeholder="Tell customers about your shop"
                    />
                  </label>

                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={shopSaving || shopLoading}
                      className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      {shopSaving ? 'Saving...' : shopId ? 'Update Shop' : 'Create Shop'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

