import { motion } from 'framer-motion'
import { Navigation } from 'lucide-react'

export default function WelcomeSplash() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-gradient-to-b from-orange-700 via-orange-600 to-orange-500"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_40%),radial-gradient(circle_at_70%_85%,rgba(0,0,0,0.18),transparent_45%)]" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center text-white">
        <motion.div
          initial={{ scale: 0.86, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.42 }}
          className="w-20 h-20 rounded-3xl bg-black/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-[0_18px_40px_rgba(0,0,0,0.2)]"
        >
          <span className="text-[2rem] font-black tracking-tight">CE</span>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.14, duration: 0.35 }}
          className="mt-7"
        >
          <p className="text-[2rem] sm:text-[2.2rem] font-black leading-none">Welcome</p>
          <p className="mt-2 text-[1.15rem] sm:text-[1.3rem] font-extrabold text-white/90">CampusEats</p>
        </motion.div>

        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          className="mt-6 flex items-center gap-2 rounded-2xl bg-black/10 border border-white/15 px-4 py-2"
        >
          <Navigation className="w-4.5 h-4.5" />
          <span className="text-sm font-bold tracking-wide">Locating your nearby food spots...</span>
        </motion.div>
      </div>
    </motion.div>
  )
}
