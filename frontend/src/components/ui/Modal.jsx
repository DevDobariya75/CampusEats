import { motion } from 'framer-motion'
import { X } from 'lucide-react'

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizes = {
    sm: 'w-96',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-2xl',
    xl: 'w-full max-w-4xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-2xl p-6 ${sizes[size]} max-h-[90vh] overflow-auto border dark:border-slate-700/50`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">{title}</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-slate-900 dark:text-white" />
          </motion.button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

export const Tooltip = ({ content, children, position = 'top' }) => {
  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  }

  return (
    <div className="group relative inline-block">
      {children}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        className={`absolute hidden group-hover:block ${positions[position]} bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap z-10`}
      >
        {content}
        <div className="absolute border-4 border-transparent border-t-slate-900 dark:border-t-slate-800 -bottom-1 left-1/2 transform -translate-x-1/2" />
      </motion.div>
    </div>
  )
}

export const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    info: 'bg-orange-500 dark:bg-orange-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600',
  }

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className={`${types[type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center justify-between`}
    >
      <span>{message}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="ml-4 font-bold text-xl"
      >
        ×
      </motion.button>
    </motion.div>
  )
}

export const Alert = ({ message, type = 'info', title }) => {
  const types = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300',
    info: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-300',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-l-4 p-4 rounded-lg ${types[type]}`}
    >
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <p>{message}</p>
    </motion.div>
  )
}

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`}
        />
      ))}
    </>
  )
}
