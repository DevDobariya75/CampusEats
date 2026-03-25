import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('If your email exists, a reset link has been prepared. Please contact support to enable backend reset endpoint.')
  }

  return (
    <section className="auth-wrap auth-shell">
      <aside className="auth-brand-panel">
        <p className="auth-kicker">CampusEats Account Recovery</p>
        <h2>Reset your password and get back to ordering faster</h2>
        <p>
          Enter your account email and follow the recovery instructions. This experience mirrors modern food-delivery apps.
        </p>
      </aside>

      <form className="card form auth-card" onSubmit={handleSubmit}>
        <h1>Forgot password</h1>
        <p>We will help you recover your account securely.</p>
        {message && <div className="card success">{message}</div>}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your registered email"
          required
        />
        <button className="btn" type="submit">
          Send reset instructions
        </button>
        <p>
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}
