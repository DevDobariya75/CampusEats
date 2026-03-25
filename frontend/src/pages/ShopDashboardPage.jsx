import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { ordersApi, shopsApi } from '../api/services'
import { formatPrice } from '../utils/helpers'

export default function ShopDashboardPage() {
  const [shopId, setShopId] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEarned: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })

  const loadData = async () => {
    try {
      setError('')
      setMessage('')
      setLoading(true)
      const myShopResponse = await shopsApi.getMine()
      const myShop = myShopResponse.data
      const currentShopId = myShop?._id || ''
      setShopId(currentShopId)

      if (currentShopId) {
        const ordersResponse = await ordersApi.listForShop(currentShopId)
        const ordersList = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.orders || []
        setOrders(ordersList)

        // Calculate stats
        const totalOrders = ordersList.length
        const totalEarned = ordersList.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
        const pendingOrders = ordersList.filter(o => o.status === 'Pending').length
        const completedOrders = ordersList.filter(o => o.status === 'Delivered').length

        setStats({
          totalOrders,
          totalEarned,
          pendingOrders,
          completedOrders,
        })
      } else {
        setOrders([])
        setError('No shop found for this account.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      setError('')
      const response = await ordersApi.updateStatus(orderId, { status })
      setMessage(response.message || `Order moved to ${status}.`)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const getNextActions = (status) => {
    if (status === 'Pending') {
      return ['Confirmed', 'Cancelled']
    }
    if (status === 'Confirmed') {
      return ['Preparing', 'Cancelled']
    }
    if (status === 'Preparing') {
      return ['Out for Delivery']
    }
    return []
  }

  const getStatusClassName = (status) => {
    if (status === 'Delivered') {
      return 'status-chip status-done'
    }
    if (status === 'Cancelled') {
      return 'status-chip status-cancel'
    }
    return 'status-chip status-progress'
  }

  const statItems = [
    { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Earned', value: formatPrice(stats.totalEarned), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'from-orange-500 to-orange-600' },
    { title: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <section className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Shop Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage incoming orders for your shop</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-green-700 dark:text-green-300"
          >
            {message}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statItems.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
              >
                <div className={`inline-block p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full"
              />
            </div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading incoming orders...</p>
          </motion.div>
        )}

        {!loading && shopId && (
          <section className="orders-board">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
              >
                <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No incoming orders yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">New customer orders will appear here.</p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order, idx) => {
                  const actions = getNextActions(order.status)
                  const assignedName = order.assignedPartner?.name || 'Not assigned yet'
                  const assignedPhone = order.assignedPartner?.phone || 'Not available'
                  const hasAssignedPartner = Boolean(order.assignedPartner)
                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order #{order._id.slice(-6)}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : order.status === 'Cancelled'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                        }`}>{order.status}</span>
                      </div>

                      {order.status === 'Out for Delivery' && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <strong>Assigned to:</strong> {hasAssignedPartner ? `${assignedName} (${assignedPhone})` : 'Not assigned yet'}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Amount</p>
                          <p className="font-bold text-slate-900 dark:text-white">Rs {order.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-slate-600 dark:text-slate-400">Customer</p>
                          <p className="font-bold text-slate-900 dark:text-white">{order.customer?.name || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-600 dark:text-slate-400">Address</p>
                          <p className="font-bold text-slate-900 dark:text-white">{order.deliveryAddress?.addressLine || '-'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-600 dark:text-slate-400">Notes</p>
                          <p className="text-slate-900 dark:text-slate-300">{order.specialNotes || 'No notes'}</p>
                        </div>
                      </div>

                      {(order.status === 'Out for Delivery' || hasAssignedPartner) && (
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4 text-sm">
                          <p className="text-slate-600 dark:text-slate-400 mb-2"><strong>Delivery Partner:</strong> {assignedName}</p>
                          <p className="text-slate-600 dark:text-slate-400 mb-2"><strong>Mobile:</strong> {assignedPhone}</p>
                          <p className="text-slate-600 dark:text-slate-400"><strong>Status:</strong> {order.deliveryStatus || 'Assigned'}</p>
                        </div>
                      )}

                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {actions.map((status) => (
                            <button
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                status === 'Cancelled'
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                              }`}
                              type="button"
                              key={status}
                              onClick={() => updateStatus(order._id, status)}
                            >
                              Mark {status}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </section>
  )
}
