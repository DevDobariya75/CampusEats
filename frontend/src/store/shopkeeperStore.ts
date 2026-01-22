import { create } from 'zustand';
import { http } from '../api/http';

interface ShopkeeperStore {
  loading: boolean;
  error: string | null;
  dashboard: any;
  orders: any[];
  menuItems: any[];
  sales: any;
  
  fetchDashboard: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  fetchOrders: (status?: string) => Promise<void>;
  fetchSales: () => Promise<void>;
  addMenuItem: (data: any) => Promise<any>;
  updateMenuItem: (id: string, data: any) => Promise<any>;
  deleteMenuItem: (id: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
}

export const useShopkeeperStore = create<ShopkeeperStore>((set) => ({
  loading: false,
  error: null,
  dashboard: null,
  orders: [],
  menuItems: [],
  sales: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const response = await http.get('/api/shopkeeper/dashboard');
      set({ dashboard: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMenuItems: async () => {
    try {
      const response = await http.get('/api/shopkeeper/menu-items');
      set({ menuItems: response.data.data, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchOrders: async (status?: string) => {
    try {
      const response = await http.get('/api/shopkeeper/orders', { params: { status } });
      set({ orders: response.data.data, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchSales: async () => {
    try {
      const response = await http.get('/api/shopkeeper/sales');
      set({ sales: response.data.data, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addMenuItem: async (data) => {
    try {
      const response = await http.post('/api/shopkeeper/menu-items', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateMenuItem: async (id, data) => {
    try {
      const response = await http.put(`/api/shopkeeper/menu-items/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      await http.delete(`/api/shopkeeper/menu-items/${id}`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await http.put(`/api/shopkeeper/orders/${orderId}/status`, { status });
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}));
