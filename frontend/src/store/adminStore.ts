import { create } from 'zustand';
import { http } from '../api/http';

interface AdminStats {
  totalUsers: number;
  totalShops: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
  usersByRole: Record<string, number>;
}

interface AdminStore {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  createShopkeeper: (data: any) => Promise<any>;
  createDeliveryPartner: (data: any) => Promise<any>;
  getUsers: (params?: any) => Promise<any>;
  getShops: (params?: any) => Promise<any>;
  toggleShopStatus: (shopId: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  stats: null,
  loading: false,
  error: null,
  
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await http.get('/api/admin/stats');
      set({ stats: response.data.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createShopkeeper: async (data) => {
    try {
      const response = await http.post('/api/admin/create-shopkeeper', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  createDeliveryPartner: async (data) => {
    try {
      const response = await http.post('/api/admin/create-delivery-partner', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getUsers: async (params) => {
    try {
      const response = await http.get('/api/admin/users', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  getShops: async (params) => {
    try {
      const response = await http.get('/api/admin/shops', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  toggleShopStatus: async (shopId) => {
    try {
      await http.put(`/api/admin/shops/${shopId}/toggle-status`);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}));
