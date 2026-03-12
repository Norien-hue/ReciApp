import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Usuario } from '@/types';
import { getApiService } from '@/services';
// MOCK_TOKEN y MOCK_USER se usan en OfflineApiService, no aquí directamente

const TOKEN_KEY = 'reci_app_token';
const USER_KEY = 'reci_app_user';
const PRODUCTOS_KEY = 'reci_app_productos';
const HISTORIAL_KEY = 'reci_app_historial';

// Todas las claves que usa la app — para limpiar al cerrar sesión
const ALL_STORAGE_KEYS = [TOKEN_KEY, USER_KEY, PRODUCTOS_KEY, HISTORIAL_KEY];

export const GUEST_TOKEN = 'guest-offline-token';

const GUEST_USER: Usuario = {
  id: 0,
  nombre: 'Invitado',
  permisos: 'cliente',
  emisionesReducidas: 0,
  tap: null,
};

interface AuthState {
  token: string | null;
  user: Usuario | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (nombre: string, password: string) => Promise<void>;
  register: (nombre: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  updateUser: (user: Usuario) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true, // true mientras comprueba AsyncStorage al inicio
  isGuest: false,

  login: async (nombre: string, password: string) => {
    const api = getApiService();
    const response = await api.login(nombre, password);

    // Guardar token y usuario
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

    // Pre-cachear productos e historial para modo offline futuro
    try {
      const [productos, historial] = await Promise.all([
        api.getProductos(),
        api.getHistorial(response.user.id),
      ]);
      await AsyncStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
      await AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify(historial));
    } catch {
      // Si falla el pre-cacheo, no bloqueamos el login
    }

    set({ token: response.token, user: response.user, isGuest: false });
  },

  register: async (nombre: string, password: string) => {
    const api = getApiService();
    const response = await api.register(nombre, password);

    // Guardar token y usuario
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));

    // Pre-cachear productos (historial estará vacío al registrarse)
    try {
      const productos = await api.getProductos();
      await AsyncStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
      await AsyncStorage.setItem(HISTORIAL_KEY, JSON.stringify([]));
    } catch {
      // Si falla el pre-cacheo, no bloqueamos el registro
    }

    set({ token: response.token, user: response.user, isGuest: false });
  },

  loginAsGuest: () => {
    // No se persiste en AsyncStorage — es solo para la sesión actual
    set({
      token: GUEST_TOKEN,
      user: { ...GUEST_USER },
      isGuest: true,
      isLoading: false,
    });
  },

  logout: async () => {
    // Borrar TODAS las claves de la app del AsyncStorage
    await AsyncStorage.multiRemove(ALL_STORAGE_KEYS);
    set({ token: null, user: null, isGuest: false });
  },

  /**
   * Intenta restaurar sesión desde AsyncStorage.
   * @returns true si se encontró una sesión guardada, false si no.
   */
  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const userJson = await AsyncStorage.getItem(USER_KEY);
      if (token && userJson) {
        const user = JSON.parse(userJson) as Usuario;
        set({ token, user, isLoading: false, isGuest: false });
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  updateUser: (user: Usuario) => {
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
