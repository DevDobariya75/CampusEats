import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Clock, CheckCircle, AlertCircle, ChefHat, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { ordersApi } from '../api/services'
import { PageTransition, LoadingSpinner, Badge } from '../components/ui/Button'
import { AnimatedGradientBg, StaggerContainer, StaggerItem } from '../components/ui/3DElements'
import { formatPrice, formatDate } from '../utils/helpers'

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [filteredOrders, setFilteredOrders] = useState([])

  const load = async () => {
    try {
      setLoading(true)
      const response = await ordersApi.listMine()
      const ordersList = Array.isArray(response.data) ? response.data : response.data?.orders || []
      setOrders(ordersList)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load orders')
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
    }, 15000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let results = orders

    if (filter !== 'all') {
      results = results.filter((order) => order.status === filter)
    }

    setFilteredOrders(results)
  }, [orders, filter])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-5 h-5" />
      case 'prepared':
      case 'on_the_way':
        return <ShoppingBag className="w-5 h-5" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'prepared', label: 'Ready' },
    { value: 'on_the_way', label: 'On The Way' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

        <div className="relative py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-8 h-8 text-sky-500 dark:text-sky-400" />
                <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white">
                  Your Orders
                </h1>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap custom-scrollbar">
                {statusOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(option.value)}
                    className={`px-5 py-2 rounded-full font-bold transition-all whitespace-nowrap border text-sm uppercase tracking-widest ${
                      filter === option.value
                        ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)] border-sky-400'
                        : 'bg-white dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center min-h-96">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredOrders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <ChefHat className="w-16 h-16 text-slate-400 mx-auto mb-4 dark:text-slate-600" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No orders yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-semibold">Start ordering delicious food from our amazing shops!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:bg-sky-400 transition-all uppercase tracking-widest text-sm"
                >
                  Browse Shops
                </motion.button>
              </motion.div>
            )}

            {/* Orders List */}
            {!loading && filteredOrders.length > 0 && (
              <StaggerContainer delay={0.1}>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <StaggerItem key={order._id}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="cursor-pointer bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 group hover:shadow-[0_8px_40px_rgba(14,165,233,0.15)] hover:border-sky-500/30 transition-all"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                                {order.shop?.name || 'Order'}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-bold">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-orange-400" />
                                  {formatDate(order.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-orange-400" />
                                  {order.deliveryAddress?.area || 'Campus'}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {formatPrice(order.totalAmount)}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-slate-200 dark:border-white/10 pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-white">
                              {getStatusIcon(order.status)}
                              <Badge variant={order.status === 'delivered' ? 'success' : 'primary'}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                              </Badge>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </div>
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
