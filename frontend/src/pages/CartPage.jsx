import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, AlertCircle } from 'lucide-react'
import { cartApi, shopsApi } from '../api/services'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { AnimatedGradientBg, StaggerContainer, StaggerItem } from '../components/ui/3DElements'
import { formatPrice } from '../utils/helpers'

export default function CartPage() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  // Calculate totals from items
  const subtotal = items.reduce((total, item) => {
    const price = Number(item.menuItem?.price || item.price || 0)
    const qty = Number(item.quantity || 0)
    return total + (price * qty)
  }, 0)

  const total = summary?.total ? Number(summary.total) : subtotal

  const loadCartData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const [shopResponse, itemsResponse, summaryResponse] = await Promise.all([
        shopsApi.getById(shopId),
        cartApi.getCartItems(shopId),
        cartApi.getSummary(shopId),
      ])
      
      setShop(shopResponse.data)
      const cartItems = Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.cartItems || []
      setItems(cartItems)
      setSummary(summaryResponse.data || {})
      localStorage.setItem('activeCartShopId', shopId)
    } catch (err) {
      setError(err.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }, [shopId])

  useEffect(() => {
    loadCartData()
  }, [loadCartData])

  const updateItemQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      await removeItem(itemId)
      return
    }

    try {
      setUpdating(true)
      await cartApi.updateItem(shopId, itemId, { quantity })
      await loadCartData()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (itemId) => {
    try {
      setUpdating(true)
      await cartApi.removeItem(shopId, itemId)
      await loadCartData()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleCheckout = () => {
    if (!items.length) return
    navigate(`/checkout/${shopId}`)
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white dark:bg-slate-950">
        <AnimatedGradientBg />

        <section className="relative py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="w-8 h-8 text-orange-500" />
                <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
                  Your Cart
                </h1>
              </div>
              {shop && (
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  From <span className="font-bold text-slate-800 dark:text-white">{shop.name}</span>
                </p>
              )}
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-lg flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                  <p className="text-sm text-red-700 dark:text-red-200 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">Loading your cart...</p>
              </motion.div>
            )}

            {/* Cart Content */}
            {!loading && items.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Items List */}
                <div className="md:col-span-2 space-y-4">
                  <StaggerContainer delay={0.05}>
                    {items.map((item) => (
                      <StaggerItem key={item._id}>
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700 hover:shadow-xl dark:hover:shadow-2xl transition-all"
                        >
                          <div className="flex gap-4">
                            {/* Image */}
                            <motion.img
                              whileHover={{ scale: 1.05 }}
                              src={item.menuItem?.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'}
                              alt={item.menuItem?.name}
                              className="w-24 h-24 rounded-lg object-cover"
                            />

                            {/* Details */}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                {item.menuItem?.name}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-1">
                                {item.menuItem?.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-orange-600">
                                  {formatPrice(item.menuItem?.price || 0)}
                                </span>

                                {/* Quantity Controls */}
                                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateItemQuantity(item._id, item.quantity - 1)}
                                    disabled={updating}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all disabled:opacity-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </motion.button>

                                  <span className="w-8 text-center font-bold text-slate-900 dark:text-white">
                                    {item.quantity}
                                  </span>

                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateItemQuantity(item._id, item.quantity + 1)}
                                    disabled={updating}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all disabled:opacity-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item._id)}
                              disabled={updating}
                              className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 p-2"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>

                {/* Summary Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg dark:shadow-2xl dark:border dark:border-slate-700 h-fit sticky top-4"
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Subtotal</span>
                      <span className="font-semibold">{formatPrice(summary?.subTotal || 0)}</span>
                    </div>
                    {summary?.deliveryFee > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Delivery Fee</span>
                        <span className="font-semibold">{formatPrice(summary.deliveryFee)}</span>
                      </div>
                    )}
                    {summary?.tax > 0 && (
                      <div className="flex justify-between text-slate-600 dark:text-slate-400">
                        <span>Tax</span>
                        <span className="font-semibold">{formatPrice(summary.tax)}</span>
                      </div>
                    )}
                    {summary?.discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span className="font-semibold">-{formatPrice(summary.discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
                        {formatPrice(total)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Inclusive of all taxes</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/')}
                    type="button"
                    className="w-full mt-3 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Continue Shopping
                  </motion.button>
                </motion.div>
              </div>
            )}

            {/* Empty Cart State */}
            {!loading && items.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your cart is empty</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Start adding items from {shop?.name}!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Browse Shops
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
