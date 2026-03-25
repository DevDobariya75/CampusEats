import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ordersApi } from '../api/services'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await ordersApi.listMine()
      setOrders(Array.isArray(response.data) ? response.data : response.data?.orders || [])
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      load()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <section>
      <h1>Your orders</h1>
      {error && <div className="card error">{error}</div>}

      <div className="stack">
        {orders.map((order) => (
          <article className="card" key={order._id}>
            <h3>{order.shop?.name || 'Campus shop order'}</h3>
            <p>Status: {order.status}</p>
            <p>Amount: Rs {order.totalAmount}</p>
            <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
            <Link className="btn btn-soft" to={`/orders/${order._id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
