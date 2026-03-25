import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Truck, CheckCircle, MapPin, AlertCircle, TrendingUp, DollarSign } from 'lucide-react'
import { deliveriesApi } from '../api/services'
import { formatPrice } from '../utils/helpers'

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalEarned, setTotalEarned] = useState(0)

  const load = async () => {
    try {
      setError('')
      setLoading(true)
      const [deliveriesResponse, statsResponse] = await Promise.all([
        deliveriesApi.listMine(),
        deliveriesApi.stats(),
      ])
      const deliveryList = Array.isArray(deliveriesResponse.data)
        ? deliveriesResponse.data
        : deliveriesResponse.data?.deliveries || []
      
      setDeliveries(deliveryList)
      setStats(statsResponse.data)

      // Calculate total earned from delivered orders
      const earned = deliveryList
        .filter(d => d.status === 'Delivered')
        .reduce((sum, d) => sum + (Number(d.order?.totalAmount) || 0), 0)
      setTotalEarned(earned)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const advance = async (deliveryId, action) => {
    try {
      setError('')
      if (action === 'accept') {
        await deliveriesApi.accept(deliveryId)
      }
      if (action === 'picked') {
        await deliveriesApi.markPickedUp(deliveryId)
      }
      if (action === 'delivered') {
        await deliveriesApi.markDelivered(deliveryId)
      }
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const statItems = [
    { title: 'Total Assigned', value: stats?.totalAssigned ?? stats?.totalDeliveries ?? stats?.total ?? 0, icon: Truck, color: 'from-blue-500 to-blue-600' },
    { title: 'Total Earned', value: formatPrice(totalEarned), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Picked Up', value: stats?.pickedUp ?? 0, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
    { title: 'Delivered', value: stats?.delivered ?? 0, icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
  ]

  return (
    <section className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Delivery Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your deliveries and earnings</p>
        </motion.div>

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
        {!loading && stats && (
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
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading deliveries...</p>
          </motion.div>
        )}

        {/* Deliveries List */}
        {!loading && (
          <div className="grid gap-4">
            {deliveries.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
              >
                <Truck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">No deliveries assigned yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-2">New delivery requests will appear here.</p>
              </motion.div>
            )}
            {deliveries.map((delivery, idx) => (
              <motion.div
                key={delivery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order #{delivery.order?._id?.slice(-6) || '-'}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Amount: <span className="font-semibold text-slate-900 dark:text-white">Rs {delivery.order?.totalAmount || 0}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    delivery.status === 'Delivered'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : delivery.status === 'Accepted'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  }`}>{delivery.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Shop</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{delivery.order?.shop?.name || '-'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{delivery.order?.shop?.phone || 'Not available'}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Delivery Address</p>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {delivery.order?.deliveryAddress?.pincode || '-'}
                    </p>
                  </div>
                </div>

                {delivery.status !== 'Assigned' && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Customer</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{delivery.order?.customer?.name || '-'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{delivery.order?.customer?.phone || 'Not available'}</p>
                      </div>
                      <div>
                        <p className="text-slate-600 dark:text-slate-400">Delivery Address</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {delivery.order?.deliveryAddress?.addressLine || '-'}
                          {delivery.order?.deliveryAddress?.pincode ? `, ${delivery.order.deliveryAddress.pincode}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {delivery.status === 'Assigned' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all"
                      type="button"
                      onClick={() => advance(delivery._id, 'accept')}
                    >
                      Accept Delivery
                    </motion.button>
                  )}
                  {delivery.status === 'Accepted' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
                      type="button"
                      onClick={() => advance(delivery._id, 'picked')}
                    >
                      Mark Picked Up
                    </motion.button>
                  )}
                  {(delivery.status === 'Accepted' || delivery.status === 'Picked Up') && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-semibold transition-all"
                      type="button"
                      onClick={() => advance(delivery._id, 'delivered')}
                    >
                      Mark Delivered
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
