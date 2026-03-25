import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/ui/Button'
import { FloatingShapes, AnimatedGradientBg } from '../components/ui/3DElements'

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const { verifyOTP, loading, error, clearError, tempLoginData, requiresTwoFA } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const inputRefs = useRef([])

  // Redirect if not in 2FA flow
  useEffect(() => {
    if (!requiresTwoFA) {
      navigate('/login')
    }
  }, [requiresTwoFA, navigate])

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      alert('Please enter all 6 digits')
      return
    }

    setIsSubmitting(true)
    const result = await verifyOTP(otpCode)
    setIsSubmitting(false)

    if (result.success) {
      navigate('/')
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const isExpired = timeLeft === 0

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
                <div className={`inline-block p-4 rounded-2xl mb-4 shadow-lg transition-all ${
                  isExpired
                    ? 'bg-gradient-to-br from-red-500 to-red-600'
                    : 'bg-gradient-to-br from-sky-500 to-sky-600'
                }`}>
                  <motion.div
                    animate={{ rotate: isExpired ? [0, -10, 10, 0] : [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isExpired ? (
                      <AlertCircle className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-white" />
                    )}
                  </motion.div>
                </div>
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Verify Your Identity
                </h1>
                <p className="text-slate-600 font-medium">
                  Check your email for a 6-digit code
                </p>
                {tempLoginData?.email && (
                  <p className="text-sm text-slate-500 mt-2 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {tempLoginData.email}
                  </p>
                )}
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
                    <h3 className="font-semibold text-red-800 text-sm">Verification Failed</h3>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Expired Alert */}
              {isExpired && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg"
                >
                  <p className="text-sm text-yellow-800">
                    The code has expired. Please request a new one.
                  </p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Input */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">
                    Enter 6-digit code
                  </label>
                  <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isExpired}
                        whileFocus={{ scale: 1.1 }}
                        className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          digit
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 bg-slate-50 focus:border-sky-500 focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Timer */}
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className={`text-center text-sm font-semibold ${
                    isExpired ? 'text-red-600' : timeLeft < 60 ? 'text-orange-600' : 'text-slate-700'
                  }`}
                >
                  {isExpired ? (
                    'Code expired'
                  ) : (
                    <>
                      Code expires in{' '}
                      <span className="font-bold">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                    </>
                  )}
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: isExpired ? 1 : 1.02 }}
                  whileTap={{ scale: isExpired ? 1 : 0.98 }}
                  type="submit"
                  disabled={isSubmitting || loading || isExpired}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting || loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Verifying...
                    </>
                  ) : isExpired ? (
                    'Code Expired'
                  ) : (
                    'Verify'
                  )}
                </motion.button>
              </form>

              {/* Resend Link */}
              {!isExpired && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-slate-700 font-medium mt-6"
                >
                  Didn't receive the code?{' '}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="button"
                    className="font-bold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    Resend
                  </motion.button>
                </motion.p>
              )}

              {isExpired && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full mt-6 px-6 py-2 border-2 border-sky-500 text-sky-500 font-semibold rounded-xl hover:bg-sky-50 transition-all"
                >
                  Return to Login
                </motion.button>
              )}
            </div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-40 -left-20 w-40 h-40 bg-gradient-to-br from-sky-400 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"
            />
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-40 -right-20 w-40 h-40 bg-gradient-to-tl from-purple-400 to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
