import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Image as ImageIcon, Store, AlertCircle, CheckCircle, PackageSearch, Save, X } from 'lucide-react'
import { menuApi, shopsApi } from '../api/services'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { formatPrice } from '../utils/helpers'

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
  const [previewUrl, setPreviewUrl] = useState(null)
  
  const [editingItemId, setEditingItemId] = useState('')
  const [editForm, setEditForm] = useState(itemFormState)
  const [editImage, setEditImage] = useState(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState(null)
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEdit) {
          setEditImage(file)
          setEditPreviewUrl(reader.result)
        } else {
          setItemImage(file)
          setPreviewUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addMenuItem = async (event) => {
    event.preventDefault()
    if (!shop?._id) return

    try {
      setSubmitting(true)
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
      setPreviewUrl(null)
      setMessage('Menu item added successfully!')
      setTimeout(() => setMessage(''), 3000)
      loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleItem = async (itemId) => {
    if (!shop?._id) return
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
    setEditPreviewUrl(item.imageUrl || null)
  }

  const cancelEdit = () => {
    setEditingItemId('')
    setEditForm(itemFormState)
    setEditImage(null)
    setEditPreviewUrl(null)
  }

  const saveEdit = async (itemId) => {
    if (!shop?._id) return
    try {
      setSubmitting(true)
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
      setTimeout(() => setMessage(''), 3000)
      cancelEdit()
      loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)] hidden dark:block" />

        <div className="relative z-10 py-12 px-4 md:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <Store className="w-6 h-6 text-sky-500" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display tracking-wide text-slate-900 dark:text-white">
              Menu Management
            </h1>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">{message}</p>
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : !shop?._id ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto">
              <Store className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Create Shop First</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">You need to set up your shop profile before you can start adding menu items.</p>
              <Link to="/shop-dashboard" className="px-8 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:bg-sky-400 transition-all uppercase tracking-widest text-sm inline-flex items-center gap-2">
                <Store className="w-4 h-4" />
                Go to Shop Dashboard
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* === ADD NEW ITEM FORM === */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none rounded-3xl p-6">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Plus className="w-5 h-5 text-sky-500" />
                    Add Menu Item
                  </h2>
                  
                  <form onSubmit={addMenuItem} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Image</label>
                      <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl hover:border-sky-400 cursor-pointer transition-all bg-slate-50 dark:bg-white/5 overflow-hidden group">
                        {previewUrl ? (
                          <div className="relative w-full h-full">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit2 className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                            <span className="text-xs font-bold text-slate-400">Click to upload image</span>
                          </div>
                        )}
                        <input type="file" onChange={(e) => handleFileChange(e, false)} accept="image/*" className="hidden" />
                      </label>
                    </div>

                    {/* Basic Info */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Item Name</label>
                      <input value={itemForm.name} onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g. Classic Burger" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all font-bold text-sm" required />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                      <textarea value={itemForm.description} onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))} placeholder="A brief description of this dish..." rows="3" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all text-sm resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Price (₹)</label>
                        <input type="number" min="1" value={itemForm.price} onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))} placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all font-bold text-sm" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Stock</label>
                        <input type="number" min="0" value={itemForm.stock} onChange={(e) => setItemForm(prev => ({ ...prev, stock: e.target.value }))} placeholder="10" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all font-bold text-sm" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Category</label>
                      <input value={itemForm.category} onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))} placeholder="e.g. Beverages" className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-sky-500 transition-all font-bold text-sm" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className="w-full py-4 mt-4 bg-sky-500 text-white font-black rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.4)] hover:bg-sky-400 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                      {submitting ? <><LoadingSpinner size="sm" /> Adding...</> : <><Plus className="w-4 h-4" /> Add Item</>}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* === MENU ITEMS LIST === */}
              <div className="lg:col-span-8">
                {menuItems.length === 0 ? (
                  <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                    <PackageSearch className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Menu is Empty</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Use the panel on the left to start adding delicious items to your shop's menu!</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {menuItems.map((item, idx) => (
                      <motion.div 
                        key={item._id} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                        className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:border-sky-500/30 hover:shadow-[0_8px_30px_rgba(14,165,233,0.1)] transition-all group flex flex-col"
                      >
                        {editingItemId === item._id ? (
                          // === EDIT MODE ===
                          <div className="p-5 flex flex-col h-full bg-slate-50 dark:bg-white/5">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest flex items-center justify-between">
                              Edit Item
                              <button onClick={cancelEdit} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 transition-colors"><X className="w-4 h-4" /></button>
                            </h3>
                            <div className="space-y-3 flex-1">
                               <label className="flex items-center justify-center w-full h-24 border border-dashed border-slate-300 dark:border-white/20 rounded-xl hover:border-sky-400 cursor-pointer overflow-hidden bg-white dark:bg-black/20">
                                {editPreviewUrl ? (
                                  <img src={editPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-slate-400">Change Image</span>
                                )}
                                <input type="file" onChange={(e) => handleFileChange(e, true)} accept="image/*" className="hidden" />
                              </label>
                              <input value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Item Name" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500 font-bold" />
                              <textarea value={editForm.description} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows="2" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500 resize-none"></textarea>
                              <div className="grid grid-cols-2 gap-2">
                                <input type="number" value={editForm.price} onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))} placeholder="Price" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500 font-bold" />
                                <input type="number" value={editForm.stock} onChange={(e) => setEditForm(prev => ({ ...prev, stock: e.target.value }))} placeholder="Stock" className="w-full px-3 py-2 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-sky-500 font-bold" />
                              </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/10">
                              <motion.button onClick={() => saveEdit(item._id)} disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-2.5 bg-sky-500 text-white font-black rounded-lg hover:bg-sky-400 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                                {submitting ? <LoadingSpinner size="sm" /> : <><Save className="w-4 h-4" /> Save</>}
                              </motion.button>
                            </div>
                          </div>
                        ) : (
                          // === VIEW MODE ===
                          <>
                            <div className="relative h-48 sm:h-56 bg-slate-100 dark:bg-white/5 overflow-hidden">
                              <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              
                              <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg backdrop-blur-md shadow-sm border ${item.isAvailable ? 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30'}`}>
                                  {item.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col relative bg-white dark:bg-[#111827]">
                              <div className="flex justify-between items-start gap-4 mb-2">
                                <div>
                                  <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                                  <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-500/20">{item.category}</span>
                                </div>
                                <span className="text-xl font-black text-sky-500 whitespace-nowrap">{formatPrice(item.price)}</span>
                              </div>
                              
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                                {item.description || 'No description provided.'}
                              </p>

                              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                                <span>Stock: {item.stock ?? 0}</span>
                              </div>

                              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
                                <button
                                  onClick={() => toggleItem(item._id)}
                                  className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${item.isAvailable ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10' : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/20'}`}
                                >
                                  {item.isAvailable ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => startEdit(item)}
                                  className="flex-1 py-2 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors flex items-center justify-center gap-1.5"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Edit
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}

