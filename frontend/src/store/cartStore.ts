import { create } from 'zustand';
import type { MenuItem, Shop } from '../types/api';

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

type CartState = {
  shop: Shop | null;
  items: CartItem[];
  setShop: (shop: Shop) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  setQty: (menuItemId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  shop: null,
  items: [],
  setShop: (shop) => set({ shop, items: [] }),
  addItem: (menuItem) => {
    const { items, shop } = get();
    // If cart is from a different shop, replace cart.
    if (shop && shop._id !== menuItem.shop) {
      return;
    }
    const existing = items.find((i) => i.menuItem._id === menuItem._id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.menuItem._id === menuItem._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      });
      return;
    }
    set({ items: [...items, { menuItem, quantity: 1 }] });
  },
  removeItem: (menuItemId) => {
    const { items } = get();
    set({ items: items.filter((i) => i.menuItem._id !== menuItemId) });
  },
  setQty: (menuItemId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      set({ items: items.filter((i) => i.menuItem._id !== menuItemId) });
      return;
    }
    set({
      items: items.map((i) =>
        i.menuItem._id === menuItemId ? { ...i, quantity } : i
      )
    });
  },
  clear: () => set({ shop: null, items: [] })
}));

