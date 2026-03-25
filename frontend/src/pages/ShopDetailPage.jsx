import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { cartApi, menuApi, shopsApi } from '../api/services'
import { useAuth } from '../context/AuthContext'

export default function ShopDetailPage() {
  const { shopId } = useParams()
  const { user } = useAuth()
  const [shop, setShop] = useState(null)
  const [items, setItems] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setError('')
        const [shopResponse, itemsResponse] = await Promise.all([
          shopsApi.getById(shopId),
          menuApi.listByShop(shopId),
        ])

        setShop(shopResponse.data)
        setItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.items || [])
      } catch (err) {
        setError(err.message)
      }
    }

    load()
  }, [shopId])

  const addToCart = async (menuItemId) => {
    if (!user) {
      setError('Please login to add items to cart.')
      return
    }

    if (!shop?.isOpen) {
      setError('Shop is currently closed.')
      return
    }

    try {
      setError('')
      await cartApi.addItem(shopId, { menuItemId, quantity: 1 })
      localStorage.setItem('activeCartShopId', shopId)
      window.dispatchEvent(new Event('campus-cart-updated'))
      setMessage('Item added to cart.')
      setTimeout(() => setMessage(''), 1500)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      {shop && (
        <div className="hero-panel compact">
          <h1>{shop.name}</h1>
          <p>{shop.description || 'Delicious menu curated for students and faculty.'}</p>
          <div className="row">
            <span className={shop.isOpen ? 'status-open' : 'status-closed'}>
              {shop.isOpen ? 'Open for orders' : 'Not accepting orders'}
            </span>
          </div>
        </div>
      )}

      {message && <div className="card success">{message}</div>}
      {error && <div className="card error">{error}</div>}
      {shop && !shop.isOpen && <div className="card error">Shop is currently closed.</div>}

      <div className="grid">
        {items.map((item) => (
          <article className="card menu-card" key={item._id}>
            <img
              src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200'}
              alt={item.name}
            />
            <div>
              <h3>{item.name}</h3>
              <p>{item.description || 'Signature dish'}</p>
              <p>Category: {item.category || 'General'}</p>
              <p>Stock: {item.stock ?? 0}</p>
              <p className="price">Rs {item.price}</p>
            </div>
            <button
              className="btn"
              type="button"
              onClick={() => addToCart(item._id)}
              disabled={!item.isAvailable || !shop?.isOpen}
            >
              {!shop?.isOpen ? 'Shop Closed' : item.isAvailable ? 'Add to cart' : 'Unavailable'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}
