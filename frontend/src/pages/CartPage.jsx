import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cartApi } from '../api/services'

export default function CartPage() {
  const { shopId } = useParams()
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const calculateFromItems = useCallback((cartItems) => {
    const subTotal = cartItems.reduce((total, item) => {
      const price = Number(item.price ?? item.menuItem?.price ?? 0)
      const quantity = Number(item.quantity ?? 0)
      return total + price * quantity
    }, 0)

    const itemCount = cartItems.reduce((total, item) => total + Number(item.quantity ?? 0), 0)

    return {
      itemCount,
      subTotal,
      total: subTotal,
      estimatedTotal: subTotal,
    }
  }, [])

  const loadCart = useCallback(async () => {
    try {
      setError('')
      const [itemsResponse, summaryResponse] = await Promise.all([
        cartApi.getCartItems(shopId),
        cartApi.getSummary(shopId),
      ])
      const cartItems = Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.cartItems || []
      const apiSummary = summaryResponse.data || {}
      const computed = calculateFromItems(cartItems)

      setItems(cartItems)
      setSummary({
        ...apiSummary,
        itemCount: Number(apiSummary.itemCount ?? 0) > 0 ? apiSummary.itemCount : computed.itemCount,
        subTotal: Number(apiSummary.subTotal ?? 0) > 0 ? apiSummary.subTotal : computed.subTotal,
        total: Number(apiSummary.total ?? 0) > 0 ? apiSummary.total : computed.total,
        estimatedTotal:
          Number(apiSummary.estimatedTotal ?? 0) > 0 ? apiSummary.estimatedTotal : computed.estimatedTotal,
      })

      localStorage.setItem('activeCartShopId', shopId)
      window.dispatchEvent(new Event('campus-cart-updated'))
    } catch (err) {
      setError(err.message)
    }
  }, [shopId, calculateFromItems])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return
    }

    await cartApi.updateItem(shopId, itemId, { quantity })
    loadCart()
  }

  const removeItem = async (itemId) => {
    await cartApi.removeItem(shopId, itemId)
    loadCart()
  }

  return (
    <section>
      <h1>Your cart</h1>
      {error && <div className="card error">{error}</div>}

      <div className="stack">
        {items.map((item) => (
          <article className="card cart-row" key={item._id}>
            <div>
              <h3>{item.name || item.menuItem?.name}</h3>
              <p>Rs {item.price}</p>
            </div>

            <div className="row">
              <button className="btn btn-soft" type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button className="btn btn-soft" type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                +
              </button>
              <button className="btn btn-danger" type="button" onClick={() => removeItem(item._id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      {summary && (
        <article className="card summary-card">
          <h3>Summary</h3>
          <p>Items: {summary.itemCount ?? 0}</p>
          <p>Subtotal: Rs {summary.subTotal ?? 0}</p>
          <p>Total: Rs {summary.estimatedTotal ?? summary.total ?? summary.subTotal ?? 0}</p>
          <Link className="btn" to={`/checkout/${shopId}`}>
            Proceed to checkout
          </Link>
        </article>
      )}
    </section>
  )
}
