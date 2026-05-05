// Implementación offline del servicio API
// Lee datos cacheados en AsyncStorage; si no hay caché, usa datos mock como fallback

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiService } from './api';
import type {
  AuthResponse,
  Usuario,
  ProductoConConteo,
  HistorialItem,
} from '@/types';
import {
  MOCK_TOKEN,
  MOCK_USER,
  MOCK_PRODUCTOS,
  MOCK_HISTORIAL,
} from '@/data/mockData';

const TOKEN_KEY = 'reci_app_token';
const USER_KEY = 'reci_app_user';
const PRODUCTOS_KEY = 'reci_app_productos';
const HISTORIAL_KEY = 'reci_app_historial';

const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function getCached<T>(key: string): Promise<T | null> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (json) return JSON.parse(json) as T;
  } catch {}
  return null;
}

export class OfflineApiService implements ApiService {
  async checkConnection(): Promise<boolean> {
    await delay(500);
    return false;
  }

  async login(_nombre: string, _password: string): Promise<AuthResponse> {
    await delay(400);
    const user = await getCached<Usuario>(USER_KEY);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return {
      token: token ?? MOCK_TOKEN,
      user: user ?? { ...MOCK_USER },
    };
  }

  async register(_nombre: string, _password: string): Promise<AuthResponse> {
    await delay(400);
    return {
      token: MOCK_TOKEN,
      user: { ...MOCK_USER },
    };
  }

  async getProductos(): Promise<ProductoConConteo[]> {
    await delay();
    const cached = await getCached<ProductoConConteo[]>(PRODUCTOS_KEY);
    return cached ?? [...MOCK_PRODUCTOS];
  }

  async getProducto(
    tipo: string,
    numeroBarras: string
  ): Promise<ProductoConConteo | null> {
    await delay();
    const productos = await this.getProductos();
    return (
      productos.find(
        (p) => p.tipo === tipo && p.numeroBarras === numeroBarras
      ) ?? null
    );
  }

  async searchProductos(query: string): Promise<ProductoConConteo[]> {
    await delay();
    const productos = await this.getProductos();
    const q = query.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) || p.numeroBarras.includes(query)
    );
  }

  async getHistorial(_idUsuario: number): Promise<HistorialItem[]> {
    await delay();
    const cached = await getCached<HistorialItem[]>(HISTORIAL_KEY);
    return cached ?? [...MOCK_HISTORIAL];
  }

  async getProfile(_idUsuario: number): Promise<Usuario> {
    await delay();
    const cached = await getCached<Usuario>(USER_KEY);
    return cached ?? { ...MOCK_USER };
  }

  async updateNombre(
    _idUsuario: number,
    nuevoNombre: string,
    _passwordActual: string
  ): Promise<Usuario> {
    await delay();
    const cached = await getCached<Usuario>(USER_KEY);
    const updated = { ...(cached ?? MOCK_USER), nombre: nuevoNombre };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  }

  async updatePassword(
    _idUsuario: number,
    _passwordActual: string,
    _passwordNueva: string
  ): Promise<void> {
    await delay();
  }

  async deleteAccount(
    _idUsuario: number,
    _passwordActual: string
  ): Promise<void> {
    await delay();
  }
}
