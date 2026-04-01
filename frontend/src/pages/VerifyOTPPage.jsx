import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { PageTransition } from '../components/ui/Button'
import { FloatingShapes, AnimatedGradientBg } from '../components/ui/3DElements'

export default function VerifyOTPPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyRegistrationOtp, resendRegistrationOtp, loading, error, clearError } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const otpInputRefs = useRef([])

  const email = useMemo(() => (searchParams.get('email') || '').trim().toLowerCase(), [searchParams])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]

    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, otp.length - index).split('')
      digits.forEach((digit, digitIndex) => {
        newOtp[index + digitIndex] = digit
      })
      setOtp(newOtp)

      const nextFocusIndex = Math.min(index + digits.length, otp.length - 1)
      otpInputRefs.current[nextFocusIndex]?.focus()
      return
    }

    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < otp.length - 1) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const newOtp = [...otp]

      if (newOtp[index]) {
        newOtp[index] = ''
        setOtp(newOtp)
        return
      }

      if (index > 0) {
        newOtp[index - 1] = ''
        setOtp(newOtp)
        otpInputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault()
      otpInputRefs.current[index - 1]?.focus()
      return
    }

    if (event.key === 'ArrowRight' && index < otp.length - 1) {
      event.preventDefault()
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (index, event) => {
    event.preventDefault()
    const pastedText = event.clipboardData.getData('text') || ''
    const digits = pastedText.replace(/\D/g, '').slice(0, otp.length - index).split('')

    if (!digits.length) {
      return
    }

    const newOtp = [...otp]
    digits.forEach((digit, digitIndex) => {
      newOtp[index + digitIndex] = digit
    })
    setOtp(newOtp)

    const nextFocusIndex = Math.min(index + digits.length, otp.length - 1)
    otpInputRefs.current[nextFocusIndex]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    setMessage('')

    const otpCode = otp.join('')
    if (!email) {
      setMessage('Email is missing. Please register again.')
      return
    }

    if (otpCode.length !== 6) {
      setMessage('Please enter all 6 OTP digits.')
      return
    }

    setIsSubmitting(true)
    const result = await verifyRegistrationOtp({ email, otp: otpCode })
    setIsSubmitting(false)

    if (result.success) {
      setMessage('Account verified successfully. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    }
  }

  const handleResendOtp = async () => {
    clearError()
    setMessage('')
    if (!email) {
      setMessage('Email is missing. Please register again.')
      return
    }

    const result = await resendRegistrationOtp(email)
    if (result.success) {
      setMessage('A new OTP has been sent to your email.')
    }
  }

  return (
    <PageTransition>
      <div className="fixed inset-0 overflow-hidden">
        <AnimatedGradientBg />

        <div className="absolute inset-0 w-full h-full opacity-30">
          <FloatingShapes />
        </div>

        <div className="relative h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-8">
              <div className="mb-8 text-center">
                <div className="inline-block p-4 rounded-2xl mb-4 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold font-display bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent mb-2">
                  Verify Account
                </h1>
                <p className="text-slate-700 font-medium">Enter the 6-digit OTP from your email</p>
                {email && (
                  <p className="text-sm text-slate-600 mt-2 flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    {email}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              )}

              {message && <div className="mb-5 p-3 text-sm rounded-lg bg-white/65">{message}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-4 text-center">OTP Code</label>
                  <div className="flex gap-2 justify-center">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element
                        }}
                        type="text"
                        maxLength="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={(e) => handleOtpPaste(index, e)}
                        onFocus={(e) => e.target.select()}
                        className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl transition-all ${
                          digit
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-slate-200 bg-slate-50 focus:border-orange-500 focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isSubmitting || loading ? 'Verifying...' : 'Verify OTP'}
                </motion.button>
              </form>

              <p className="text-center text-slate-700 font-medium mt-6">
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendOtp}
                  type="button"
                  className="font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
