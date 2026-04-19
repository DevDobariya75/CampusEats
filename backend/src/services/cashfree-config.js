/**
 * Cashfree Payment Gateway Configuration
 * 
 * This module provides Cashfree integration for payment processing.
 * Uses TEST/SANDBOX mode only with placeholder credentials.
 * 
 * Supports two methods:
 * 1. Payment Links - Redirects user to Cashfree hosted page (RECOMMENDED for testing)
 * 2. Session ID - Hosted checkout in iframe (requires domain whitelisting)
 * 
 * Reference: https://docs.cashfree.com/docs/resources/apis/pg-apis/
 */

import crypto from 'crypto'
import axios from 'axios'

// TEST MODE CONFIGURATION - Using placeholder credentials
const CASHFREE_CONFIG = {
    // TEST MODE - Replace with your actual credentials only if needed in production
    APP_ID: process.env.CASHFREE_APP_ID || 'TEST_APP_ID',
    SECRET_KEY: process.env.CASHFREE_SECRET_KEY || 'TEST_SECRET_KEY',
    // Cashfree API endpoints
    API_BASE_URL: 'https://api.cashfree.com/pg/orders', // Test sandbox URL
    SANDBOX_URL: 'https://sandbox.cashfree.com/pg/orders',
    // Payment Link API endpoint (alternative to hosted checkout)
    PAYMENT_LINK_URL: 'https://api.cashfree.com/payment_links'
}

/**
 * Generate Cashfree API request headers with signature
 * 
 * @param {string} path - API endpoint path
 * @param {string} method - HTTP method (GET, POST, etc)
 * @param {object} body - Request body (for signature calculation)
 * @returns {object} Headers object with authorization
 */
const generateCashfreeHeaders = (path, method, body = null) => {
    // Timestamp in milliseconds
    const timestamp = Date.now()
    
    // Body as string for signature calculation
    const bodyString = body ? JSON.stringify(body) : ''
    
    // Create signature: METHOD PATH.MILLISECONDS SECRET_KEY
    const signatureData = `${method}${path}${timestamp}${bodyString}${CASHFREE_CONFIG.SECRET_KEY}`
    const signature = crypto
        .createHash('sha256')
        .update(signatureData)
        .digest('hex')
    
    return {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_CONFIG.APP_ID,
        'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
        'x-request-id': crypto.randomUUID(),
        'x-idempotency-key': crypto.randomUUID()
    }
}

/**
 * Create a Cashfree order
 * 
 * @param {object} params - Order parameters
 * @returns {Promise<object>} Cashfree order response
 */
export const createCashfreeOrder = async (params) => {
    try {
        const {
            orderId,           // Internal order ID
            amount,            // Payment amount in INR
            customerId,        // Customer/User ID
            customerEmail,     // Customer email
            customerPhone,     // Customer phone
            customerName,      // Customer name
            returnUrl,         // URL to return after payment
            notifyUrl          // Webhook for payment notifications
        } = params

        // Generate unique Cashfree order ID
        const cashfreeOrderId = `ORD_${Date.now()}_${orderId.toString().slice(-8)}`

        const requestBody = {
            order_id: cashfreeOrderId,
            order_amount: parseFloat(amount),
            order_currency: 'INR',
            customer_details: {
                customer_id: customerId.toString(),
                customer_email: customerEmail,
                customer_phone: customerPhone,
                customer_name: customerName
            },
            order_meta: {
                notify_url: notifyUrl || process.env.CASHFREE_NOTIFY_URL,
                return_url: returnUrl || process.env.CASHFREE_RETURN_URL,
                payment_methods: 'upi,cc,dc,nb'
            },
            // Test mode flag
            order_note: 'TEST_MODE_PAYMENT'
        }

        console.log('📤 Sending Cashfree Order Request:')
        console.log('   URL:', CASHFREE_CONFIG.SANDBOX_URL)
        console.log('   Body:', JSON.stringify(requestBody, null, 2))

        const headers = generateCashfreeHeaders('/orders', 'POST', requestBody)

        // Use sandbox URL for testing
        const url = `${CASHFREE_CONFIG.SANDBOX_URL}`

        const response = await axios.post(url, requestBody, { headers })

        console.log('✅ Cashfree Order Response Received:')
        console.log('   Status:', response.status)
        console.log('   Data (Full):', JSON.stringify(response.data, null, 2))
        console.log('   All Fields:', Object.keys(response.data))
        
        // Extract payment session ID - check multiple possible field names
        const sessionId = response.data.payment_session_id 
            || response.data.cf_payment_session_id 
            || response.data.session_id
            || null

        console.log('📌 Extracted Session ID:', sessionId)
        console.log('   Field used: payment_session_id')

        if (!sessionId) {
            console.error('❌ Session ID not found in response. Expected field: payment_session_id')
            console.error('   Available fields:', Object.keys(response.data))
        }

        return {
            success: true,
            data: response.data,
            cashfreeOrderId,
            sessionId: sessionId
        }
    } catch (error) {
        console.error('❌ Cashfree Order Creation Error:')
        console.error('   Error Message:', error.response?.data?.message || error.message)
        console.error('   Status Code:', error.response?.status)
        console.error('   Error Details:', JSON.stringify(error.response?.data || error.message, null, 2))

        return {
            success: false,
            error: error.response?.data?.message || error.message,
            errorDetails: error.response?.data
        }
    }
}

/**
 * Verify Cashfree payment signature
 * 
 * @param {object} params - Verification parameters
 * @returns {boolean} Signature verification result
 */
export const verifyCashfreeSignature = (params) => {
    try {
        const {
            orderId,
            orderAmount,
            referenceId,
            signature,
            paymentStatus
        } = params

        // Regenerate signature based on received data
        const signatureData = `${orderId}${orderAmount}${referenceId}${paymentStatus}${CASHFREE_CONFIG.SECRET_KEY}`
        const expectedSignature = crypto
            .createHash('sha256')
            .update(signatureData)
            .digest('hex')

        // Compare signatures
        return signature === expectedSignature
    } catch (error) {
        console.error('❌ Cashfree Signature Verification Error:', error.message)
        return false
    }
}

/**
 * Fetch Cashfree payment details
 * 
 * @param {string} orderId - Cashfree order ID
 * @returns {Promise<object>} Payment details
 */
export const getCashfreePaymentStatus = async (orderId) => {
    try {
        const path = `/orders/${orderId}`
        const headers = generateCashfreeHeaders(path, 'GET')

        const url = `${CASHFREE_CONFIG.SANDBOX_URL}/${orderId}`

        const response = await axios.get(url, { headers })

        return {
            success: true,
            data: response.data
        }
    } catch (error) {
        console.error('❌ Cashfree Payment Status Error:', error.message)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Create Cashfree Payment Link (RECOMMENDED - No iframe whitelisting needed)
 * 
 * @param {object} params - Payment link parameters
 * @returns {Promise<object>} Cashfree payment link response with payment URL
 */
export const createCashfreePaymentLink = async (params) => {
    try {
        const {
            orderId,           // Internal order ID
            amount,            // Payment amount in INR
            customerId,        // Customer/User ID
            customerEmail,     // Customer email
            customerPhone,     // Customer phone
            customerName,      // Customer name
            returnUrl,         // URL to return after payment
            notifyUrl          // Webhook for payment notifications
        } = params

        // Generate unique reference ID
        const referenceId = `PAY_${Date.now()}_${orderId.toString().slice(-8)}`

        const requestBody = {
            reference_id: referenceId,
            customer_details: {
                customer_id: customerId.toString(),
                customer_email: customerEmail,
                customer_phone: customerPhone,
                customer_name: customerName
            },
            link_meta: {
                notify_url: notifyUrl || process.env.CASHFREE_NOTIFY_URL,
                return_url: returnUrl || process.env.CASHFREE_RETURN_URL
            },
            link_amount: parseFloat(amount),
            link_currency: 'INR',
            link_purpose: 'Order Payment',
            accepted_payment_methods: ['cc', 'dc', 'upi', 'nb', 'wallet', 'paypal']
        }

        console.log('📤 Creating Cashfree Payment Link:')
        console.log('   Reference ID:', referenceId)
        console.log('   Amount:', amount)
        console.log('   Customer:', customerEmail)

        const timestamp = Date.now()
        const signatureData = `/payment_links${timestamp}${JSON.stringify(requestBody)}${CASHFREE_CONFIG.SECRET_KEY}`
        const signature = crypto
            .createHash('sha256')
            .update(signatureData)
            .digest('hex')

        const headers = {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': CASHFREE_CONFIG.APP_ID,
            'x-client-secret': CASHFREE_CONFIG.SECRET_KEY,
            'x-request-id': crypto.randomUUID(),
            'x-idempotency-key': crypto.randomUUID()
        }

        const response = await axios.post(CASHFREE_CONFIG.PAYMENT_LINK_URL, requestBody, { headers })

        console.log('✅ Payment Link Created Successfully:')
        console.log('   Link ID:', response.data.link_id)
        console.log('   Payment URL:', response.data.short_url || response.data.link_url)

        return {
            success: true,
            data: response.data,
            referenceId,
            paymentUrl: response.data.short_url || response.data.link_url,
            linkId: response.data.link_id
        }
    } catch (error) {
        console.error('❌ Cashfree Payment Link Creation Error:')
        console.error('   Error Message:', error.response?.data?.message || error.message)
        console.error('   Status Code:', error.response?.status)
        console.error('   Error Details:', JSON.stringify(error.response?.data || error.message, null, 2))

        return {
            success: false,
            error: error.response?.data?.message || error.message,
            errorDetails: error.response?.data
        }
    }
}

/**
 * Get Cashfree SDK script URL for frontend
 * 
 * @returns {string} Cashfree SDK script URL
 */
export const getCashfreeSDKUrl = () => {
    // Test mode SDK URL
    return 'https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js'
}

/**
 * Format Cashfree configuration for frontend
 * 
 * @returns {object} Frontend-safe Cashfree configuration
 */
export const getCashfreeClientConfig = () => {
    return {
        // DO NOT expose SECRET_KEY to frontend
        appId: CASHFREE_CONFIG.APP_ID,
        isTestMode: true,
        sdkUrl: getCashfreeSDKUrl()
    }
}

export default {
    createCashfreeOrder,
    createCashfreePaymentLink,
    verifyCashfreeSignature,
    getCashfreePaymentStatus,
    getCashfreeSDKUrl,
    getCashfreeClientConfig,
    CASHFREE_CONFIG
}
