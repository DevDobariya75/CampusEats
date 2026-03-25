import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'customer',
  shopName: '',
  shopDescription: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [profilePicture, setProfilePicture] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
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

      await register(formData)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-wrap auth-shell">
      <aside className="auth-brand-panel">
        <p className="auth-kicker">Join CampusEats</p>
        <h2>Discover local campus favorites in one app</h2>
        <p>Create your account to order, sell, or deliver with confidence.</p>
      </aside>

      <form className="card form auth-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Choose your role and start using CampusEats.</p>
        {error && <div className="card error">{error}</div>}
        <input
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Full name"
          required
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          required
        />
        <input
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="Phone"
          required
        />
        <select
          value={form.role}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              role: event.target.value,
              ...(event.target.value !== 'shopkeeper' ? { shopName: '', shopDescription: '' } : {}),
            }))
          }
        >
          <option value="customer">Customer</option>
          <option value="shopkeeper">Shopkeeper</option>
          <option value="delivery">Delivery partner</option>
        </select>
        {form.role === 'shopkeeper' && (
          <>
            <input
              value={form.shopName}
              onChange={(event) => setForm((prev) => ({ ...prev, shopName: event.target.value }))}
              placeholder="Shop name"
              required
            />
            <textarea
              value={form.shopDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, shopDescription: event.target.value }))}
              placeholder="Shop description"
              required
            />
          </>
        )}
        <input type="file" onChange={(event) => setProfilePicture(event.target.files?.[0] || null)} />
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="auth-meta">
          Forgot password? <Link to="/forgot-password">Reset it here</Link>
        </p>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  )
}
