import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell } from 'lucide-react'
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
    <Link to="/notifications" className="relative group p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Bell className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)] border-2 border-white dark:border-[#060B13]"
            >
              {count > 99 ? '99+' : count}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}
