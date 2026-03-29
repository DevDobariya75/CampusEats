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
    { title: 'Total Shops', value: stats.totalShops, icon: Store, color: 'from-orange-500 to-orange-600' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { title: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Active Shops', value: stats.activeShops, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
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
          <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider uppercase">Manage Campus Eats platform and monitor statistics</p>
        </motion.div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center min-h-96"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
              <p className="text-orange-400 font-bold uppercase tracking-widest text-sm">Loading dashboard...</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className="text-red-400 font-bold">{error}</p>
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

        {/* Recent Orders Section */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none"
          >
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 uppercase tracking-widest">
              <ShoppingBag className="w-6 h-6 text-orange-500" />
              Recent Orders
            </h2>

            {recentOrders.length === 0 ? (
              <p className="text-center text-slate-400 font-bold uppercase tracking-widest py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">
                      <th className="pb-4 font-bold">Order ID</th>
                      <th className="pb-4 font-bold">Shop</th>
                      <th className="pb-4 font-bold">Customer</th>
                      <th className="pb-4 font-bold">Amount</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {recentOrders.map((order, idx) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 font-mono text-sm text-orange-400 font-bold truncate pr-4">
                          #{order._id?.slice(-8) || '-'}
                        </td>
                        <td className="py-4 text-slate-900 dark:text-white font-bold">{order.shop?.name || '-'}</td>
                        <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{order.customer?.name || '-'}</td>
                        <td className="py-4 text-orange-400 font-black tracking-widest">
                          {formatPrice(order.totalAmount || 0)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-black border ${
                              order.status === 'Delivered'
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : order.status === 'Cancelled'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest">
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
            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-orange-200 dark:border-orange-500/30 hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 dark:text-orange-400 text-xs font-black uppercase tracking-widest">Avg Order Value</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
                    {formatPrice(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl shadow-inner border border-orange-100 dark:border-orange-500/20">
                  <DollarSign className="w-10 h-10 text-orange-500 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-purple-200 dark:border-purple-500/30 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest">Orders Per Shop</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
                    {stats.totalShops > 0 ? (stats.totalOrders / stats.totalShops).toFixed(1) : 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl shadow-inner border border-purple-100 dark:border-purple-500/20">
                  <ShoppingBag className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-3xl p-8 border border-green-200 dark:border-green-500/30 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-widest">Shop Success Rate</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
                    {stats.totalShops > 0 ? ((stats.activeShops / stats.totalShops) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl shadow-inner border border-green-100 dark:border-green-500/20">
                  <TrendingUp className="w-10 h-10 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

