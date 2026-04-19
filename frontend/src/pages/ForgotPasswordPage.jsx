import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/ui/Button'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword, resetPassword, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [successfulReset, setSuccessfulReset] = useState(false)

  // Redirect to login after successful password reset
  useEffect(() => {
    if (successfulReset) {
      const redirectTimer = setTimeout(() => {
        navigate('/login')
      }, 2500) // Redirect after 2.5 seconds to show splash screen

      return () => clearTimeout(redirectTimer)
    }
  }, [successfulReset, navigate])

  const handleSendOtp = async (event) => {
    event.preventDefault()
    clearError()
    setMessage('')
    setLoading(true)

    const result = await forgotPassword(email)
    setLoading(false)

    if (result.success) {
      setOtpSent(true)
      setMessage('Reset OTP sent. Check your email and enter the code below.')
    }
  }

  const handleResetPassword = async (event) => {
    event.preventDefault()
    clearError()
    setMessage('')
    setLoading(true)

    const result = await resetPassword({ email, otp, newPassword })
    setLoading(false)

    if (result.success) {
      setMessage('Password reset successful. You can now login with your new password.')
      setOtp('')
      setNewPassword('')
      setSuccessfulReset(true)
    }
  }

  return (
    <PageTransition>
      {successfulReset ? (
        // Full-screen splash/loading screen
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-gradient-to-b from-green-700 via-green-600 to-green-500"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_40%),radial-gradient(circle_at_70%_85%,rgba(0,0,0,0.18),transparent_45%)]" />

          <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
            <motion.div
              initial={{ scale: 0.86, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.42 }}
              className="w-20 h-20 rounded-3xl bg-black/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.14, duration: 0.35 }}
              className="mt-7"
            >
              <p className="text-[2rem] sm:text-[2.2rem] font-black leading-none">Password Reset</p>
              <p className="mt-2 text-[1.15rem] sm:text-[1.3rem] font-extrabold text-white/90">Successful!</p>
            </motion.div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className="mt-6 flex items-center justify-center rounded-2xl bg-black/10 border border-white/15 px-4 py-2"
            >
              <span className="text-sm font-bold tracking-wide">Redirecting to login...</span>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        // Normal form view
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:bg-gradient-to-br dark:from-[#0f1419] dark:to-[#1a2332] flex items-center justify-center px-4 py-12">
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
                  <KeyRound className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                </motion.div>
              </div>
              <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
                Reset Password
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider">Get new Password</p>
            </motion.div>

            {/* Success Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 rounded-lg flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-400 text-sm">Success</h3>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">{message}</p>
                </div>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-400 text-sm">Error</h3>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="space-y-6">
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
                      <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={otpSent}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* OTP Field */}
                {otpSent && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                        Verification Code
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <KeyRound className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400 transition-colors" />
                        </div>
                        <input
                          type="text"
                          value={otp}
                          onChange={(event) => setOtp(event.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                          placeholder="Enter OTP code"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* New Password Field */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                        New Password
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-orange-500 dark:group-focus-within:text-orange-400 transition-colors" />
                        </div>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-orange-500 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                          placeholder="••••••••"
                          minLength={8}
                          required
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Min. 8 characters</p>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider text-sm font-display shadow-md hover:shadow-lg"
              >
                {loading ? 'Processing...' : otpSent ? 'Reset Password' : 'Send OTP'}
              </motion.button>

              {/* Back to Login */}
              <div className="text-center">
                <Link 
                  to="/login"
                  className="text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      )}
    </PageTransition>
  )
}
