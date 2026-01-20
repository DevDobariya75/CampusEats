import { http } from './http';
import type { ApiListSuccess, ApiSuccess, AuthResponse, MenuItem, Order, Shop, User } from '../types/api';

export const api = {
  auth: {
    register: async (payload: { name: string; email: string; password: string; role?: string }) => {
      const { data } = await http.post<AuthResponse>('/api/auth/register', payload);
      return data;
    },
    login: async (payload: { email: string; password: string }) => {
      const { data } = await http.post<AuthResponse>('/api/auth/login', payload);
      return data;
    },
    me: async () => {
      const { data } = await http.get<ApiSuccess<User>>('/api/auth/me');
      return data;
    }
  },
  shops: {
    list: async (params?: { search?: string; campus?: string; page?: number; limit?: number }) => {
      const { data } = await http.get<ApiListSuccess<Shop>>('/api/shops', { params });
      return data;
    },
    get: async (id: string) => {
      const { data } = await http.get<ApiSuccess<Shop>>(`/api/shops/${id}`);
      return data;
    }
  },
  menuItems: {
    byShop: async (shopId: string) => {
      const { data } = await http.get<ApiListSuccess<MenuItem>>(`/api/menu-items/shop/${shopId}`);
      return data;
    }
  },
  orders: {
    create: async (payload: {
      shop: string;
      orderItems: Array<{ menuItem: string; quantity: number; specialInstructions?: string }>;
      paymentMethod: 'card' | 'cash' | 'campus_card' | 'online';
      deliveryAddress?: any;
      specialInstructions?: string;
    }) => {
      const { data } = await http.post<ApiSuccess<Order>>('/api/orders', payload);
      return data;
    },
    list: async () => {
      const { data } = await http.get<ApiListSuccess<Order>>('/api/orders');
      return data;
    },
    getDetails: async (orderId: string) => {
      const { data } = await http.get<ApiSuccess<Order>>(`/api/orders/${orderId}`);
      return data;
    }
  }
};

