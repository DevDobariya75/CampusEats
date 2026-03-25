import { useEffect, useState } from 'react'
import { deliveriesApi } from '../api/services'

export default function DeliveryDashboardPage() {
  const [deliveries, setDeliveries] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setError('')
      const [deliveriesResponse, statsResponse] = await Promise.all([
        deliveriesApi.listMine(),
        deliveriesApi.stats(),
      ])
      setDeliveries(
        Array.isArray(deliveriesResponse.data)
          ? deliveriesResponse.data
          : deliveriesResponse.data?.deliveries || [],
      )
      setStats(statsResponse.data)
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

  const advance = async (deliveryId, action) => {
    try {
      setError('')
      if (action === 'accept') {
        await deliveriesApi.accept(deliveryId)
      }
      if (action === 'picked') {
        await deliveriesApi.markPickedUp(deliveryId)
      }
      if (action === 'delivered') {
        await deliveriesApi.markDelivered(deliveryId)
      }
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <h1>Delivery Dashboard</h1>
      {error && <div className="card error">{error}</div>}

      {stats && (
        <div className="grid three-col">
          <article className="card">
            <h3>Total assigned</h3>
            <p>{stats.totalAssigned ?? stats.totalDeliveries ?? stats.total ?? 0}</p>
          </article>
          <article className="card">
            <h3>Picked up</h3>
            <p>{stats.pickedUp ?? 0}</p>
          </article>
          <article className="card">
            <h3>Delivered</h3>
            <p>{stats.delivered ?? 0}</p>
          </article>
        </div>
      )}

      <div className="stack">
        {deliveries.length === 0 && !error && <div className="card">No deliveries assigned yet.</div>}
        {deliveries.map((delivery) => (
          <article className="card" key={delivery._id}>
            <p>Order: {delivery.order?._id || '-'}</p>
            <p>Status: {delivery.status}</p>

            <p>
              <strong>Shop:</strong> {delivery.order?.shop?.name || '-'}
            </p>
            <p>
              <strong>Shop contact:</strong> {delivery.order?.shop?.phone || 'Not available'}
            </p>

            {delivery.status !== 'Assigned' && (
              <>
                <p>
                  <strong>Customer:</strong> {delivery.order?.customer?.name || '-'}
                </p>
                <p>
                  <strong>Customer mobile:</strong> {delivery.order?.customer?.phone || 'Not available'}
                </p>
                <p>
                  <strong>Deliver to:</strong>{' '}
                  {delivery.order?.deliveryAddress?.addressLine || '-'}
                  {delivery.order?.deliveryAddress?.landmark
                    ? `, ${delivery.order.deliveryAddress.landmark}`
                    : ''}
                  {delivery.order?.deliveryAddress?.city
                    ? `, ${delivery.order.deliveryAddress.city}`
                    : ''}
                  {delivery.order?.deliveryAddress?.state
                    ? `, ${delivery.order.deliveryAddress.state}`
                    : ''}
                  {delivery.order?.deliveryAddress?.pincode
                    ? ` - ${delivery.order.deliveryAddress.pincode}`
                    : ''}
                </p>
              </>
            )}

            <div className="row">
              {delivery.status === 'Assigned' && (
                <button className="btn" type="button" onClick={() => advance(delivery._id, 'accept')}>
                  Accept
                </button>
              )}
              {delivery.status === 'Accepted' && (
                <button className="btn" type="button" onClick={() => advance(delivery._id, 'picked')}>
                  Mark picked up
                </button>
              )}
              {(delivery.status === 'Accepted' || delivery.status === 'Picked Up') && (
                <button className="btn btn-soft" type="button" onClick={() => advance(delivery._id, 'delivered')}>
                  Mark delivered
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
