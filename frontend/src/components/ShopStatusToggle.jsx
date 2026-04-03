import { useEffect, useState } from 'react'
import { shopsApi } from '../api/services'

export default function ShopStatusToggle() {
  const [shopId, setShopId] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadShop = async () => {
      try {
        const response = await shopsApi.getMine()
        const shop = response.data

        if (mounted && shop?._id) {
          setShopId(shop._id)
          setIsOpen(Boolean(shop.isOpen))
        }
      } catch {
        if (mounted) {
          setShopId('')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadShop()

    return () => {
      mounted = false
    }
  }, [])

  const handleToggle = async () => {
    if (!shopId || saving) {
      return
    }

    try {
      setSaving(true)
      const response = await shopsApi.toggle(shopId)
      const next = response.data?.isOpen
      if (typeof next === 'boolean') {
        setIsOpen(next)
      } else {
        setIsOpen((prev) => !prev)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading || !shopId) {
    return null
  }

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold transition-colors ${
        isOpen
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
          : 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
      }`}
      onClick={handleToggle}
      disabled={saving}
      title={isOpen ? 'Customers can place orders' : 'Customers cannot place orders'}
    >
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          isOpen ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
      {saving ? 'Updating...' : isOpen ? 'Open Shop' : 'Close Shop'}
    </button>
  )
}
