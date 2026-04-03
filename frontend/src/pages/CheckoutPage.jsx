import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [reservationId, setReservationId] = useState('')
  const [reservationExpiresAt, setReservationExpiresAt] = useState(null)
  const [reservationTimeLeft, setReservationTimeLeft] = useState(0)
  const [reservingStock, setReservingStock] = useState(false)
  const [reservationBlocked, setReservationBlocked] = useState(false)
  const orderPlacedRef = useRef(false)

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

  const reservationTimerText = useMemo(() => {
    if (!reservationTimeLeft || reservationTimeLeft < 0) {
      return '00:00'
    }

    const minutes = Math.floor(reservationTimeLeft / 60)
    const seconds = reservationTimeLeft % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [reservationTimeLeft])

  const toPaymentMethod = (method) => {
    const map = {
      card: 'Credit Card',
      upi: 'UPI',
      cash: 'Cash',
    }

    return map[method] || 'Credit Card'
  }

  const releaseReservation = async (reason = 'checkout_exit') => {
    if (!reservationId) {
      return
    }

    const currentReservationId = reservationId

    try {
      await ordersApi.releaseReservation(currentReservationId, { reason })
    } catch {
      // Best effort release to avoid leaking reserved stock.
    } finally {
      setReservationId('')
      setReservationExpiresAt(null)
      setReservationTimeLeft(0)
    }
  }

  const acquireReservation = async ({ clearExistingError = false } = {}) => {
    if (!shopOpen || !shopId || !cartItems.length) {
      return null
    }

    try {
      setReservingStock(true)
      if (clearExistingError) {
        setError('')
      }

      const response = await ordersApi.holdReservation({ shopId })
      const nextReservationId = response.data?._id || ''
      const nextExpiresAt = response.data?.expiresAt || null
      const nextTimeLeft = nextExpiresAt
        ? Math.max(0, Math.floor((new Date(nextExpiresAt).getTime() - Date.now()) / 1000))
        : 0

      setReservationId(nextReservationId)
      setReservationExpiresAt(nextExpiresAt)
      setReservationTimeLeft(nextTimeLeft)
      setReservationBlocked(false)
      if (nextReservationId) {
        setError('')
      }

      return { reservationId: nextReservationId, timeLeft: nextTimeLeft }
    } catch (err) {
      setReservationId('')
      setReservationExpiresAt(null)
      setReservationTimeLeft(0)
      setReservationBlocked(true)
      setError(err.message || 'Item just went out of stock. Please refresh cart.')
      return null
    } finally {
      setReservingStock(false)
    }
  }

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
        setReservationBlocked(false)

        localStorage.setItem('activeCartShopId', shopId)
        window.dispatchEvent(new Event('campus-cart-updated'))
      } catch (err) {
        setError(err.message || 'Failed to load checkout data')
      }
    }

    load()
  }, [shopId])

  useEffect(() => {
    if (!shopOpen || !shopId || !cartItems.length || reservationId || reservationBlocked) {
      return
    }

    let cancelled = false

    const holdInventory = async () => {
      const held = await acquireReservation()
      if (cancelled || !held) {
        return
      }
    }

    holdInventory()

    return () => {
      cancelled = true
    }
  }, [cartItems.length, reservationBlocked, reservationId, shopId, shopOpen])

  useEffect(() => {
    if (!reservationId || !reservationExpiresAt) {
      return undefined
    }

    const updateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((new Date(reservationExpiresAt).getTime() - Date.now()) / 1000))
      setReservationTimeLeft(remaining)
    }

    updateTimeLeft()
    const timer = window.setInterval(updateTimeLeft, 1000)

    return () => window.clearInterval(timer)
  }, [reservationExpiresAt, reservationId])

  useEffect(() => {
    if (!reservationId || !reservationExpiresAt || orderPlacedRef.current) {
      return
    }

    const remainingNow = Math.max(0, Math.floor((new Date(reservationExpiresAt).getTime() - Date.now()) / 1000))
    if (remainingNow > 0) {
      return
    }

    setReservationBlocked(true)
    setError('Your 10-minute inventory hold expired. Please try checkout again.')
    releaseReservation('reservation_expired')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reservationExpiresAt, reservationId, reservationTimeLeft])

  useEffect(() => {
    return () => {
      if (!orderPlacedRef.current && reservationId) {
        ordersApi.releaseReservation(reservationId, { reason: 'checkout_exit' }).catch(() => {})
      }
    }
  }, [reservationId])

  const placeOrder = async () => {
    if (!shopOpen) {
      setError('Shop is currently closed.')
      return
    }

    const overLimitItem = cartItems.find((item) => {
      const stock = Number(item.menuItem?.stock ?? Number.POSITIVE_INFINITY)
      return Number.isFinite(stock) && Number(item.quantity ?? 0) > stock
    })

    if (overLimitItem) {
      setError(`Please reduce ${overLimitItem.menuItem?.name || 'an item'} to the available stock before checkout.`)
      return
    }

    if (!selectedAddress) {
      setError('Please choose a delivery address before placing your order.')
      return
    }

    const reservationExpired = reservationExpiresAt
      ? Math.floor((new Date(reservationExpiresAt).getTime() - Date.now()) / 1000) <= 0
      : true

    let effectiveReservationId = reservationId
    if (!effectiveReservationId || reservationExpired) {
      const heldReservation = await acquireReservation({ clearExistingError: true })
      if (!heldReservation?.reservationId || heldReservation.timeLeft <= 0) {
        setError('Item just went out of stock. Please try checkout again.')
        return
      }
      effectiveReservationId = heldReservation.reservationId
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
        reservationId: effectiveReservationId,
      })

      orderPlacedRef.current = true

      // Create payment record
      try {
        const paymentResponse = await paymentsApi.create({
          orderId: response.data?._id,
          amount: totalAmount,
          method: toPaymentMethod(paymentMethod),
        })

        if (paymentResponse.data?._id) {
          if (paymentMethod === 'upi') {
            await paymentsApi.verifyUpi(paymentResponse.data._id, {
              upiTransactionId: `UPI-${Date.now()}`,
            })
          } else {
            await paymentsApi.updateStatus(paymentResponse.data._id, { status: 'Completed' })
          }
        }
      } catch (paymentErr) {
        await ordersApi.cancel(response.data?._id)
        orderPlacedRef.current = false
        throw new Error(paymentErr.message || 'Payment failed. Stock was restored. Please try again.')
      }

      await cartApi.clearCart(shopId)
      localStorage.removeItem('activeCartShopId')
      window.dispatchEvent(new Event('campus-cart-updated'))

      setReservationId('')
      setReservationExpiresAt(null)
      setReservationTimeLeft(0)

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
      className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] py-12 px-4 md:px-8 transition-colors duration-300"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)]" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black mb-2 font-display text-slate-900 dark:text-white">
            Checkout
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Review your order and complete payment</p>
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

        {reservationId && reservationTimeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-blue-700 dark:text-blue-300">
              Items are reserved for you. Complete payment within <span className="font-black">{reservationTimerText}</span>.
            </p>
          </motion.div>
        )}

        {reservationBlocked && !reservationId && !reservingStock && cartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={async () => {
                const held = await acquireReservation({ clearExistingError: true })
                if (!held?.reservationId) {
                  setReservationBlocked(true)
                }
              }}
              className="inline-flex items-center justify-center rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-orange-600 transition-colors hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300"
            >
              Retry Inventory Hold
            </button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Addresses & Payment */}
          <div className="lg:col-span-2 space-y-6">
            <StaggerContainer delay={0.1}>
              {/* Delivery Address Section */}
              <StaggerItem>
                <motion.div
                  className="bento-card p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-orange-400" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Delivery Address</h2>
                  </div>

                  {addresses.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No addresses found. Add one to continue.</p>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {addresses.map((address) => (
                        <motion.div
                          key={address._id}
                          whileHover={{ scale: 1.01 }}
                          className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors ${selectedAddress === address._id ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}
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
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{address.label || 'Address'}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-words">{address.addressLine}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Pin: {address.pinCode}</p>
                            {address.isDefault && (
                              <span className="inline-block mt-2 px-2 py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-full">
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
                      className="w-full py-4 border border-dashed border-slate-300 dark:border-white/20 rounded-2xl text-slate-500 dark:text-slate-400 hover:border-orange-400 hover:text-orange-400 transition-colors font-bold text-sm uppercase tracking-widest bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
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
                  className="bento-card p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Payment Method</h2>
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
                        className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-orange-500/50 transition-colors ${paymentMethod === method.value ? 'border-orange-500 bg-orange-500/10' : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'}`}
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
                        <span className="font-bold text-slate-900 dark:text-white text-sm flex-1">{method.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </StaggerItem>

              {/* Special Notes Section */}
              <StaggerItem>
                <motion.div
                  className="bento-card p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"
                >
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4">Special Instructions</h2>
                  <textarea
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="Any special requests or dietary preferences?"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none h-24 backdrop-blur-md shadow-inner"
                  />
                </motion.div>
              </StaggerItem>
            </StaggerContainer>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <StaggerItem>
              <motion.div
                className="bento-card p-8 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/20 rounded-3xl shadow-[0_8px_30px_rgb(15,23,42,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
              >
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Order Summary</h2>

            {/* Items */}
                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {cartItems.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">No items in cart</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-start pb-3 border-b border-slate-200 dark:border-white/10 last:border-0">
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.menuItem?.name || 'Item'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Qty: {item.quantity}
                          </p>
                          {item.menuItem?.stock != null && (
                            <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-1">
                              Available: {item.menuItem.stock}
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm flex-shrink-0">
                          {formatPrice(Number(item.price ?? item.menuItem?.price ?? 0) * Number(item.quantity ?? 0))}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 mb-6 pb-6 border-b border-slate-200 dark:border-white/10">
                  <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="text-slate-900 dark:text-white font-bold">{formatPrice(summary?.subtotal || calculatedSubTotal)}</span>
                  </div>
                  {summary?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Delivery</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formatPrice(summary.deliveryFee)}</span>
                    </div>
                  )}
                  {summary?.tax > 0 && (
                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>Tax</span>
                      <span className="text-slate-900 dark:text-white font-bold">{formatPrice(summary.tax)}</span>
                    </div>
                  )}
                  {summary?.discount > 0 && (
                    <div className="flex justify-between text-sm text-orange-400">
                      <span>Discount</span>
                      <span className="font-bold">-{formatPrice(summary.discount)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-6 p-4 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300 font-black tracking-widest uppercase text-xs">Total Amount</span>
                    <span className="text-3xl font-black text-orange-500">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={placeOrder}
                  disabled={saving || reservingStock || !shopOpen || !selectedAddress || cartItems.length === 0}
                  className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                  {saving || reservingStock ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>{reservingStock ? 'Reserving Stock...' : 'Placing Order...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <button
                  onClick={async () => {
                    await releaseReservation('checkout_cancelled')
                    navigate(`/cart/${shopId}`)
                  }}
                  className="w-full mt-4 py-4 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
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

