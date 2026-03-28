import { Suspense, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll as useFramerScroll } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Float } from '@react-three/drei';
import { Search, MapPin, Clock, ChefHat, Star, Filter, RotateCcw } from 'lucide-react';

// Custom API & UI Components
import { shopsApi } from '../api/services';
import { PageTransition, LoadingSpinner } from '../components/ui/Button';
import { StaggerItem } from '../components/ui/3DElements';
import BurgerModel from '../components/BurgerModel';

const StaticBurgerScene = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
        <group position={[0, 0.2, 0]} scale={1.2}>
          <Suspense fallback={null}>
            <BurgerModel progress={0} />
          </Suspense>
        </group>
      </Float>
      <ContactShadows
        position={[0, -0.8, 0]}
        scale={8.0}
        blur={2.5}
        opacity={0.4}
        far={4.0}
        color="#000000"
      />
      <Environment preset="city" />
    </>
  );
};

export default function ShopsPage() {
  const navigate = useNavigate();
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

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-white dark:bg-[#060b13] text-slate-900 dark:text-[#f8fafc] transition-colors duration-300">

        {/* --- HERO SECTION WITH 3D CANVAS --- */}
        <section className="relative h-screen sm:h-[80vh] w-full bg-white dark:bg-[#060b13] transition-colors duration-300 flex items-center pt-20 sm:pt-10">
          {/* Background Gradients */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-50/50 to-transparent dark:hidden" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(60,130,246,0.22),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(56,189,248,0.12),transparent_40%)] hidden dark:block" />

          {/* Text Content */}
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center">
            <header className="w-full px-6 lg:px-14">
              <div className="mx-auto flex flex-col md:flex-row justify-between max-w-7xl items-center gap-4 py-10 md:py-0 md:mb-12">
                {/* Left Text */}
                <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-md pointer-events-auto z-10 w-full text-center md:text-left mt-[-40px] md:mt-0">
                  <p className="text-sm sm:text-lg font-bold tracking-[0.2em] uppercase mb-4 text-slate-800 dark:text-white font-serif italic">The</p>
                  <h1 className="text-6xl font-black leading-none sm:text-7xl lg:text-8xl text-slate-900 dark:text-white font-serif uppercase tracking-tight">
                    MIDDAY <br className="hidden md:block" /> CRAVINGS
                  </h1>
                  <p className="mt-6 text-slate-600 dark:text-white/60 text-sm max-w-xs leading-relaxed mx-auto md:mx-0">
                    Discover amazing food from your favorite campus eateries. Fast delivery, endless choices, all within reach.
                  </p>
                </motion.div>

                {/* Right Text */}
                <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-md pointer-events-auto z-10 w-full text-center md:text-right hidden md:block mt-[-40px] md:mt-0">
                  <p className="text-lg font-medium tracking-wide mb-4 text-slate-800 dark:text-white font-serif">Campus <br/>Food Hub</p>
                  <h1 className="text-6xl font-black leading-none sm:text-7xl lg:text-8xl text-slate-900 dark:text-white font-serif uppercase tracking-tight">
                    CAMPUS <br /> EATS
                  </h1>
                </motion.div>
              </div>
            </header>
          </div>

          <div className="absolute inset-0 z-0 pointer-events-auto">
            <Canvas camera={{ position: [0, 0.9, 10.2], fov: 33 }} dpr={[1, 2]} className="w-full h-full">
              <ambientLight intensity={0.6} />
              <directionalLight position={[4, 5, 6]} intensity={1.1} />
              <StaticBurgerScene />
            </Canvas>
          </div>
        </section>

        {/* --- LISTING SECTION --- */}
        <section className="relative z-30 px-6 py-20 bg-white dark:bg-[#060b13] text-slate-900 dark:text-white rounded-t-[3rem] min-h-screen transition-colors duration-300 shadow-[0_-15px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
          <div className="mx-auto max-w-7xl">
            {/* Bento Title */}
            <div className="mb-8">
              <h2 className="text-4xl font-serif text-slate-900 dark:text-white">Bento</h2>
            </div>

            {/* Filter Controls */}
            <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-white/5 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-slate-400" />
                <div className="flex gap-2">
                  {['all', 'open', 'nearby'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-400">SORT BY</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl font-bold outline-none focus:border-orange-500 text-slate-900 dark:text-white transition-colors duration-300"
                >
                  <option value="popular">Popularity</option>
                  <option value="rating">Top Rated</option>
                  <option value="distance">Distance</option>
                </select>
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