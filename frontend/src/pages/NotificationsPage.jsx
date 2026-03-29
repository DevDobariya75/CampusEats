import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle2, Circle, ShoppingBag, Store, AlertCircle, Info } from 'lucide-react'
import { notificationsApi } from '../api/services'
import { PageTransition } from '../components/ui/Button'
import { formatDate } from '../utils/helpers'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const response = await notificationsApi.list()
      setNotifications(Array.isArray(response.data) ? response.data : response.data?.notifications || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const intervalId = setInterval(load, 8000)
    return () => clearInterval(intervalId)
  }, [])

  const markRead = async (notificationId) => {
    try {
      await notificationsApi.markRead(notificationId)
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update': return <ShoppingBag className="w-5 h-5 text-orange-500" />
      case 'shop_update': return <Store className="w-5 h-5 text-amber-500" />
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-500" />
      default: return <Info className="w-5 h-5 text-indigo-500" />
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

        <div className="relative z-10 py-12 px-4 md:px-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <Bell className="w-6 h-6 text-orange-500" />
              </div>
              <h1 className="text-3xl font-black font-display tracking-wide text-slate-900 dark:text-white">
                Notifications
              </h1>
            </div>

            {notifications.some(n => !n.isRead) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-sm rounded-xl border border-orange-200 dark:border-orange-500/20 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark all as read
              </motion.button>
            )}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
            </motion.div>
          )}

          {/* Feed */}
          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading notifications...</p>
                </motion.div>
              ) : notifications.length === 0 ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-white mb-2">You're all caught up!</h3>
                  <p className="text-slate-500 dark:text-slate-400">No new notifications right now.</p>
                </motion.div>
              ) : (
                notifications.map((notification, idx) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300 ${
                      notification.isRead
                        ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'
                        : 'bg-white dark:bg-[#111827] border-orange-200 dark:border-orange-500/30 shadow-md dark:shadow-[0_4px_20px_rgba(249,115,22,0.1)]'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-slate-100 dark:bg-white/10">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className={`text-base font-bold truncate ${notification.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm mb-3 ${notification.isRead ? 'text-slate-500 dark:text-slate-400' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                        {notification.message}
                      </p>
                      
                      {!notification.isRead && (
                        <button
                          onClick={() => markRead(notification._id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors uppercase tracking-wider"
                        >
                          <Circle className="w-3 h-3 fill-orange-600 dark:fill-orange-400" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

