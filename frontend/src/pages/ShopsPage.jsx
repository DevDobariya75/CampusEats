import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Clock, Zap, ChefHat, Star, Filter, X } from 'lucide-react'
import { shopsApi } from '../api/services'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { FloatingShapes, AnimatedGradientBg, StaggerContainer, StaggerItem } from '../components/ui/3DElements'

export default function ShopsPage() {
  const navigate = useNavigate()
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const loadShops = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const query = new URLSearchParams()
      if (search.trim()) query.set('search', search.trim())
      query.set('filter', filter)
      query.set('sort', sortBy)

      const response = await shopsApi.list(query.toString())
      const shopsData = Array.isArray(response.data) ? response.data : response.data?.shops || []
      setShops(shopsData)
    } catch (err) {
      setError(err.message || 'Failed to load shops')
    } finally {
      setLoading(false)
    }
  }, [search, filter, sortBy])

  useEffect(() => {
    loadShops()
  }, [loadShops])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <PageTransition>
      <div className="relative">
        {/* Animated Background */}
        <AnimatedGradientBg />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative py-16 px-4 overflow-hidden"
        >
          {/* Floating 3D elements background */}
          <div className="absolute inset-0 opacity-20">
            <FloatingShapes />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100/80 to-sky-100/80 rounded-full border border-orange-200/50 backdrop-blur-sm">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
                    Fast Campus Delivery
                  </span>
                </div>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 bg-gradient-to-r from-orange-600 via-sky-600 to-purple-600 bg-clip-text text-transparent">
                Eat What You Love
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto mb-8"
              >
                Discover delicious food from your favorite campus shops and get it delivered fresh to your door
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="relative max-w-2xl mx-auto"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-sky-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
                  <form className="relative flex gap-3" onSubmit={(e) => e.preventDefault()}>
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && loadShops()}
                        placeholder="Search shops by name, cuisine..."
                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-base"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={loadShops}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Search
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </motion.div>

            {/* Filter and Sort */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4 justify-center items-center mb-12"
            >
              <div className="flex gap-2 items-center">
                <Filter className="w-5 h-5 text-slate-600" />
                <div className="flex gap-2">
                  {['all', 'open', 'nearby'].map((f) => (
                    <motion.button
                      key={f}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        filter === f
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'bg-white/50 text-slate-600 border border-slate-200 hover:border-orange-500'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-sm text-slate-600 font-semibold">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-white/50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="popular">Popular</option>
                  <option value="new">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="distance">Nearest</option>
                </select>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Content */}
        <section className="relative py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-slate-600 font-semibold">Finding the best food for you...</p>
              </motion.div>
            )}

            {/* Error State */}
            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 border-l-4 border-red-500 rounded-lg"
              >
                <h3 className="font-semibold text-red-800 mb-2">Something went wrong</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={loadShops}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all"
                >
                  Retry
                </motion.button>
              </motion.div>
            )}

            {/* Shops Grid */}
            {!loading && shops.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {shops.map((shop) => (
                  <StaggerItem key={shop._id}>
                    <motion.div
                      whileHover={{ y: -12, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
                      onClick={() => navigate(`/shops/${shop._id}`)}
                      className="group cursor-pointer"
                    >
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                        {/* Image */}
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          src={shop.imageUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500&fit=crop'}
                          alt={shop.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Status Badge */}
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md ${
                            shop.isOpen
                              ? 'bg-green-500/90 text-white'
                              : 'bg-red-500/90 text-white'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${shop.isOpen ? 'bg-green-200' : 'bg-red-200'} animate-pulse`} />
                          {shop.isOpen ? 'Open' : 'Closed'}
                        </motion.div>

                        {/* Rating Badge */}
                        {shop.rating && (
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-lg"
                          >
                            <Star className="w-4 h-4 fill-current" />
                            {shop.rating.toFixed(1)}
                          </motion.div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div className="p-5 bg-white rounded-b-2xl shadow-lg">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold font-display text-slate-900 group-hover:text-orange-600 transition-colors">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {shop.description || 'Fresh and delicious food, fast delivery'}
                          </p>
                        </div>

                        {/* Info Row */}
                        <div className="flex gap-4 py-3 border-t border-slate-200">
                          {shop.deliveryTime && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span>{shop.deliveryTime} min</span>
                            </div>
                          )}
                          {shop.distance && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-sky-500" />
                              <span>{shop.distance} km</span>
                            </div>
                          )}
                          {shop.cuisineType && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <ChefHat className="w-4 h-4 text-purple-500" />
                              <span>{shop.cuisineType}</span>
                            </div>
                          )}
                        </div>

                        {/* View Menu Button */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full mt-3 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                          View Menu
                        </motion.button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && shops.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700 mb-2">No shops found</h3>
                <p className="text-slate-600 mb-6">Try adjusting your search filters or criteria</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearch('')
                    setFilter('all')
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Clear Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
