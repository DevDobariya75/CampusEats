import { useEffect, useState } from 'react'
import { addressesApi } from '../api/services'

const initialForm = {
  label: '',
  addressLine: '',
  pinCode: '',
  isDefault: false,
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')

  const loadAddresses = async () => {
    try {
      setError('')
      const response = await addressesApi.list()
      setAddresses(Array.isArray(response.data) ? response.data : response.data?.addresses || [])
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await addressesApi.create(form)
      setForm(initialForm)
      loadAddresses()
    } catch (err) {
      setError(err.message)
    }
  }

  const setDefault = async (addressId) => {
    await addressesApi.setDefault(addressId)
    loadAddresses()
  }

  const removeAddress = async (addressId) => {
    await addressesApi.remove(addressId)
    loadAddresses()
  }

  return (
    <section>
      <h1>Delivery addresses</h1>
      {error && <div className="card error">{error}</div>}

      <div className="grid two-col">
        <form className="card form" onSubmit={handleSubmit}>
          <h3>Add address</h3>
          <input
            value={form.label}
            onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
            placeholder="Label (Home, Hostel, Office)"
          />
          <textarea
            value={form.addressLine}
            onChange={(event) => setForm((prev) => ({ ...prev, addressLine: event.target.value }))}
            placeholder="Full address"
            required
          />
          <input
            value={form.pinCode}
            onChange={(event) => setForm((prev) => ({ ...prev, pinCode: event.target.value }))}
            placeholder="Pin code"
            required
          />
          <label className="check-label">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
            />
            Set as default
          </label>
          <button className="btn" type="submit">
            Save address
          </button>
        </form>

        <div className="stack">
          {addresses.map((address) => (
            <article className="card" key={address._id}>
              <h3>{address.label || 'Address'}</h3>
              <p>{address.addressLine}</p>
              <p>{address.pinCode}</p>
              <div className="row">
                {address.isDefault ? (
                  <span className="status-open">Default</span>
                ) : (
                  <button className="btn btn-soft" type="button" onClick={() => setDefault(address._id)}>
                    Make default
                  </button>
                )}
                <button className="btn btn-danger" type="button" onClick={() => removeAddress(address._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
