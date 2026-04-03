import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, error, clearError } = useAuth()
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
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:bg-gradient-to-br dark:from-[#0f1419] dark:to-[#1a2332] flex items-center justify-center px-4 py-12">
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.1),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(249,115,22,0.08),transparent_45%)] pointer-events-none" />
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.1),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(249,115,22,0.08),transparent_45%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-full max-w-md relative z-10"
        >
          {/* Bento Card */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.6)]">
            
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8 text-center"
            >
              <div className="inline-block p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl mb-4 shadow-sm dark:shadow-[0_0_15px_rgba(249,115,22,0.3)] border border-orange-100 dark:border-orange-500/30">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Lock className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
                Welcome Back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider">Sign in to access CampusEats</p>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400 text-sm">Login Failed</h3>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 transition-colors ${errors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400'}`} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                         setFormData({ ...formData, email: e.target.value })
                         if (errors.email) setErrors({...errors, email: null})
                      }}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-orange-500'} rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 ${errors.email ? 'focus:ring-red-500' : 'focus:ring-orange-500'} transition-all font-medium`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-bold tracking-wide">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest mt-6">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                         setFormData({ ...formData, password: e.target.value })
                         if (errors.password) setErrors({...errors, password: null})
                      }}
                      className={`w-full bg-slate-50 dark:bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-slate-200 dark:border-white/10 focus:border-orange-500'} rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 ${errors.password ? 'focus:ring-red-500' : 'focus:ring-orange-500'} transition-all font-medium`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {errors.password && (
                      <span className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-bold tracking-wide">
                        {errors.password}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between mt-8 text-xs font-bold"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 text-orange-500 focus:ring-orange-500 transition-colors" />
                  <span className="text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors tracking-widest uppercase">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-orange-500 hover:text-orange-400 transition-colors uppercase tracking-wider">
                  Forgot Password?
                </Link>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-orange-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><LoadingSpinner size="sm" /> Authenticating...</> : 'Sign In'}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center border-t border-slate-200 dark:border-white/10 pt-6"
            >
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-600 dark:text-orange-400 font-black hover:text-orange-500 dark:hover:text-orange-300 transition-colors uppercase tracking-wider text-xs ml-1">
                  Create Account
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

