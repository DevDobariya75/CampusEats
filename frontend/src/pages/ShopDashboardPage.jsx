import { useEffect, useState } from 'react'
import { ordersApi, shopsApi } from '../api/services'

export default function ShopDashboardPage() {
  const [shopId, setShopId] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setError('')
      setMessage('')
      setLoading(true)
      const myShopResponse = await shopsApi.getMine()
      const myShop = myShopResponse.data
      const currentShopId = myShop?._id || ''
      setShopId(currentShopId)

      if (currentShopId) {
        const ordersResponse = await ordersApi.listForShop(currentShopId)
        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : ordersResponse.data?.orders || [])
      } else {
        setOrders([])
        setError('No shop found for this account.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadData()
    }, 8000)

    return () => clearInterval(intervalId)
  }, [])

  const updateStatus = async (orderId, status) => {
    try {
      setError('')
      const response = await ordersApi.updateStatus(orderId, { status })
      setMessage(response.message || `Order moved to ${status}.`)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const getNextActions = (status) => {
    if (status === 'Pending') {
      return ['Confirmed', 'Cancelled']
    }
    if (status === 'Confirmed') {
      return ['Preparing', 'Cancelled']
    }
    if (status === 'Preparing') {
      return ['Out for Delivery']
    }
    return []
  }

  const getStatusClassName = (status) => {
    if (status === 'Delivered') {
      return 'status-chip status-done'
    }
    if (status === 'Cancelled') {
      return 'status-chip status-cancel'
    }
    return 'status-chip status-progress'
  }

  return (
    <section>
      <h1>Shop Dashboard</h1>
      <p className="muted">Incoming orders for your shop are managed here.</p>
      {message && <div className="card success">{message}</div>}
      {error && <div className="card error">{error}</div>}

      {loading && <div className="card">Loading incoming orders...</div>}

      {!loading && shopId && (
        <section className="orders-board">
          {orders.length === 0 ? (
            <article className="card">
              <h3>No incoming orders yet</h3>
              <p className="muted">New customer orders will appear here.</p>
            </article>
          ) : (
            orders.map((order) => {
              const actions = getNextActions(order.status)
              const assignedName = order.assignedPartner?.name || 'Not assigned yet'
              const assignedPhone = order.assignedPartner?.phone || 'Not available'
              const hasAssignedPartner = Boolean(order.assignedPartner)
              return (
                <article className="card order-card" key={order._id}>
                  <div className="order-head">
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <span className={getStatusClassName(order.status)}>{order.status}</span>
                  </div>

                  {order.status === 'Out for Delivery' && (
                    <p className="muted">
                      <strong>Assigned to:</strong>{' '}
                      {hasAssignedPartner ? `${assignedName} (${assignedPhone})` : 'Not assigned yet'}
                    </p>
                  )}

                  <div className="order-meta">
                    <p>
                      <strong>Amount:</strong> Rs {order.totalAmount}
                    </p>
                    <p>
                      <strong>Customer:</strong> {order.customer?.name || '-'}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.deliveryAddress?.addressLine || '-'}
                    </p>
                    <p>
                      <strong>Notes:</strong> {order.specialNotes || 'No notes'}
                    </p>
                    {(order.status === 'Out for Delivery' || hasAssignedPartner) && (
                      <>
                        <p>
                          <strong>Delivery partner:</strong> {assignedName}
                        </p>
                        <p>
                          <strong>Partner mobile:</strong> {assignedPhone}
                        </p>
                        <p>
                          <strong>Delivery status:</strong> {order.deliveryStatus || 'Assigned'}
                        </p>
                      </>
                    )}
                  </div>

                  {actions.length > 0 && (
                    <div className="row wrap-row">
                      {actions.map((status) => (
                        <button
                          className={status === 'Cancelled' ? 'btn btn-danger' : 'btn btn-soft'}
                          type="button"
                          key={status}
                          onClick={() => updateStatus(order._id, status)}
                        >
                          Mark {status}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              )
            })
          )}
        </section>
      )}
    </section>
  )
}
