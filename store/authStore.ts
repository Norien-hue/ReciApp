import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Usuario } from '@/types';
import { getApiService } from '@/services';

const TOKEN_KEY = 'reci_app_token';
const USER_KEY = 'reci_app_user';

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isLoading: boolean;
  login: (nombre: string, password: string) => Promise<void>;
  register: (nombre: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateUser: (user: Usuario) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true, // true mientras comprueba AsyncStorage al inicio

  login: async (nombre: string, password: string) => {
    const api = getApiService();
    const response = await api.login(nombre, password);
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    set({ token: response.token, user: response.user });
  },

  register: async (nombre: string, password: string) => {
    const api = getApiService();
    const response = await api.register(nombre, password);
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    set({ token: response.token, user: response.user });
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (token && userJson) {
        const user = JSON.parse(userJson) as Usuario;
        set({ token, user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: (user: Usuario) => {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
