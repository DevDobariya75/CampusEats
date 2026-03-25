import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { addressesApi, cartApi, ordersApi, shopsApi } from '../api/services'

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
  const [specialNotes, setSpecialNotes] = useState('')
  const [addressForm, setAddressForm] = useState(initialAddressForm)
  const [shopOpen, setShopOpen] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

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
    const amount = Number(summary?.estimatedTotal ?? summary?.total ?? summary?.subTotal ?? 0)
    return amount > 0 ? amount : calculatedSubTotal
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
        setError(err.message)
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
      const response = await ordersApi.create({
        shopId,
        deliveryAddressId: selectedAddress,
        totalAmount,
        specialNotes,
      })

      await cartApi.clearCart(shopId)
      localStorage.removeItem('activeCartShopId')
      window.dispatchEvent(new Event('campus-cart-updated'))

      navigate(`/orders/${response.data?._id || ''}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addAddressInline = async (event) => {
    event.preventDefault()

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
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingAddress(false)
    }
  }

  return (
    <section>
      <h1>Checkout</h1>
      {error && <div className="card error">{error}</div>}
      {!shopOpen && <div className="card error">Shop is currently closed. You cannot place order right now.</div>}

      <div className="grid two-col">
        <article className="card">
          <h3>Delivery address</h3>
          {addresses.length === 0 && <p>Add your delivery address here to continue checkout.</p>}
          <div className="stack">
            {addresses.map((address) => (
              <label className="pick-card" key={address._id}>
                <input
                  type="radio"
                  name="address"
                  value={address._id}
                  checked={selectedAddress === address._id}
                  onChange={(event) => setSelectedAddress(event.target.value)}
                />
                <span>
                  <strong>{address.label || 'Address'}</strong>
                  <small>{address.addressLine}</small>
                  <small>{address.pinCode}</small>
                </span>
              </label>
            ))}
          </div>

          <form className="stack" onSubmit={addAddressInline}>
            <h3>Add delivery address</h3>
            <input
              value={addressForm.label}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="Label (Hostel, Home)"
            />
            <input
              value={addressForm.addressLine}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, addressLine: event.target.value }))}
              placeholder="Address line"
              required
            />
            <input
              value={addressForm.pinCode}
              onChange={(event) => setAddressForm((prev) => ({ ...prev, pinCode: event.target.value }))}
              placeholder="Pin code"
              required
            />
            <label className="check-label">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) => setAddressForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
              />
              Set as default address
            </label>
            <button className="btn btn-soft" type="submit" disabled={savingAddress}>
              {savingAddress ? 'Saving address...' : 'Add address'}
            </button>
          </form>
        </article>

        <article className="card">
          <h3>Order notes</h3>
          <textarea
            value={specialNotes}
            onChange={(event) => setSpecialNotes(event.target.value)}
            placeholder="Any special request for the shop"
          />

          <div className="summary-box">
            <p>Total amount</p>
            <strong>Rs {totalAmount}</strong>
          </div>

          <button className="btn" type="button" onClick={placeOrder} disabled={saving || !shopOpen}>
            {saving ? 'Placing order...' : 'Place order'}
          </button>
        </article>
      </div>
    </section>
  )
}
