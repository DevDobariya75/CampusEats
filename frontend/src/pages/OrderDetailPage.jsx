import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ShoppingBag, CheckCircle, AlertCircle, Calendar, MapPin, Receipt, XCircle } from 'lucide-react'
import { ordersApi } from '../api/services'
import { PageTransition, LoadingSpinner, Badge } from '../components/ui/Button'
import { formatPrice, formatDate } from '../utils/helpers'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadOrder = async () => {
    try {
      const response = await ordersApi.getById(orderId)
      const value = Array.isArray(response.data)
        ? response.data.find((item) => item._id === orderId)
        : response.data
      setOrder(value)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

  useEffect(() => {
    const isTerminal = ['delivered', 'cancelled'].includes(order?.status?.toLowerCase())
    if (isTerminal) {
      return undefined
    }

    const intervalId = setInterval(() => {
      loadOrder()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [orderId, order?.status])

  const isCancelable = useMemo(
    () => order && ['pending', 'confirmed'].includes(order.status?.toLowerCase()),
    [order],
  )

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      setLoading(true)
      await ordersApi.cancel(orderId)
      await loadOrder()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase()
    switch (s) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-6 h-6 text-sky-400" />
      case 'prepared':
      case 'on_the_way':
        return <ShoppingBag className="w-6 h-6 text-sky-400" />
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <AlertCircle className="w-6 h-6 text-sky-400" />
    }
  }

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-[#060B13] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#060B13] text-[#f8fafc]">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)]" />

        <div className="relative py-12 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex items-center gap-4"
            >
              <button 
                onClick={() => navigate('/orders')}
                className="p-2 border border-white/20 rounded-full hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-black font-display text-white mb-1">
                  Order Details
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">#{orderId.slice(-8)}</p>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <p className="text-red-400 font-bold">{error}</p>
              </motion.div>
            )}

            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Status Card */}
                <div className="bento-card p-8 border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Status</p>
                        <h2 className="text-2xl font-black text-white capitalize">
                          {order.status?.replace('_', ' ')}
                        </h2>
                      </div>
                    </div>
                    {isCancelable && (
                      <button
                        onClick={cancelOrder}
                        className="px-6 py-3 bg-red-500/20 text-red-500 font-bold rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shop & Customer Info */}
                  <div className="bento-card p-6 space-y-6">
                    <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-sky-400" /> Shop
                      </h3>
                      <p className="font-bold text-white text-lg">{order.shop?.name || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sky-400" /> Delivery Address
                      </h3>
                      <p className="font-bold text-white text-sm">{order.deliveryAddress?.addressLine || '-'}</p>
                      <p className="text-slate-400 text-sm mt-1">PIN: {order.deliveryAddress?.pinCode || '-'}</p>
                    </div>
                    <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-sky-400" /> Date & Time
                      </h3>
                      <p className="font-bold text-white text-sm">{order.createdAt ? formatDate(order.createdAt) : '-'}</p>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bento-card p-6 flex flex-col justify-between">
                    <div>
                       <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-sky-400" /> Order Summary
                      </h3>
                      {order.specialNotes && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mb-1">Notes</p>
                          <p className="text-sm text-slate-300">{order.specialNotes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 font-bold text-sm uppercase tracking-widest">Payment Method</span>
                        <span className="text-white font-bold text-sm capitalize">{order.paymentMethod || 'Cash'}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-slate-300 font-black text-xs uppercase tracking-widest">Total Amount</span>
                        <span className="text-2xl font-black text-orange-500">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
