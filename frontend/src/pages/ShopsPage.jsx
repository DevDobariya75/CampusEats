import { Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import { Search, MapPin, Clock, ChefHat, Star, Filter, RotateCcw, ChevronDown } from 'lucide-react';

// Custom API & UI Components
import { shopsApi } from '../api/services';
import { PageTransition, LoadingSpinner } from '../components/ui/Button';
import { StaggerItem } from '../components/ui/3DElements';
import BurgerModel from '../components/BurgerModel';

const StaticBurgerScene = ({ isMobile, isTablet }) => {
  const baseScale = isMobile ? 0.94 : isTablet ? 1.05 : 1.18
  const yPosition = isMobile ? -0.08 : isTablet ? 0.04 : 0.2

  return (
    <>
      <Float speed={isMobile ? 1.45 : 1.9} rotationIntensity={isMobile ? 0.28 : 0.45} floatIntensity={isMobile ? 0.95 : 1.35}>
        <group position={[0, yPosition, 0]} scale={baseScale}>
          <Suspense fallback={null}>
            <BurgerModel progress={0} />
          </Suspense>
        </group>
      </Float>
      <ContactShadows
        position={isMobile ? [0, -1.03, 0] : isTablet ? [0, -0.92, 0] : [0, -0.8, 0]}
        scale={isMobile ? 6.2 : isTablet ? 7.0 : 8.0}
        blur={2.5}
        opacity={0.36}
        far={4.0}
        color="#000000"
      />
      <Environment preset="city" />
    </>
  );
};

export default function ShopsPage() {
  const navigate = useNavigate();
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const query = new URLSearchParams({ search: search.trim(), filter, sort: sortBy });
      const response = await shopsApi.list(query.toString());
      const shopsData = Array.isArray(response.data) ? response.data : response.data?.shops || [];
      setShops(shopsData);
    } catch (err) {
      setError(err.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [search, filter, sortBy]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth < 768
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white dark:bg-[#060b13] text-slate-900 dark:text-[#f8fafc] transition-colors duration-300">

        {/* --- HERO SECTION WITH 3D CANVAS --- */}
        <section className="relative h-[min(74vh,720px)] min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] w-full bg-white dark:bg-[#060b13] transition-colors duration-300 grid [grid-template-areas:'stack'] overflow-hidden">
          {/* Background Gradients */}
          <div className="pointer-events-none [grid-area:stack] bg-gradient-to-b from-orange-50/70 via-orange-50/20 to-transparent dark:hidden" />
          <div className="pointer-events-none [grid-area:stack] bg-[radial-gradient(circle_at_20%_15%,rgba(60,130,246,0.22),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(56,189,248,0.12),transparent_40%)] hidden dark:block" />
          <div className="pointer-events-none [grid-area:stack] bg-gradient-to-b from-white/25 via-transparent to-white/45 dark:from-black/30 dark:via-transparent dark:to-black/35" />

          <div className="[grid-area:stack] z-0 pointer-events-auto">
            <Canvas camera={{ position: isMobile ? [0, 0.42, 10.65] : isTablet ? [0, 0.76, 10.5] : [0, 0.9, 10.2], fov: isMobile ? 37 : isTablet ? 35 : 33 }} dpr={[1, 2]} className="w-full h-full">
              <ambientLight intensity={0.62} />
              <directionalLight position={[4, 5, 6]} intensity={1.1} />
              <StaticBurgerScene isMobile={isMobile} isTablet={isTablet} />
            </Canvas>
          </div>

          {/* Text Content */}
          <div className="[grid-area:stack] z-10 pointer-events-none">
            <header className="relative h-full w-full px-4 sm:px-6 lg:px-10">
              {/* Mobile / Vertical Layout */}
              <div className="md:hidden">
                <motion.div
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.42 }}
                  className="absolute top-[12%] inset-x-0 px-4 flex justify-center"
                >
                  <div className="w-full max-w-[18rem] text-center">
                    <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-orange-600/90 dark:text-orange-300/95 font-serif italic [text-shadow:0_1px_7px_rgba(255,255,255,0.55)] dark:[text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                      The
                    </p>
                    <h1 className="mt-1 text-[clamp(1.6rem,7.8vw,2.45rem)] leading-[0.92] font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white [text-shadow:0_4px_16px_rgba(255,255,255,0.72)] dark:[text-shadow:0_4px_18px_rgba(0,0,0,0.62)]">
                      MIDDAY <br /> CRAVINGS
                    </h1>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.42 }}
                  className="absolute bottom-[8%] inset-x-0 px-4 flex justify-center"
                >
                  <p className="pointer-events-auto w-full max-w-[22rem] mx-auto px-3 text-center text-[clamp(0.88rem,2.3vw,1rem)] font-semibold leading-relaxed text-slate-700 dark:text-slate-100 dark:font-medium [text-shadow:0_1px_8px_rgba(255,255,255,0.6)] dark:[text-shadow:0_2px_12px_rgba(0,0,0,0.85)]">
                    Discover amazing food from your favorite campus eateries. Fast delivery, endless choices, all within reach.
                  </p>
                </motion.div>
              </div>

              {/* Desktop / Horizontal Layout (restored style) */}
              <div className="hidden md:flex h-full items-center">
                <div className="mx-auto flex flex-row justify-between w-full max-w-7xl items-center gap-6 lg:gap-10">
                  <motion.div initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-md pointer-events-auto z-10 w-full text-left">
                    <p className="text-sm lg:text-base font-bold tracking-[0.24em] uppercase mb-2 text-slate-800 dark:text-white font-serif italic">The</p>
                    <h1 className="text-[clamp(3.5rem,7.1vw,6.4rem)] leading-[0.9] font-black text-slate-900 dark:text-white font-serif uppercase tracking-tight">
                      MIDDAY <br /> CRAVINGS
                    </h1>
                    <p className="mt-4 text-slate-700 dark:text-white/75 text-base max-w-sm leading-relaxed">
                      Discover amazing food from your favorite campus eateries. Fast delivery, endless choices, all within reach.
                    </p>
                  </motion.div>

                  <motion.div initial={{ x: 28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-md pointer-events-auto z-10 w-full text-right">
                    <p className="text-lg font-medium tracking-wide mb-4 text-slate-800 dark:text-white font-serif">Campus <br/>Food Hub</p>
                    <h1 className="text-[clamp(3.2rem,6.4vw,6.1rem)] font-black leading-none text-slate-900 dark:text-white font-serif uppercase tracking-tight">
                      CAMPUS <br /> EATS
                    </h1>
                  </motion.div>
                </div>
              </div>
            </header>
          </div>
        </section>

        {/* --- LISTING SECTION --- */}
        <section className="relative z-30 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white dark:bg-[#060b13] text-slate-900 dark:text-white rounded-t-[2.3rem] sm:rounded-t-[3rem] min-h-screen transition-colors duration-300 shadow-[0_-14px_46px_rgba(0,0,0,0.08)] dark:shadow-[0_-18px_52px_rgba(0,0,0,0.45)]">
          <div className="mx-auto max-w-7xl">
            {/* Bento Title */}
            <div className="mb-7 sm:mb-8">
              <h2 className="text-[2.15rem] sm:text-4xl font-serif text-slate-900 dark:text-white leading-tight">Bento</h2>
            </div>

            {/* Filter Controls */}
            <div className="mb-12 rounded-3xl bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 border border-slate-200 dark:border-white/5 transition-colors duration-300">
              <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <Filter className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex gap-2 shrink-0">
                  {['all', 'open', 'nearby'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${filter === f ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
                  <span className="text-sm font-black tracking-wide text-slate-400 uppercase">Sort</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-4 pr-10 py-2.5 rounded-xl font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-400/25 text-slate-900 dark:text-white transition-all duration-300 shadow-sm"
                    >
                      <option value="popular">Popularity</option>
                      <option value="rating">Top Rated</option>
                      <option value="distance">Distance</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="flex flex-col items-center py-20">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest">Fetching your favorites...</p>
                </div>
              ) : shops.length > 0 ? (
                <motion.div
                  initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {shops.map((shop) => (
                    <StaggerItem key={shop._id}>
                      <motion.div
                        whileHover={{ y: -10 }}
                        onClick={() => navigate(`/shops/${shop._id}`)}
                        className="group bg-white dark:bg-white/5 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-2xl transition-all cursor-pointer backdrop-blur-md"
                      >
                        <div className="relative h-64">
                          <img src={shop.imageUrl || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800'} alt={shop.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className={`absolute top-5 right-5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase backdrop-blur-md ${shop.isOpen ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                            {shop.isOpen ? '● Open' : '○ Closed'}
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">{shop.name}</h3>
                            <div className="flex items-center gap-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-lg text-xs font-bold">
                              <Star className="w-3 h-3 fill-current" /> {shop.rating?.toFixed(1) || 'N/A'}
                            </div>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-6">{shop.description}</p>
                          <div className="flex gap-4 mb-6">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <Clock className="w-4 h-4" /> {shop.deliveryTime || '20'} MIN
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                              <MapPin className="w-4 h-4" /> {shop.distance || '1.2'} KM
                            </div>
                          </div>
                          <button className="w-full py-4 bg-slate-900 dark:bg-white/10 text-white rounded-2xl font-bold group-hover:bg-orange-600 dark:group-hover:bg-orange-500 transition-colors uppercase tracking-widest text-xs">
                            View Menu
                          </button>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <RotateCcw className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-black">No results found</h3>
                  <button onClick={() => { setSearch(''); setFilter('all'); }} className="mt-4 text-orange-500 font-bold underline">Reset Filters</button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
