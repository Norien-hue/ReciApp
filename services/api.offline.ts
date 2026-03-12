// Implementación offline/mock del servicio API
// Todos los métodos devuelven datos filler con delays simulados

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

const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export class OfflineApiService implements ApiService {
  async checkConnection(): Promise<boolean> {
    await delay(500);
    return false; // Siempre offline
  }

  async login(_nombre: string, _password: string): Promise<AuthResponse> {
    await delay(400);
    return {
      token: MOCK_TOKEN,
      user: { ...MOCK_USER },
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
    return [...MOCK_PRODUCTOS];
  }

  async getProducto(
    tipo: string,
    numeroBarras: string
  ): Promise<ProductoConConteo | null> {
    await delay();
    return (
      MOCK_PRODUCTOS.find(
        (p) => p.tipo === tipo && p.numeroBarras === numeroBarras
      ) ?? null
    );
  }

  async searchProductos(query: string): Promise<ProductoConConteo[]> {
    await delay();
    const q = query.toLowerCase();
    return MOCK_PRODUCTOS.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) || p.numeroBarras.includes(query)
    );
  }

  async getHistorial(_idUsuario: number): Promise<HistorialItem[]> {
    await delay();
    return [...MOCK_HISTORIAL];
  }

  async getProfile(_idUsuario: number): Promise<Usuario> {
    await delay();
    return { ...MOCK_USER };
  }

  async updateNombre(
    _idUsuario: number,
    nuevoNombre: string,
    _passwordActual: string
  ): Promise<Usuario> {
    await delay();
    return { ...MOCK_USER, nombre: nuevoNombre };
  }

  async updatePassword(
    _idUsuario: number,
    _passwordActual: string,
    _passwordNueva: string
  ): Promise<void> {
    await delay();
    // Simulación: siempre exitosa
  }

  async deleteAccount(
    _idUsuario: number,
    _passwordActual: string
  ): Promise<void> {
    await delay();
    // Simulación: siempre exitosa
  }
}
