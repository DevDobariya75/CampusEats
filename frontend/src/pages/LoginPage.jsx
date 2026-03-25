import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/'

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      await login({ email, password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-wrap auth-shell">
      <aside className="auth-brand-panel">
        <p className="auth-kicker">CampusEats</p>
        <h2>Eat what you love, delivered around campus</h2>
        <p>Sign in to track orders, manage addresses, and get instant updates.</p>
      </aside>

      <form className="card form auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Login to continue your CampusEats journey.</p>
        {error && <div className="card error">{error}</div>}
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          required
        />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
        <p className="auth-meta">
          Forgot password? <Link to="/forgot-password">Reset it here</Link>
        </p>
        <p>
          New user? <Link to="/register">Create account</Link>
        </p>
      </form>
    </section>
  )
}
