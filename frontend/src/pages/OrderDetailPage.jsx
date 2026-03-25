import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ordersApi } from '../api/services'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  const loadOrder = async () => {
    try {
      const response = await ordersApi.getById(orderId)
      const value = Array.isArray(response.data)
        ? response.data.find((item) => item._id === orderId)
        : response.data
      setOrder(value)
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

  useEffect(() => {
    const isTerminal = ['Delivered', 'Cancelled'].includes(order?.status)
    if (isTerminal) {
      return undefined
    }

    const intervalId = setInterval(() => {
      loadOrder()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [orderId, order?.status])

  const isCancelable = useMemo(
    () => order && ['Pending', 'Confirmed'].includes(order.status),
    [order],
  )

  const cancelOrder = async () => {
    try {
      await ordersApi.cancel(orderId)
      await loadOrder()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <h1>Order details</h1>
      {error && <div className="card error">{error}</div>}

      {order && (
        <article className="card stack">
          <p>Order ID: {order._id}</p>
          <p>Status: {order.status}</p>
          <p>Amount: Rs {order.totalAmount}</p>
          <p>Shop: {order.shop?.name || '-'}</p>
          <p>Customer: {order.customer?.name || '-'}</p>
          <p>Address: {order.deliveryAddress?.addressLine || '-'}</p>
          <p>Notes: {order.specialNotes || '-'}</p>
          {isCancelable && (
            <button className="btn btn-danger" type="button" onClick={cancelOrder}>
              Cancel order
            </button>
          )}
        </article>
      )}
    </section>
  )
}
