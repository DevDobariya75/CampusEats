import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { formatPrice } from '../utils/helpers'

/**
 * PaymentSuccess Component
 * 
 * Displays a success screen after successful payment with animation.
 * Shows order confirmation details and provides navigation options.
 * 
 * Props:
 *  - orderId: Order ID
 *  - paymentId: Payment ID
 *  - amount: Payment amount
 *  - onContinue: Callback function when user clicks continue
 *  - isLoading: Show loading state
 */
export default function PaymentSuccess({
  orderId,
  paymentId,
  amount,
  onContinue,
  isLoading = false
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Show details after animation completes
    const timer = setTimeout(() => setShowDetails(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        duration: 0.6,
        type: 'spring',
        stiffness: 100
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 1,
        duration: 0.5
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
      >
        {/* Header with gradient - Black & white theme */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8 text-center">
          <motion.div variants={checkmarkVariants}>
            <CheckCircle className="w-16 h-16 text-white mx-auto" strokeWidth={1.5} />
          </motion.div>

          <motion.h2
            variants={containerVariants}
            className="text-2xl font-bold text-white mt-4"
          >
            Payment Successful! ✨
          </motion.h2>
        </div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          className="px-6 py-8 space-y-6"
        >
          {/* Amount */}
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium">Total Amount Paid</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatPrice(amount)}
            </p>
          </div>

          {/* Details - Animated reveal */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 bg-gray-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Order ID</span>
                <span className="font-mono text-gray-900 text-xs break-all">
                  {orderId?.toString().slice(-12)}
                </span>
              </div>

              <div className="h-px bg-gray-200"></div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Payment ID</span>
                <span className="font-mono text-gray-900 text-xs break-all">
                  {paymentId?.toString().slice(-12)}
                </span>
              </div>

              <div className="h-px bg-gray-200"></div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Time</span>
                <span className="text-gray-900">
                  {new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </motion.div>
          )}

          {/* Status Badge */}
          <div className="flex items-center justify-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">Payment Verified</span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={containerVariants}
          className="px-6 py-4 bg-gray-50 border-t border-gray-200"
        >
          <button
            onClick={onContinue}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 py-3 rounded-lg font-medium hover:from-gray-800 hover:to-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                Continue to Orders
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Confirmation email will be sent shortly
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
