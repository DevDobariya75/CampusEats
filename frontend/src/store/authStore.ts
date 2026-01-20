import { create } from 'zustand';
import type { Role } from '../types/api';

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const LS_TOKEN = 'campuseats.token';
const LS_USER = 'campuseats.user';

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(LS_TOKEN),
  user: (() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  })(),
  setSession: (token, user) => {
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_USER, JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    set({ token: null, user: null });
  }
}));

