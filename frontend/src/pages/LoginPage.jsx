import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/ui/Button'
import { FloatingShapes, AnimatedGradientBg } from '../components/ui/3DElements'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, clearError, requiresTwoFA } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    const result = await login(formData)
    setIsSubmitting(false)

    if (result.success) {
      navigate('/')
    }
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 overflow-hidden">
        {/* Animated Background */}
        <AnimatedGradientBg />

        {/* 3D Background */}
        <div className="absolute inset-0 w-full h-full opacity-30">
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
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Lock className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <p className="text-slate-600 font-medium">Sign in to access CampusEats</p>
              </motion.div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-800 text-sm">Login Failed</h3>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
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
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
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

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded cursor-pointer accent-orange-500" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-700">Remember me</span>
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Forgot password?
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting || loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-300" />
                <span className="text-sm text-slate-500 font-medium">or</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-300" />
              </div>

              {/* Footer */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-slate-700 font-medium"
              >
                Don't have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Create account
                </motion.button>
              </motion.p>
            </div>

            {/* Floating Decorative Elements */}
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
