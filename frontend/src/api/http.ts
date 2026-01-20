import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const baseURL =
  import.meta.env.VITE_API_URL?.toString().trim() || 'http://localhost:5000';

export const http = axios.create({
  baseURL,
  withCredentials: false
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // If token is invalid/expired, drop session and send user to login.
    if (err?.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

