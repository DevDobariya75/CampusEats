import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, Star, AlertCircle, ArrowLeft } from 'lucide-react'
import { addressesApi } from '../api/services'
import { PageTransition, LoadingSpinner } from '../components/ui/Button'
import { useNavigate } from 'react-router-dom'

const initialForm = {
  label: '',
  addressLine: '',
  isDefault: false,
}

export default function AddressesPage() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadAddresses = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await addressesApi.list()
      setAddresses(Array.isArray(response.data) ? response.data : response.data?.addresses || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setSaving(true)
      await addressesApi.create(form)
      setForm(initialForm)
      await loadAddresses()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (addressId) => {
    await addressesApi.setDefault(addressId)
    await loadAddresses()
  }

  const removeAddress = async (addressId) => {
    await addressesApi.remove(addressId)
    await loadAddresses()
  }

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-slate-50 text-slate-900 dark:bg-[#060B13] dark:text-[#f8fafc] transition-colors duration-300">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(249,115,22,0.15),transparent_38%),radial-gradient(circle_at_82%_66%,rgba(249,115,22,0.1),transparent_40%)]" />

        <div className="relative py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 flex items-center gap-4"
            >
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 border border-slate-300 dark:border-white/20 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white" />
              </button>
              <div>
                <h1 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-2">
                  Delivery Addresses
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-semibold tracking-wider text-sm uppercase">Manage your delivery locations</p>
              </div>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <p className="text-red-400 font-bold">{error}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bento-card p-8 h-fit bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl"
              >
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Plus className="w-5 h-5 text-orange-400" />
                  Add New Address
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      value={form.label}
                      onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
                      placeholder="Label (e.g., Home, Office)"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold"
                    />
                  </div>
                  <div>
                    <textarea
                      value={form.addressLine}
                      onChange={(event) => setForm((prev) => ({ ...prev, addressLine: event.target.value }))}
                      placeholder="Full address"
                      required
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-bold resize-none h-24"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(event) => setForm((prev) => ({ ...prev, isDefault: event.target.checked }))}
                      className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-widest">Set as default</span>
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={saving}
                    className="w-full mt-4 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm disabled:opacity-50"
                  >
                    {saving ? <LoadingSpinner size="sm" /> : 'Save Address'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Addresses List Section */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center p-12"><LoadingSpinner size="lg" /></div>
                ) : addresses.length === 0 ? (
                  <div className="bento-card p-12 text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl">
                    <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">No addresses saved yet</p>
                  </div>
                ) : (
                  addresses.map((address, idx) => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      key={address._id}
                      className={`bento-card p-6 bg-white dark:bg-white/5 border rounded-3xl ${address.isDefault ? 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-slate-200 dark:border-white/10'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          {address.label || 'Address'}
                          {address.isDefault && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[10px] uppercase font-black tracking-widest rounded-full border border-orange-500/30">
                              Default
                            </span>
                          )}
                        </h3>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{address.addressLine}</p>
                      
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefault(address._id)}
                            className="flex-1 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-slate-200 dark:border-white/10 flex justify-center items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => removeAddress(address._id)}
                          className={`${address.isDefault ? 'w-full' : 'w-auto px-4'} py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-red-500/20 flex justify-center items-center gap-2`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}

