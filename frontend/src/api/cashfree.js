/**
 * Cashfree Payment Service Utility (v3 SDK)
 * 
 * Frontend service for handling Cashfree payment integration using v3 SDK.
 * Uses latest Cashfree hosted checkout API for sandbox/test mode.
 * 
 * Reference: https://docs.cashfree.com/docs/payments/guide/web-integration/
 */

import { paymentsApi } from './services'

// Store SDK loaded state
let cashfreeSDKLoaded = false

/**
 * Load Cashfree v3 SDK script dynamically
 * Uses the latest Cashfree v3 SDK URL
 * 
 * @returns {Promise<boolean>} True if SDK loaded successfully
 */
export const loadCashfreeSDK = () => {
  return new Promise((resolve) => {
    // If SDK is already loaded, resolve immediately
    if (cashfreeSDKLoaded && window.Cashfree) {
      console.log('✅ Cashfree SDK already loaded')
      resolve(true)
      return
    }

    // Check if script already exists in DOM
    if (document.querySelector('script[src*="sdk.cashfree.com"]')) {
      // Wait for SDK to be available
      const checkSDK = setInterval(() => {
        if (window.Cashfree) {
          clearInterval(checkSDK)
          cashfreeSDKLoaded = true
          console.log('✅ Cashfree SDK available')
          resolve(true)
        }
      }, 100)
      return
    }

    // Create and append script tag for Cashfree v3 SDK
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.type = 'text/javascript'
    script.async = true

    script.onload = () => {
      cashfreeSDKLoaded = true
      console.log('✅ Cashfree v3 SDK loaded successfully')
      resolve(true)
    }

    script.onerror = () => {
      console.error('❌ Failed to load Cashfree v3 SDK from CDN')
      cashfreeSDKLoaded = false
      resolve(false)
    }

    document.head.appendChild(script)
  })
}

/**
 * Create Cashfree payment order via backend API
 * 
 * Calls backend endpoint to create a Cashfree order and get session ID
 * 
 * @param {string} orderId - Internal order ID
 * @param {number} amount - Payment amount in INR
 * @returns {Promise<object>} Payment order data with session ID
 */
export const createCashfreePaymentOrder = async (orderId, amount) => {
  try {
    console.log('📝 Requesting Cashfree payment order from backend...')
    
    const response = await paymentsApi.createCashfreeOrder({
      orderId,
      amount
    })

    console.log('✅ Cashfree order created:', {
      sessionId: response.data.sessionId,
      orderId: response.data.orderId
    })

    return {
      success: true,
      data: response.data,
      sessionId: response.data.sessionId,      // Payment session ID from Cashfree
      cashfreeOrderId: response.data.orderId,  // Cashfree order ID
      paymentId: response.data.payment?._id    // Our database payment ID
    }
  } catch (error) {
    console.error('❌ Cashfree Order Creation Error:', error)
    throw new Error(
      error?.response?.data?.message || 
      error.message || 
      'Failed to create Cashfree order'
    )
  }
}

/**
 * Initialize and open Cashfree v3 hosted checkout
 * 
 * Cashfree v3 uses a REDIRECT approach, not a JavaScript method call.
 * The session ID is passed via URL redirect to Cashfree's hosted checkout.
 * 
 * @param {string} sessionId - Cashfree payment session ID from backend
 * @returns {Promise<object>} Returns after redirect (user will be redirected)
 */
/**
 * Initialize and open Cashfree v3 hosted checkout
 * 
 * Cashfree v3 SDK provides multiple integration methods.
 * Using the Cashfree() constructor to initialize checkout instance.
 * 
 * @param {string} sessionId - Cashfree payment session ID from backend
 * @returns {Promise<object>} Payment response with status and details
 */
export const initiateCashfreeCheckout = async (sessionId) => {
  try {
    console.log('🔄 Initializing Cashfree v3 checkout with sessionId:', sessionId)

    // Step 1: Load SDK
    const sdkLoaded = await loadCashfreeSDK()
    if (!sdkLoaded) {
      throw new Error('Failed to load Cashfree SDK. Check your internet connection.')
    }

    // Step 2: Verify Session ID
    if (!sessionId) {
      throw new Error('Payment session ID is missing')
    }

    console.log('� Opening Cashfree hosted checkout page...')

    // Step 3: Use Cashfree v3 Hosted Checkout with correct URL format
    // The session token should be passed as a query parameter
    // Cashfree v3 hosted checkout URL format
    const checkoutURL = `https://checkout.cashfree.com/post/submit/${sessionId}`
    
    console.log('🌐 Redirecting to Cashfree checkout:', checkoutURL)
    
    // Redirect to Cashfree hosted checkout page
    // User will complete payment there and be redirected back via return_url
    window.location.href = checkoutURL
    
    // Return a promise that never resolves (page will redirect)
    return new Promise(() => {})
  } catch (error) {
    console.error('❌ Cashfree Checkout Error:', error.message)
    console.error('Stack:', error.stack)
    throw new Error(error.message || 'Payment checkout failed')
  }
}

/**
 * Verify Cashfree payment on backend
 * 
 * Sends payment details to backend for verification and signature validation
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
 * Handle complete Cashfree payment flow
 * 
 * Cashfree v3 SDK Integration:
 * 1. Create payment order on backend (get session ID)
 * 2. Initialize Cashfree checkout or redirect to hosted page
 * 3. User completes payment
 * 4. Return to app and verify payment
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
    // Step 1: Create payment order on backend
    console.log('📝 Step 1: Creating Cashfree payment order...')
    const orderData = await createCashfreePaymentOrder(orderId, amount)

    if (!orderData.success) {
      throw new Error('Failed to create payment order')
    }

    const { sessionId, paymentId, cashfreeOrderId } = orderData
    console.log('✅ Order created with sessionId:', sessionId)

    // Step 2: Initiate checkout (will redirect or open modal)
    console.log('💳 Step 2: Initiating Cashfree checkout...')
    
    // This function will either:
    // a) Open a modal/popup for payment (if modal method works)
    // b) Redirect to Cashfree hosted page (if redirect method)
    await initiateCashfreeCheckout(sessionId)

    // If we reach here, checkout completed without redirect
    console.log('⏳ Waiting for payment completion...')

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
  loadCashfreeSDK,
  createCashfreePaymentOrder,
  initiateCashfreeCheckout,
  verifyCashfreePayment,
  processCashfreePayment
}
