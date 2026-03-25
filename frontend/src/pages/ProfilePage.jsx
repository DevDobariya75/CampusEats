import { useState } from 'react'
import { userApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profilePicture, setProfilePicture] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const updateProfile = async (event) => {
    event.preventDefault()

    try {
      setError('')
      const formData = new FormData()
      formData.append('name', name)
      formData.append('phone', phone)
      if (profilePicture) {
        formData.append('profilePicture', profilePicture)
      }
      await userApi.updateProfile(formData)
      await refreshUser()
      setMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <h1>Profile</h1>
      {message && <div className="card success">{message}</div>}
      {error && <div className="card error">{error}</div>}

      <form className="card form auth-card" onSubmit={updateProfile}>
        <h3>Edit profile</h3>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" required />
        <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" required />
        <input type="file" onChange={(event) => setProfilePicture(event.target.files?.[0] || null)} />
        <button className="btn" type="submit">
          Save profile
        </button>
      </form>
    </section>
  )
}
