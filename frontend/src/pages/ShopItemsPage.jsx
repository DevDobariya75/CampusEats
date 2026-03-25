import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { menuApi, shopsApi } from '../api/services'

const itemFormState = {
  name: '',
  description: '',
  price: '',
  category: 'General',
  stock: '0',
}

export default function ShopItemsPage() {
  const [shop, setShop] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [itemForm, setItemForm] = useState(itemFormState)
  const [itemImage, setItemImage] = useState(null)
  const [editingItemId, setEditingItemId] = useState('')
  const [editForm, setEditForm] = useState(itemFormState)
  const [editImage, setEditImage] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      setError('')
      const myShopResponse = await shopsApi.getMine()
      const myShop = myShopResponse.data
      setShop(myShop)

      if (myShop?._id) {
        const itemsResponse = await menuApi.listByShop(myShop._id)
        setMenuItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : itemsResponse.data?.items || [])
      } else {
        setMenuItems([])
      }
    } catch (err) {
      const text = String(err.message || '').toLowerCase()
      if (text.includes('shop not found')) {
        setShop(null)
        setMenuItems([])
        setError('Please create your shop profile first from Shop Dashboard.')
      } else {
        setError(err.message)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const addMenuItem = async (event) => {
    event.preventDefault()
    if (!shop?._id) {
      setError('Create your shop first before adding items.')
      return
    }

    try {
      setError('')
      const formData = new FormData()
      formData.append('name', itemForm.name)
      formData.append('description', itemForm.description)
      formData.append('price', itemForm.price)
      formData.append('category', itemForm.category)
      formData.append('stock', itemForm.stock)
      if (itemImage) {
        formData.append('image', itemImage)
      }

      await menuApi.create(shop._id, formData)
      setItemForm(itemFormState)
      setItemImage(null)
      setMessage('Menu item added successfully.')
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleItem = async (itemId) => {
    if (!shop?._id) {
      return
    }

    try {
      await menuApi.toggle(shop._id, itemId)
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEdit = (item) => {
    setEditingItemId(item._id)
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      price: String(item.price ?? ''),
      category: item.category || 'General',
      stock: String(item.stock ?? 0),
    })
    setEditImage(null)
  }

  const cancelEdit = () => {
    setEditingItemId('')
    setEditForm(itemFormState)
    setEditImage(null)
  }

  const saveEdit = async (itemId) => {
    if (!shop?._id) {
      return
    }

    try {
      setError('')
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('description', editForm.description)
      formData.append('price', editForm.price)
      formData.append('category', editForm.category)
      formData.append('stock', editForm.stock)
      if (editImage) {
        formData.append('image', editImage)
      }

      await menuApi.update(shop._id, itemId, formData)
      setMessage('Item details updated successfully.')
      cancelEdit()
      loadData()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section>
      <h1>Shop Items</h1>
      {message && <div className="card success">{message}</div>}
      {error && <div className="card error">{error}</div>}

      {!shop?._id && (
        <div className="card">
          <p>Create your shop before adding menu items.</p>
          <Link className="btn" to="/shop-dashboard">
            Go to Shop Dashboard
          </Link>
        </div>
      )}

      <div className="grid two-col">
        <form className="card form" onSubmit={addMenuItem}>
          <h3>Add menu item</h3>
          <input
            value={itemForm.name}
            onChange={(event) => setItemForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Item name"
            required
          />
          <textarea
            value={itemForm.description}
            onChange={(event) => setItemForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
          />
          <input
            type="number"
            min="1"
            value={itemForm.price}
            onChange={(event) => setItemForm((prev) => ({ ...prev, price: event.target.value }))}
            placeholder="Price"
            required
          />
          <input
            value={itemForm.category}
            onChange={(event) => setItemForm((prev) => ({ ...prev, category: event.target.value }))}
            placeholder="Category"
          />
          <input
            type="number"
            min="0"
            value={itemForm.stock}
            onChange={(event) => setItemForm((prev) => ({ ...prev, stock: event.target.value }))}
            placeholder="Stock"
          />
          <input type="file" onChange={(event) => setItemImage(event.target.files?.[0] || null)} />
          <button className="btn" type="submit" disabled={!shop?._id}>
            Add item
          </button>
        </form>

        <article className="card">
          <h3>Current menu items</h3>
          <div className="stack">
            {menuItems.map((item) => (
              <div className="card sub-card item-detail-card" key={item._id}>
                <div className="item-detail-head">
                  <h4>{item.name}</h4>
                  <span className={item.isAvailable ? 'status-open' : 'status-closed'}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="item-detail-grid">
                  <img
                    className="item-thumb"
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                    alt={item.name}
                  />
                  <div className="stack">
                    <p><strong>Price:</strong> Rs {item.price}</p>
                    <p><strong>Category:</strong> {item.category || 'General'}</p>
                    <p><strong>Stock:</strong> {item.stock ?? 0}</p>
                    <p><strong>Description:</strong> {item.description || 'No description provided.'}</p>
                  </div>
                </div>

                <div className="row wrap-row">
                  <button className="btn btn-soft" type="button" onClick={() => toggleItem(item._id)}>
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  {editingItemId !== item._id && (
                    <button className="btn btn-soft" type="button" onClick={() => startEdit(item)}>
                      Edit details
                    </button>
                  )}
                </div>

                {editingItemId === item._id && (
                  <div className="stack edit-box">
                    <input
                      value={editForm.name}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                      placeholder="Item name"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Description"
                    />
                    <input
                      type="number"
                      min="1"
                      value={editForm.price}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
                      placeholder="Price"
                    />
                    <input
                      value={editForm.category}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                      placeholder="Category"
                    />
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, stock: event.target.value }))}
                      placeholder="Stock"
                    />
                    <input type="file" onChange={(event) => setEditImage(event.target.files?.[0] || null)} />
                    <div className="row">
                      <button className="btn" type="button" onClick={() => saveEdit(item._id)}>
                        Save changes
                      </button>
                      <button className="btn btn-danger" type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {menuItems.length === 0 && <p>No menu items yet.</p>}
          </div>
        </article>
      </div>
    </section>
  )
}
