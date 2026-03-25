import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { shopsApi } from '../api/services'

export default function ShopsPage() {
  const [shops, setShops] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadShops = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const query = new URLSearchParams()
      if (search.trim()) {
        query.set('search', search.trim())
      }
      const response = await shopsApi.list(query.toString())
      setShops(Array.isArray(response.data) ? response.data : response.data?.shops || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadShops()
  }, [loadShops])

  const handleSubmit = (event) => {
    event.preventDefault()
    loadShops()
  }

  return (
    <section>
      <div className="hero-panel">
        <p className="eyebrow">Campus Delivery</p>
        <h1>Find food around your campus in minutes</h1>
        <p>Browse shops, add menu items to cart, and place secure orders.</p>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by shop name"
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {loading && <div className="card">Loading shops...</div>}
      {error && <div className="card error">{error}</div>}

      <div className="grid">
        {shops.map((shop) => (
          <article className="card shop-card" key={shop._id}>
            <img
              src={shop.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'}
              alt={shop.name}
            />
            <div>
              <h3>{shop.name}</h3>
              <p>{shop.description || 'Fresh meals and quick delivery.'}</p>
              <p className={shop.isOpen ? 'status-open' : 'status-closed'}>
                {shop.isOpen ? 'Open now' : 'Closed right now'}
              </p>
            </div>
            <Link className="btn" to={`/shops/${shop._id}`}>
              View Menu
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
