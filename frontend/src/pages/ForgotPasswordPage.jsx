import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
    }
  }

  return (
    <section className="auth-wrap auth-shell">
      <aside className="auth-brand-panel">
        <p className="auth-kicker">CampusEats Account Recovery</p>
        <h2>Reset your password with Cognito OTP verification</h2>
        <p>
          Enter your account email to receive a verification OTP, then submit the OTP with a new password.
        </p>
      </aside>

      <form className="card form auth-card" onSubmit={otpSent ? handleResetPassword : handleSendOtp}>
        <h1>Forgot password</h1>
        <p>Secure reset is powered by AWS Cognito.</p>

        {message && <div className="card success">{message}</div>}
        {error && <div className="card danger">{error}</div>}

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your registered email"
          required
          disabled={otpSent}
        />

        {otpSent && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="New password"
              minLength={8}
              required
            />
          </>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Please wait...' : otpSent ? 'Reset Password' : 'Send OTP'}
        </button>

        <p>
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}
