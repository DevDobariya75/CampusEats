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

    // Re-validate both steps before registration so OTP is not requested with incomplete data.
    if (!validateStep1()) {
      setStep(1)
      return
    }

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
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`)
    }
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300 flex items-center justify-center">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)]" />

        {/* 3D Background */}
        <div className="absolute inset-0 w-full h-full opacity-30 mix-blend-screen">
          <FloatingShapes />
        </div>

        {/* Content */}
        <div className="relative p-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            {/* Card */}
            <div className="bento-card p-6 bg-white/95 dark:bg-[#0b1320]/90 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgb(15,23,42,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)] rounded-3xl transition-colors duration-300">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-5 text-center"
              >
                <div className="inline-block p-3 bg-orange-100 dark:bg-orange-500/20 rounded-2xl mb-3 shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-200 dark:border-orange-500/30 transition-colors duration-300">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <User className="w-6 h-6 text-orange-400" />
                  </motion.div>
                </div>
                <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white mb-1 uppercase tracking-widest transition-colors duration-300">
                  Join CampusEats
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs tracking-wider transition-colors duration-300">
                  {step === 1 ? 'Create your account' : 'Complete your profile'}
                </p>
              </motion.div>

              {/* Progress Bar */}
              <div className="mb-5 flex gap-2">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="flex-1 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                />
                <div className={`flex-1 h-1 rounded-full transition-all ${step === 2 ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-slate-200 dark:bg-white/10'}`} />
              </div>

              {/* Error Alert */}
              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 text-xs">Error</h3>
                    <p className="text-xs text-red-700 mt-0.5">{authError}</p>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Account Information */}
              {step === 1 && (
                <form className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setForm({ ...form, name: e.target.value })
                          if (errors.name) setErrors({ ...errors, name: '' })
                        }}
                        placeholder="Your name"
                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                          errors.name
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        } outline-none`}
                      />
                    </div>
                    {errors.name && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                        {errors.name}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value })
                          if (errors.email) setErrors({ ...errors, email: '' })
                        }}
                        placeholder="your@email.com"
                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                          errors.email
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        } outline-none`}
                      />
                    </div>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                        {errors.email}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-2.5 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => {
                          setForm({ ...form, password: e.target.value })
                          if (errors.password) setErrors({ ...errors, password: '' })
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                          errors.password
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        } outline-none`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-2.5 text-slate-500 dark:text-slate-500 hover:text-orange-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                        {errors.password}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-2.5 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={form.confirmPassword}
                        onChange={(e) => {
                          setForm({ ...form, confirmPassword: e.target.value })
                          if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' })
                        }}
                        placeholder="••••••••"
                        className={`w-full pl-12 pr-12 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                          errors.confirmPassword
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        } outline-none`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 bg-orange-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all uppercase tracking-widest text-sm"
                  >
                    Next Step
                  </motion.button>
                </form>
              )}

              {/* Step 2: Profile Information */}
              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => {
                          setForm({ ...form, phone: e.target.value })
                          if (errors.phone) setErrors({ ...errors, phone: '' })
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                          errors.phone
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                            : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                        } outline-none`}
                      />
                    </div>
                    {errors.phone && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                        {errors.phone}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">I am a...</label>
                    <select
                      value={form.role}
                      onChange={(e) => {
                        setForm({ ...form, role: e.target.value, shopName: '', shopDescription: '' })
                        if (errors.role) setErrors({ ...errors, role: '' })
                      }}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold appearance-none transition-all text-sm"
                    >
                      <option value="customer" className="bg-white dark:bg-[#060B13] text-slate-900 dark:text-white">Customer (Order Food)</option>
                      <option value="shopkeeper" className="bg-white dark:bg-[#060B13] text-slate-900 dark:text-white">Shopkeeper (Sell Food)</option>
                      <option value="delivery" className="bg-white dark:bg-[#060B13] text-slate-900 dark:text-white">Delivery Partner</option>
                    </select>
                  </motion.div>

                  {form.role === 'shopkeeper' && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Shop Name</label>
                        <div className="relative">
                          <Store className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                          <input
                            type="text"
                            value={form.shopName}
                            onChange={(e) => {
                              setForm({ ...form, shopName: e.target.value })
                              if (errors.shopName) setErrors({ ...errors, shopName: '' })
                            }}
                            placeholder="My Awesome Shop"
                            className={`w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest text-sm ${
                              errors.shopName
                                ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            } outline-none`}
                          />
                        </div>
                        {errors.shopName && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
                            {errors.shopName}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Shop Description</label>
                        <textarea
                          value={form.shopDescription}
                          onChange={(e) => {
                            setForm({ ...form, shopDescription: e.target.value })
                            if (errors.shopDescription) setErrors({ ...errors, shopDescription: '' })
                          }}
                          placeholder="Tell customers about your shop..."
                          className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border rounded-xl font-bold text-slate-900 dark:text-white transition-all tracking-widest resize-none h-20 text-sm ${
                            errors.shopDescription
                              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                              : 'border-slate-200 dark:border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                          } outline-none`}
                          rows={3}
                        />
                        {errors.shopDescription && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold mt-2 tracking-wider">
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
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Profile Picture (Optional)</label>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full py-4 bg-slate-50 dark:bg-white/5 border border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                        previewUrl
                          ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                          : 'border-slate-300 dark:border-white/20 hover:border-orange-400 transition-colors'
                      }`}
                    >
                      {previewUrl ? (
                        <>
                          <img src={previewUrl} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                          <span className="text-xs font-black text-green-400 flex items-center gap-1 uppercase tracking-widest">
                            <CheckCircle className="w-4 h-4" /> Image selected
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-orange-400" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Click to upload photo</span>
                        </>
                      )}
                    </motion.button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </motion.div>

                  <div className="flex gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setStep(1)
                        setErrors({})
                      }}
                      className="flex-1 py-3 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                    >
                      Back
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting || authLoading}
                      className="flex-1 py-3 bg-orange-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                    >
                      {isSubmitting || authLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
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
                className="text-center text-slate-400 font-bold tracking-widest text-xs mt-3"
              >
                Already have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-black text-slate-900 dark:text-white hover:text-orange-400 uppercase tracking-widest ml-1 transition-colors"
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
              className="absolute -bottom-40 -right-20 w-40 h-40 bg-gradient-to-tl from-orange-400 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

