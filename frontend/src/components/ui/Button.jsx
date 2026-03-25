/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion'
import { cn } from '../../utils/helpers.js'

export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const baseClasses = 'font-semibold rounded-xl transition-all duration-300 font-display'
  
  const variants = {
    primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl hover:from-orange-600 hover:to-orange-700 shadow-lg dark:from-orange-600 dark:to-orange-700',
    secondary: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-xl hover:from-sky-600 hover:to-sky-700 shadow-lg dark:from-sky-600 dark:to-sky-700',
    outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950 dark:text-orange-400',
    ghost: 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:from-red-600 hover:to-red-700 shadow-lg dark:from-red-600 dark:to-red-700',
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
      whileHover={hover ? { y: -8, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' } : {}}
      className={cn('bg-white dark:bg-slate-900 rounded-2xl shadow-lg overflow-hidden dark:shadow-2xl', className)}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const Badge = ({ children, variant = 'primary', ...props }) => {
  const variants = {
    primary: 'bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-300',
    secondary: 'bg-gradient-to-r from-sky-100 to-sky-50 text-sky-700 dark:from-sky-900/30 dark:to-sky-800/30 dark:text-sky-300',
    success: 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-300',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:text-yellow-300',
    danger: 'bg-gradient-to-r from-red-100 to-red-50 text-red-700 dark:from-red-900/30 dark:to-red-800/30 dark:text-red-300',
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
          'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-base transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
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
          'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-base transition-all duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30',
          error && 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-400/30',
        )}
        {...props}
      >
        <option value="">Select an option</option>
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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

export const TextArea = ({ label, error, ...props }) => {
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
      <motion.textarea
        whileFocus={{ scale: 1.01 }}
        className={cn(
          'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-base transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-500 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-400/30',
          error && 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-400/30',
        )}
        rows={4}
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
