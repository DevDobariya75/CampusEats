import { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { Users, Store, ShoppingBag, TrendingUp, DollarSign, Truck, AlertCircle } from 'lucide-react'
import { ordersApi, shopsApi } from '../api/services'
import { formatPrice } from '../utils/helpers'

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalOrders: 0,
    totalRevenue: 0,
    deliveryPartners: 0,
    activeShops: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStats = async () => {
      try {
        setError('')
        setLoading(true)

        // Fetch shops
        const shopsResponse = await shopsApi.list('?limit=100')
        const shops = Array.isArray(shopsResponse.data) ? shopsResponse.data : shopsResponse.data?.shops || []

        // For each shop, get orders
        let allOrders = []
        for (const shop of shops) {
          try {
            const ordersResponse = await ordersApi.listForShop(shop._id)
            const shopOrders = Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.orders || []
            allOrders = [...allOrders, ...shopOrders]
          } catch {
            // Skip shops that fail to load
            continue
          }
        }

        // Calculate stats
        const totalRevenue = allOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
        const activeShops = shops.filter(s => s.isOpen).length
        const recentOrdersList = allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10)

        setStats({
          totalUsers: 0, // Would need to fetch from user endpoint
          totalShops: shops.length,
          totalOrders: allOrders.length,
          totalRevenue,
          deliveryPartners: 0, // Would need to fetch from deliveries/user endpoint
          activeShops,
        })

        setRecentOrders(recentOrdersList)
      } catch (err) {
        setError(err.message || 'Failed to load admin statistics')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const statItems = [
    { title: 'Total Shops', value: stats.totalShops, icon: Store, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Active Shops', value: stats.activeShops, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <section className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage Campus Eats platform and monitor statistics</p>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center min-h-96"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
            </div>
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
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading admin statistics...</p>
          </motion.div>
        )}

        {/* Recent Orders Section */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
          >
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              Recent Orders
            </h2>

            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-600 dark:text-slate-400 py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Order ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Shop</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 dark:text-white">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, idx) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-900 dark:text-white font-mono text-sm">
                          #{order._id?.slice(-6) || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white">{order.shop?.name || '-'}</td>
                        <td className="px-4 py-3 text-slate-900 dark:text-white">{order.customer?.name || '-'}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {formatPrice(order.totalAmount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status === 'Delivered'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Summary Stats */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 dark:text-blue-300 text-sm font-semibold">Average Order Value</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                    {formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-300 dark:text-blue-700" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-300 text-sm font-semibold">Orders Per Shop</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                    {stats.totalShops > 0 ? (stats.totalOrders / stats.totalShops).toFixed(1) : 0}
                  </p>
                </div>
                <ShoppingBag className="w-12 h-12 text-purple-300 dark:text-purple-700" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-300 text-sm font-semibold">Shop Success Rate</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                    {stats.totalShops > 0 ? ((stats.activeShops / stats.totalShops) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-300 dark:text-green-700" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
