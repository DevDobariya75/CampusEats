import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { MapPin, CreditCard, Wallet, DollarSign, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { addressesApi, cartApi, ordersApi, shopsApi, paymentsApi } from '../api/services'
import { Button, LoadingSpinner } from '../components/ui/Button'
import { AnimatedGradientBg, StaggerContainer, StaggerItem } from '../components/ui/3DElements'
import { formatPrice } from '../utils/helpers'

const initialAddressForm = {
  label: '',
  addressLine: '',
  pinCode: '',
  isDefault: false,
}

export default function CheckoutPage() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [specialNotes, setSpecialNotes] = useState('')
  const [addressForm, setAddressForm] = useState(initialAddressForm)
  const [shopOpen, setShopOpen] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)

  const calculatedSubTotal = useMemo(
    () =>
      cartItems.reduce((total, item) => {
        const price = Number(item.price ?? item.menuItem?.price ?? 0)
        const quantity = Number(item.quantity ?? 0)
        return total + price * quantity
      }, 0),
    [cartItems],
  )

  const totalAmount = useMemo(() => {
    const total = summary?.total ?? summary?.estimatedTotal ?? summary?.subTotal ?? 0
    return Number(total) > 0 ? Number(total) : calculatedSubTotal
  }, [summary, calculatedSubTotal])

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const [addressResponse, summaryResponse, itemsResponse, shopResponse] = await Promise.all([
          addressesApi.list(),
          cartApi.getSummary(shopId),
          cartApi.getCartItems(shopId),
          shopsApi.getById(shopId),
        ])
        const list = Array.isArray(addressResponse.data)
          ? addressResponse.data
          : addressResponse.data?.addresses || []
        setAddresses(list)
        const defaultAddress = list.find((address) => address.isDefault)
        setSelectedAddress(defaultAddress?._id || list[0]?._id || '')
        setSummary(summaryResponse.data)
        setCartItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.cartItems || [])
        setShopOpen(Boolean(shopResponse.data?.isOpen))

        localStorage.setItem('activeCartShopId', shopId)
        window.dispatchEvent(new Event('campus-cart-updated'))
      } catch (err) {
        setError(err.message || 'Failed to load checkout data')
      }
    }

    load()
  }, [shopId])

  const placeOrder = async () => {
    if (!shopOpen) {
      setError('Shop is currently closed.')
      return
    }

    if (!selectedAddress) {
      setError('Please choose a delivery address before placing your order.')
      return
    }

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      // Create order
      const response = await ordersApi.create({
        shopId,
        deliveryAddressId: selectedAddress,
        totalAmount,
        specialNotes,
        paymentMethod,
      })

      // Create payment record
      try {
        await paymentsApi.create({
          orderId: response.data?._id,
          amount: totalAmount,
          method: paymentMethod,
          status: paymentMethod === 'upi' ? 'pending' : 'completed',
        })
      } catch (paymentErr) {
        console.warn('Payment creation warning:', paymentErr)
      }

      await cartApi.clearCart(shopId)
      localStorage.removeItem('activeCartShopId')
      window.dispatchEvent(new Event('campus-cart-updated'))

      setSuccess('Order placed successfully!')
      setTimeout(() => {
        navigate(`/orders/${response.data?._id || ''}`)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setSaving(false)
    }
  }

  const addAddressInline = async (event) => {
    event.preventDefault()

    if (!addressForm.addressLine || !addressForm.pinCode) {
      setError('Please fill in all address fields')
      return
    }

    try {
      setSavingAddress(true)
      setError('')
      const response = await addressesApi.create(addressForm)
      const createdAddress = response.data
      const refreshed = await addressesApi.list()
      const list = Array.isArray(refreshed.data) ? refreshed.data : refreshed.data?.addresses || []
      setAddresses(list)
      setSelectedAddress(createdAddress?._id || list[0]?._id || '')
      setAddressForm(initialAddressForm)
      setShowAddressForm(false)
      setSuccess('Address added successfully!')
    } catch (err) {
      setError(err.message || 'Failed to add address')
    } finally {
      setSavingAddress(false)
    }
  }

  if (!shopId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid Shop</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Please select a shop to checkout</p>
          <Button onClick={() => navigate('/')}>Back to Shops</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen bg-white dark:bg-slate-950 py-12 px-4 md:px-8"
    >
      <AnimatedGradientBg />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold mb-2 font-display bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Review your order and complete payment</p>
        </motion.div>

        {/* Alerts */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </motion.div>
        )}

        {!shopOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-700 dark:text-yellow-300">Shop is currently closed. You will not be able to place orders.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Addresses & Payment */}
          <div className="lg:col-span-2 space-y-6">
            <StaggerContainer delay={0.1}>
              {/* Delivery Address Section */}
              <StaggerItem>
                <motion.div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl border dark:border-slate-700 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Delivery Address</h2>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400 mb-4">No addresses found. Add one to continue.</p>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {addresses.map((address) => (
                        <motion.div
                          key={address._id}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-start gap-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
                          onClick={() => setSelectedAddress(address._id)}
                        >
                          <input
                            type="radio"
                            name="address"
                            value={address._id}
                            checked={selectedAddress === address._id}
                            onChange={(e) => setSelectedAddress(e.target.value)}
                            className="w-5 h-5 mt-0.5 accent-orange-500 flex-shrink-0 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{address.label || 'Address'}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-words">{address.addressLine}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Pin: {address.pinCode}</p>
                            {address.isDefault && (
                              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Add Address Form Toggle */}
                  {!showAddressForm && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddressForm(true)}
                      className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:border-orange-500 dark:hover:border-orange-400 transition-colors font-semibold"
                    >
                      + Add New Address
                    </motion.button>
                  )}

                  {/* Add Address Form */}
                  {showAddressForm && (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={addAddressInline}
                      className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                    >
                      <h3 className="font-semibold text-slate-900 dark:text-white">Add New Address</h3>
                      <input
                        type="text"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, label: e.target.value }))}
                        placeholder="Label (e.g., Hostel, Home)"
                        className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        value={addressForm.addressLine}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, addressLine: e.target.value }))}
                        placeholder="Address line"
                        required
                        className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        value={addressForm.pinCode}
                        onChange={(e) => setAddressForm((prev) => ({ ...prev, pinCode: e.target.value }))}
                        placeholder="Pin code"
                        required
                        className="w-full px-4 py-2 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                          className="accent-orange-500 rounded"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Set as default address</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={savingAddress}
                          className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          {savingAddress ? 'Saving...' : 'Add'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressForm(false)
                            setAddressForm(initialAddressForm)
                          }}
                          className="flex-1 py-2 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.form>
                  )}
                </motion.div>
              </StaggerItem>

              {/* Payment Method Section */}
              <StaggerItem>
                <motion.div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl border dark:border-slate-700 p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Method</h2>
                  </div>

                  <div className="space-y-3">
                    {[
                      { value: 'card', label: 'Credit/Debit Card', Icon: CreditCard },
                      { value: 'upi', label: 'UPI', Icon: Wallet },
                      { value: 'cash', label: 'Cash on Delivery', Icon: DollarSign },
                    ].map((method) => (
                      <motion.div
                        key={method.value}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setPaymentMethod(method.value)}
                        className="flex items-center gap-3 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-400 transition-colors"
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 accent-orange-500 flex-shrink-0 cursor-pointer"
                        />
                        <method.Icon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-900 dark:text-white text-sm flex-1">{method.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>

              {/* Special Notes Section */}
              <StaggerItem>
                <motion.div
                  className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl border dark:border-slate-700 p-6"
                >
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Special Instructions</h2>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Any special requests or dietary preferences?"
                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none h-24"
                  />
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <StaggerItem>
              <motion.div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg dark:shadow-2xl border dark:border-slate-700 p-6 sticky top-32 max-h-[calc(100vh-200px)] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

            {/* Items */}
                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto">
                  {cartItems.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-400 text-center py-4">No items in cart</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {item.menuItem?.name || 'Item'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm flex-shrink-0">
                          {formatPrice(Number(item.price ?? item.menuItem?.price ?? 0) * Number(item.quantity ?? 0))}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatPrice(summary?.subtotal || calculatedSubTotal)}</span>
                  </div>
                  {summary?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Delivery</span>
                      <span>{formatPrice(summary.deliveryFee)}</span>
                    </div>
                  )}
                  {summary?.tax > 0 && (
                    <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>Tax</span>
                      <span>{formatPrice(summary.tax)}</span>
                    </div>
                  )}
                  {summary?.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount</span>
                      <span>-{formatPrice(summary.discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-sky-50 dark:from-orange-900/20 dark:to-sky-900/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">Total Amount</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-sky-600 bg-clip-text text-transparent">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={placeOrder}
                  disabled={saving || !shopOpen || !selectedAddress || cartItems.length === 0}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  onClick={() => navigate(`/cart/${shopId}`)}
                  className="w-full mt-3 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back to Cart
                </button>
              </motion.div>
            </StaggerItem>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
