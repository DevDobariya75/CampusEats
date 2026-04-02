import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, CheckCircle, AlertCircle, ShoppingCart, Tag, Clock } from 'lucide-react'
import { cartApi, menuApi, shopsApi } from '../api/services'
import { useAuth } from '../context/AuthContext'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { formatPrice } from '../utils/helpers'

export default function ShopDetailPage() {
  const { shopId } = useParams()
  const { user } = useAuth()
  const [shop, setShop] = useState(null)
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(null)

  const loadShopData = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true)
      }

      setError('')
      const [shopResponse, itemsResponse] = await Promise.all([
        shopsApi.getById(shopId),
        menuApi.listByShop(shopId),
      ])

      setShop(shopResponse.data)
      setItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [shopId])

  useEffect(() => {
    loadShopData({ silent: false })
  }, [loadShopData])

  useEffect(() => {
    const pollInterval = window.setInterval(() => {
      loadShopData({ silent: true })
    }, 5000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadShopData({ silent: true })
      }
    }

    window.addEventListener('focus', handleVisibility)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.clearInterval(pollInterval)
      window.removeEventListener('focus', handleVisibility)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadShopData])

  const addToCart = async (menuItemId, item) => {
    if (!user) {
      setError('Please login to add items to cart.')
      return
    }

    if (!shop?.isOpen) {
      setError('This shop is currently closed.')
      return
    }

    if ((item.stock ?? 0) < 1) {
      setError('This item is currently out of stock.')
      return
    }

    try {
      setAddingToCart(menuItemId)
      setError('')
      await cartApi.addItem(shopId, { menuItemId, quantity: 1 })
      localStorage.setItem('activeCartShopId', shopId)
      window.dispatchEvent(new Event('campus-cart-updated'))
      setMessage(`${item.name} added to cart!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

        <div className="relative z-10 py-12 px-4 md:px-8 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : shop ? (
            <>
              {/* Header Box */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none rounded-3xl p-8 md:p-12 mb-10 text-center md:text-left flex flex-col md:flex-row items-center gap-8"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Store className="w-10 h-10 text-white" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-4xl font-black font-display tracking-wide text-slate-900 dark:text-white mb-2">
                    {shop.name}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg mb-4 max-w-2xl">
                    {shop.description || 'Delicious menu curated for students and faculty.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest border transition-colors flex items-center gap-2 ${shop.isOpen ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20'}`}>
                      <Clock className="w-4 h-4" />
                      {shop.isOpen ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {message && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-4 bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">{message}</p>
                  </motion.div>
                )}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Menu Layout */}
              {items.length === 0 ? (
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none rounded-3xl p-16 text-center">
                  <Store className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No items available</h3>
                  <p className="text-slate-500 dark:text-slate-400">This shop hasn't added any menu items yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item, idx) => {
                    const availableStock = Number(item.stock ?? 0)

                    return (
                      <motion.div
                        key={item._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/30 hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] transition-all group flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-slate-100 dark:bg-white/5 overflow-hidden">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                              <span className="bg-white/10 px-4 py-2 rounded-xl text-white font-black uppercase tracking-widest text-sm border border-white/20">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-6 flex-1 flex flex-col relative">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                              <span className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-500/20">{item.category || 'General'}</span>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-orange-400 whitespace-nowrap">
                              {formatPrice(item.price)}
                            </span>
                          </div>

                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 mb-4 flex-1">
                            {item.description || 'Our signature dish prepared with fresh ingredients.'}
                          </p>

                          {/* Stock Availability */}
                          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3">
                            <span className={`text-sm font-black uppercase tracking-widest ${availableStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                              Available: {availableStock > 0 ? availableStock : 0}
                            </span>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            disabled={!item.isAvailable || !shop?.isOpen || addingToCart === item._id || availableStock < 1}
                            onClick={() => addToCart(item._id, item)}
                            className="w-full py-3.5 bg-orange-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
                          >
                            {addingToCart === item._id ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <><ShoppingCart className="w-4 h-4" /> {availableStock > 0 ? 'Add to Cart' : 'Sold Out'}</>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 dark:text-slate-400 font-medium">Shop not found.</div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

