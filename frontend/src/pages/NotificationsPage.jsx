import { useEffect, useState } from 'react'
import { notificationsApi } from '../api/services'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      const response = await notificationsApi.list()
      setNotifications(Array.isArray(response.data) ? response.data : response.data?.notifications || [])
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      load()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [])

  const markRead = async (notificationId) => {
    await notificationsApi.markRead(notificationId)
    load()
  }

  const markAllRead = async () => {
    await notificationsApi.markAllRead()
    load()
  }

  return (
    <section>
      <div className="row spread">
        <h1>Notifications</h1>
        <button className="btn btn-soft" type="button" onClick={markAllRead}>
          Mark all as read
        </button>
      </div>

      {error && <div className="card error">{error}</div>}

      <div className="stack">
        {notifications.map((notification) => (
          <article className="card" key={notification._id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <p>Type: {notification.type}</p>
            <p>{new Date(notification.createdAt).toLocaleString()}</p>
            {!notification.isRead && (
              <button className="btn btn-soft" type="button" onClick={() => markRead(notification._id)}>
                Mark read
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
