import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { notificationsApi } from '../api/services'

export default function NotificationBell() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let mounted = true

    const fetchCount = async () => {
      try {
        const response = await notificationsApi.unreadCount()
        const value = response.data?.unreadCount ?? response.data?.count ?? 0
        if (mounted) {
          setCount(value)
        }
      } catch {
        if (mounted) {
          setCount(0)
        }
      }
    }

    fetchCount()
    const timer = setInterval(fetchCount, 8000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  return (
    <Link className="notif-bell" to="/notifications" aria-label="Notifications">
      <span>Notifications</span>
      {count > 0 && <strong>{count}</strong>}
    </Link>
  )
}
