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
      className={`shop-toggle ${isOpen ? 'shop-open' : 'shop-closed'}`}
      onClick={handleToggle}
      disabled={saving}
      title={isOpen ? 'Customers can place orders' : 'Customers cannot place orders'}
    >
      <span className="dot" />
      {saving ? 'Updating...' : isOpen ? 'Shop Open' : 'Shop Closed'}
    </button>
  )
}
