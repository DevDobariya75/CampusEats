/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers.js'

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 font-display'
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:from-orange-600 hover:to-orange-700 shadow-md dark:from-orange-600 dark:to-orange-700',
    secondary: 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:bg-slate-800 dark:border-orange-400 dark:text-orange-400',
    outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:from-red-600 hover:to-red-700 shadow-md dark:from-red-600 dark:to-red-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export const Card = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -8, boxShadow: '0 12px 24px -5px rgba(2, 132, 199, 0.12)' } : {}}
      className={cn('bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const Badge = ({ children, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    secondary: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', variants[variant])} {...props}>
      {children}
    </span>
  )
}

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn('border-4 border-slate-200 dark:border-slate-700 border-t-orange-500 dark:border-t-orange-400 rounded-full', sizes[size])}
    />
  )
}

export const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

export const InputField = ({ label, error, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        className={cn(
          'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-base transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30',
          error && 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-400/30',
        )}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

export const FormSelect = ({ label, options, error, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {label && (
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.select
        whileFocus={{ scale: 1.01 }}
        className={cn(
          'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-base transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30',
          error && 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-400/30',
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 dark:text-red-400 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  )
}

