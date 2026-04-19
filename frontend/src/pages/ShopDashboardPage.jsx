import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import { ordersApi, shopsApi } from '../api/services'
import { formatPrice } from '../utils/helpers'

export default function ShopDashboardPage() {
  const [shopId, setShopId] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [shopEarnings, setShopEarnings] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalEarned: 0,
    pendingOrders: 0,
    completedOrders: 0,
  })
  const ordersRef = useRef([])

  const calculateStats = (ordersList) => {
    const totalOrders = ordersList.length
    const totalEarned = ordersList.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
    const pendingOrders = ordersList.filter((o) => o.status === 'Pending').length
    const completedOrders = ordersList.filter((o) => o.status === 'Delivered').length

    return {
      totalOrders,
      totalEarned,
      pendingOrders,
      completedOrders,
    }
  }

  const loadData = async ({ silent = false } = {}) => {
    try {
      setError('')
      setMessage('')
      if (!silent) {
        setLoading(true)
      }
      const myShopResponse = await shopsApi.getMine()
      const myShop = myShopResponse.data
      const currentShopId = myShop?._id || ''
      setShopId(currentShopId)

      if (currentShopId) {
        const [ordersResponse, earningsResponse] = await Promise.all([
          ordersApi.listForShop(currentShopId),
          shopsApi.earnings().catch(() => ({ data: null }))
        ])
        
        const ordersList = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.orders || []
        setOrders(ordersList)
        setStats(calculateStats(ordersList))
        
        // Fetch and display earnings data
        if (earningsResponse?.data) {
          setShopEarnings(earningsResponse.data)
        }
      } else {
        setOrders([])
        setShopEarnings(null)
        setError('No shop found for this account.')
      }
    } catch (err) {
      const text = String(err.message || '').toLowerCase()
      if (text.includes('shop not found')) {
        setShopId('')
        setOrders([])
        setShopEarnings(null)
        setStats({
          totalOrders: 0,
          totalEarned: 0,
          pendingOrders: 0,
          completedOrders: 0,
        })
      } else {
        setError(err.message)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    ordersRef.current = orders
  }, [orders])

  useEffect(() => {
    if (!shopId) {
      return undefined
    }

    const pollForNewOrders = async () => {
      try {
        const response = await ordersApi.listForShop(shopId)
        const latestOrders = Array.isArray(response.data) ? response.data : response.data?.orders || []
        const existingOrderIds = new Set(ordersRef.current.map((order) => order._id))
        const hasIncomingOrder = latestOrders.some((order) => !existingOrderIds.has(order._id))

        // Refresh dashboard data only when a new customer order is received.
        if (hasIncomingOrder) {
          setOrders(latestOrders)
          setStats(calculateStats(latestOrders))
          setMessage('New order received.')
        }
      } catch {
        // Silent polling should not interrupt dashboard usage.
      }
    }

    const pollForEarnings = async () => {
      try {
        const earningsResponse = await shopsApi.earnings()
        if (earningsResponse?.data) {
          setShopEarnings(earningsResponse.data)
        }
      } catch {
        // Silent earnings polling
      }
    }

    const intervalId = setInterval(() => {
      pollForNewOrders()
      pollForEarnings()
    }, 5000)

    // Initial earnings fetch
    pollForEarnings()

    return () => clearInterval(intervalId)
  }, [shopId])

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

  const statItems = [
    { title: 'Total Orders', value: stats.totalOrders, icon: Package, color: 'from-orange-500 to-orange-600' },
    { title: 'Total Delivery Earnings', value: formatPrice(shopEarnings?.totalDeliveryChargeEarnings || 0), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: Clock, color: 'from-orange-500 to-orange-600' },
    { title: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <section className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] py-8 px-4 relative transition-colors duration-300">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Shop Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider uppercase">Manage incoming orders for your shop</p>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            <CheckCircle className="w-6 h-6 text-green-500" />
            <p className="text-green-400 font-bold tracking-widest uppercase text-sm">{message}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-400 font-bold tracking-widest uppercase text-sm">{error}</p>
          </motion.div>
        )}

        {/* Stats Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statItems.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all"
              >
                <div className={`inline-block p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && shopId && (
          <section className="orders-board">
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-white/5 rounded-3xl p-12 text-center border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none"
              >
                <Package className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No incoming orders yet</h3>
                <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-sm">New customer orders will appear here.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_40px_rgba(249,115,22,0.15)] transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Order</p>
                            <h3 className="text-xl font-black text-orange-500 dark:text-orange-400 font-mono">#{order._id.slice(-6)}</h3>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border tracking-widest ${
                            order.status === 'Delivered'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : order.status === 'Cancelled'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>{order.status}</span>
                        </div>

                        {order.status === 'Out for Delivery' && (
                          <div className="mb-4 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                            <p className="text-xs text-orange-500 dark:text-orange-400 font-black uppercase tracking-widest mb-1">Assigned To</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {hasAssignedPartner ? `${assignedName} (${assignedPhone})` : 'Not assigned yet'}
                            </p>
                          </div>
                        )}

                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Amount</span>
                            <span className="font-black text-orange-500 dark:text-orange-400 text-lg">Rs {order.totalAmount}</span>
                          </div>
                          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10">
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Customer</span>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">{order.customer?.name || '-'}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Address</span>
                            <p className="font-bold text-slate-900 dark:text-white text-sm mt-1">{order.deliveryAddress?.addressLine || '-'}</p>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Items Ordered</span>
                            {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {order.orderItems.map((item) => (
                                  <div
                                    key={item._id}
                                    className="flex items-center justify-between text-sm p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                                  >
                                    <span className="font-semibold text-slate-900 dark:text-white pr-3">
                                      {item.name || 'Item'} x{item.quantity || 0}
                                    </span>
                                    <span className="font-black text-orange-500 dark:text-orange-400 whitespace-nowrap">
                                      Rs {Number(item.subTotal || 0)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm mt-1">Item details not available</p>
                            )}
                          </div>
                          {order.specialNotes && (
                            <div>
                              <span className="text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">Notes</span>
                              <p className="text-slate-900 dark:text-white text-sm mt-1 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 italic">"{order.specialNotes}"</p>
                            </div>
                          )}
                        </div>

                        {(order.status === 'Out for Delivery' || hasAssignedPartner) && (
                          <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 mb-6 text-xs">
                            <div className="flex justify-between mb-2">
                              <span className="text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">Delivery Partner</span>
                              <span className="text-slate-900 dark:text-white font-bold">{assignedName}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">Mobile</span>
                              <span className="text-slate-900 dark:text-white font-bold">{assignedPhone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">Status</span>
                              <span className="text-slate-900 dark:text-white font-bold">{order.deliveryStatus || 'Assigned'}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {actions.length > 0 && (
                        <div className="flex gap-3 mt-auto pt-4 border-t border-slate-200 dark:border-white/10">
                          {actions.map((status) => (
                            <button
                              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all border outline-none ${
                                status === 'Cancelled'
                                  ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white'
                                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]'
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

