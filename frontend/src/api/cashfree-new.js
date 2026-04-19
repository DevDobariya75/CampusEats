/**
 * Cashfree Payment Service Utility (Payment Link Method - RECOMMENDED)
 * 
 * RECOMMENDED APPROACH: Frontend service using simpler Payment Link integration.
 * No iframe whitelisting, no CORS issues, works on any domain immediately!
 * 
 * Reference: https://docs.cashfree.com/docs/payment-links/
 */

import { paymentsApi } from './services'

/**
 * Create Cashfree payment link via backend API
 * 
 * Calls backend endpoint to create a Cashfree payment link
 * 
 * @param {string} orderId - Internal order ID
 * @param {number} amount - Payment amount in INR
 * @returns {Promise<object>} Payment link data
 */
export const createCashfreePaymentLink = async (orderId, amount) => {
  try {
    console.log('📝 Requesting Cashfree payment link from backend...')
    
    const response = await paymentsApi.createCashfreeLink({
      orderId,
      amount
    })

    console.log('✅ Cashfree payment link created:', {
      paymentUrl: response.data.paymentUrl,
      linkId: response.data.linkId
    })

    return {
      success: true,
      data: response.data,
      paymentUrl: response.data.paymentUrl,      // Direct payment link URL
      redirectUrl: response.data.redirectUrl,    // Redirect link
      linkId: response.data.linkId,              // Cashfree link ID
      paymentId: response.data.payment?._id      // Our database payment ID
    }
  } catch (error) {
    console.error('❌ Cashfree Payment Link Creation Error:', error)
    throw new Error(
      error?.response?.data?.message || 
      error.message || 
      'Failed to create Cashfree payment link'
    )
  }
}

/**
 * Open Cashfree payment link for user
 * 
 * Simply redirects user to Cashfree payment link.
 * User completes payment and is redirected back via return_url.
 * 
 * @param {string} paymentUrl - Cashfree payment link URL
 * @returns {void} Redirects user
 */
export const openCashfreePaymentLink = (paymentUrl) => {
  if (!paymentUrl) {
    throw new Error('Payment URL is missing')
  }

  console.log('🔗 Opening Cashfree payment link:', paymentUrl)
  
  // Open in new tab/window
  window.open(paymentUrl, '_blank')
}

/**
 * Verify Cashfree payment on backend
 * 
 * Sends payment details to backend for verification
 * 
 * @param {object} paymentData - Payment response data from checkout
 * @returns {Promise<object>} Verification response from backend
 */
export const verifyCashfreePayment = async (paymentData) => {
  try {
    const {
      paymentId,
      orderId,
      referenceId,
      signature,
      paymentStatus,
      orderAmount
    } = paymentData

    console.log('🔐 Verifying payment on backend...')

    const response = await paymentsApi.verifyCashfreePayment({
      paymentId,
      orderId,
      referenceId,
      signature,
      paymentStatus,
      orderAmount
    })

    console.log('✅ Payment verified successfully')

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('❌ Cashfree Payment Verification Error:', error)
    throw new Error(
      error?.response?.data?.message || 
      error.message || 
      'Payment verification failed'
    )
  }
}

/**
 * Handle complete Cashfree payment flow (Payment Link Method)
 * 
 * RECOMMENDED APPROACH - No whitelisting needed!
 * 1. Create payment link on backend
 * 2. Redirect user to payment link
 * 3. User completes payment and is redirected back via return_url
 * 
 * @param {string} orderId - Internal order ID
 * @param {number} amount - Payment amount
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const processCashfreePayment = async (
  orderId,
  amount,
  onSuccess,
  onFailure
) => {
  try {
    // Step 1: Create payment link on backend
    console.log('📝 Step 1: Creating Cashfree payment link...')
    const linkData = await createCashfreePaymentLink(orderId, amount)

    if (!linkData.success) {
      throw new Error('Failed to create payment link')
    }

    const { paymentUrl, paymentId } = linkData
    console.log('✅ Payment link created:', paymentUrl)

    // Step 2: Redirect user to payment link
    console.log('💳 Step 2: Redirecting to Cashfree payment page...')
    
    // Open in popup/new tab - user will complete payment there
    // After payment, user is redirected via return_url
    openCashfreePaymentLink(paymentUrl)

    // Show success after redirect
    if (onSuccess) {
      setTimeout(() => {
        onSuccess({
          paymentId,
          orderId,
          referenceId: paymentId,
          paymentStatus: 'PENDING'
        })
      }, 1000)
    }

  } catch (error) {
    console.error('❌ Cashfree Payment Error:', error.message)
    
    if (onFailure) {
      onFailure({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
    
    throw error
  }
}

export default {
  createCashfreePaymentLink,
  openCashfreePaymentLink,
  verifyCashfreePayment,
  processCashfreePayment
}
