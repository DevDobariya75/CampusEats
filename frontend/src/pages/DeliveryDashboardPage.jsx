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
  const [verificationCodes, setVerificationCodes] = useState({})

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
        const code = String(verificationCodes[deliveryId] || '').trim()
        if (!/^\d{4}$/.test(code)) {
          setError('Enter a valid 4-digit customer code to complete delivery.')
          return
        }
        await deliveriesApi.markDelivered(deliveryId, { verificationCode: code })
        setVerificationCodes((prev) => ({ ...prev, [deliveryId]: '' }))
      }
      await load()
    } catch (err) {
      const errMessage = err.message || ''
      if (/invalid delivery verification code|wrong code/i.test(errMessage)) {
        window.alert('Wrong code. Please ask the customer for the correct 4-digit code.')
      }
      setError(err.message)
    }
  }

  const statItems = [
    { title: 'Total Assigned', value: stats?.totalAssigned ?? stats?.totalDeliveries ?? stats?.total ?? 0, icon: Truck, color: 'from-orange-500 to-orange-600' },
    { title: 'Total Earned', value: formatPrice(totalEarned), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Picked Up', value: stats?.pickedUp ?? 0, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
    { title: 'Delivered', value: stats?.delivered ?? 0, icon: CheckCircle, color: 'from-purple-500 to-purple-600' },
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
          <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Delivery Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wider uppercase">Manage your deliveries and earnings</p>
        </motion.div>

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
        {!loading && stats && (
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

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
            </div>
            <p className="mt-4 text-orange-400 font-bold uppercase tracking-widest text-sm">Loading deliveries...</p>
          </motion.div>
        )}

        {/* Deliveries List */}
        {!loading && (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-white/5 rounded-3xl p-12 text-center border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none col-span-full"
              >
                <Truck className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-2">No active deliveries</h3>
                <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-sm">Waiting for new orders to be assigned...</p>
              </motion.div>
            )}
            {deliveries.map((delivery, idx) => (
              <motion.div
                key={delivery._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_40px_rgba(249,115,22,0.15)] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Order</p>
                      <h3 className="text-xl font-black text-orange-500 dark:text-orange-400 font-mono">#{delivery.order?._id?.slice(-6) || '-'}</h3>
                      <p className="text-xs text-orange-400 font-black tracking-widest mt-1">
                        Rs {delivery.order?.totalAmount || 0}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${
                      delivery.status === 'Delivered'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : delivery.status === 'Accepted'
                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                    }`}>{delivery.status}</span>
                  </div>

                  {delivery.status !== 'Assigned' && (
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                        <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 mt-1">
                          <MapPin className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Pickup From</span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{delivery.order?.shop?.name || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
                        <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-500/20 mt-1">
                          <MapPin className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div>
                          <span className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">Delivery To</span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{delivery.order?.deliveryAddress?.addressLine || '-'}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Customer</span>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{delivery.order?.customer?.name || '-'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 flex gap-3">
                  {delivery.status === 'Assigned' && (
                    <button
                      onClick={() => advance(delivery._id, 'accept')}
                      className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                    >
                      Accept Order
                    </button>
                  )}
                  {delivery.status === 'Accepted' && (
                    <button
                      onClick={() => advance(delivery._id, 'picked')}
                      className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all"
                    >
                      Mark Picked Up
                    </button>
                  )}
                  {(delivery.status === 'Picked Up' || delivery.status === 'PickedUp') && (
                    <div className="w-full space-y-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        value={verificationCodes[delivery._id] || ''}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, '').slice(0, 4)
                          setVerificationCodes((prev) => ({ ...prev, [delivery._id]: digits }))
                        }}
                        placeholder="Enter 4-digit customer code"
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm font-bold tracking-[0.2em] text-slate-900 dark:text-white outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={() => advance(delivery._id, 'delivered')}
                        className="w-full py-3 px-4 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
                      >
                        Verify Code & Mark Delivered
                      </button>
                    </div>
                  )}
                  {delivery.status === 'Delivered' && (
                    <div className="w-full py-3 px-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest text-center">
                      Completed
                    </div>
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

