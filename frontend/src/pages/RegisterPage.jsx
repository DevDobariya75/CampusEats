import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Store, AlertCircle, Upload, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { FloatingShapes, AnimatedGradientBg } from '../components/ui/3DElements'

const initialForm = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: 'customer',
  shopName: '',
  shopDescription: '',
}

export default function RegisterPage() {
  const { register, loading: authLoading, error: authError, clearError } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [profilePicture, setProfilePicture] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateStep1 = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email) newErrors.email = 'Email is required'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email'
    }
    if (!form.password) newErrors.password = 'Password is required'
    if (form.password && form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    if (form.role === 'shopkeeper') {
      if (!form.shopName.trim()) newErrors.shopName = 'Shop name is required'
      if (!form.shopDescription.trim()) newErrors.shopDescription = 'Shop description is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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

  const handleNext = () => {
    clearError()
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    if (!validateStep2()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('password', form.password)
    formData.append('phone', form.phone)
    formData.append('role', form.role)

    if (form.role === 'shopkeeper') {
      formData.append('shopName', form.shopName)
      formData.append('shopDescription', form.shopDescription)
    }

    if (profilePicture) {
      formData.append('profilePicture', profilePicture)
    }

    const result = await register(formData)
    setIsSubmitting(false)

    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 overflow-hidden">
        {/* Animated Background */}
        <AnimatedGradientBg />

        {/* 3D Background */}
        <div className="absolute inset-0 w-full h-full opacity-20">
          <FloatingShapes />
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Card */}
            <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8 text-center"
              >
                <div className="inline-block p-4 bg-gradient-to-br from-orange-500 to-sky-500 rounded-2xl mb-4 shadow-lg">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <User className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent mb-2">
                  Join CampusEats
                </h1>
                <p className="text-slate-600 font-medium">
                  {step === 1 ? 'Create your account' : 'Complete your profile'}
                </p>
              </motion.div>

              {/* Progress Bar */}
              <div className="mb-8 flex gap-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                />
                <div className={`flex-1 h-1 rounded-full transition-all ${step === 2 ? 'bg-gradient-to-r from-sky-500 to-sky-600' : 'bg-slate-300'}`} />
              </div>

              {/* Error Alert */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 text-sm">Error</h3>
                    <p className="text-xs text-red-700 mt-1">{authError}</p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Account Information */}
              {step === 1 && (
                <form className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value })
                          if (errors.name) setErrors({ ...errors, name: '' })
                        }}
                        placeholder="John Doe"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl font-base transition-all ${
                          errors.name
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        } focus:outline-none`}
                      />
                    </div>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value })
                          if (errors.email) setErrors({ ...errors, email: '' })
                        }}
                        placeholder="your@email.com"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl font-base transition-all ${
                          errors.email
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        } focus:outline-none`}
                      />
                    </div>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value })
                          if (errors.password) setErrors({ ...errors, password: '' })
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl font-base transition-all ${
                          errors.password
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        } focus:outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm({ ...form, confirmPassword: e.target.value })
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl font-base transition-all ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        } focus:outline-none`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Next Step
                  </motion.button>
                </form>
              )}

              {/* Step 2: Profile Information */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value })
                          if (errors.phone) setErrors({ ...errors, phone: '' })
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl font-base transition-all ${
                          errors.phone
                            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                        } focus:outline-none`}
                      />
                    </div>
                    {errors.phone && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-2">I am a...</label>
                    <select
                      value={form.role}
                      onChange={(e) => {
                        setForm({ ...form, role: e.target.value, shopName: '', shopDescription: '' })
                        if (errors.role) setErrors({ ...errors, role: '' })
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-base bg-white"
                    >
                      <option value="customer">Customer (Order Food)</option>
                      <option value="shopkeeper">Shopkeeper (Sell Food)</option>
                      <option value="delivery">Delivery Partner</option>
                    </select>
                  </motion.div>

                  {form.role === 'shopkeeper' && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Shop Name</label>
                        <div className="relative">
                          <Store className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                          <input
                            type="text"
                            value={form.shopName}
                            onChange={(e) => {
                              setForm({ ...form, shopName: e.target.value })
                              if (errors.shopName) setErrors({ ...errors, shopName: '' })
                            }}
                            placeholder="My Awesome Shop"
                            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl font-base transition-all ${
                              errors.shopName
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                            } focus:outline-none`}
                          />
                        </div>
                        {errors.shopName && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                            {errors.shopName}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Shop Description</label>
                        <textarea
                          value={form.shopDescription}
                          onChange={(e) => {
                            setForm({ ...form, shopDescription: e.target.value })
                            if (errors.shopDescription) setErrors({ ...errors, shopDescription: '' })
                          }}
                          placeholder="Tell customers about your shop..."
                          className={`w-full px-4 py-3 border-2 rounded-xl font-base transition-all resize-none ${
                            errors.shopDescription
                              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                              : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
                          } focus:outline-none`}
                          rows={3}
                        />
                        {errors.shopDescription && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mt-1">
                            {errors.shopDescription}
                          </motion.p>
                        )}
                      </motion.div>
                    </>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Picture (Optional)</label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-6 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                        previewUrl
                          ? 'border-green-500 bg-green-50/50'
                          : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50/50'
                      }`}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                          <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Image selected
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400" />
                          <span className="text-sm font-semibold text-slate-600">Click to upload photo</span>
                        </>
                      )}
                    </motion.button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </motion.div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setStep(1)
                        setErrors({})
                      }}
                      className="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl hover:border-slate-400 transition-all"
                    >
                      Back
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting || authLoading}
                      className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting || authLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                  </div>
                </form>
              )}

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-slate-700 font-medium mt-6"
              >
                Already have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Login here
                </motion.button>
              </motion.p>
            </div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-40 -left-20 w-40 h-40 bg-gradient-to-br from-orange-400 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-40 -right-20 w-40 h-40 bg-gradient-to-tl from-sky-400 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
