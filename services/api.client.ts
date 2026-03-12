// Stub para la futura implementación real del servicio API
// Cuando el backend esté listo, reemplazar los cuerpos con fetch() a la API REST

import type { ApiService } from './api';
import type {
  AuthResponse,
  Usuario,
  ProductoConConteo,
  HistorialItem,
} from '@/types';

const API_BASE_URL = 'http://localhost:3000/api'; // Cambiar cuando exista el backend

export class RealApiService implements ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async login(nombre: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, password }),
    });
    if (!res.ok) throw new Error('Error al iniciar sesión');
    return res.json();
  }

  async register(nombre: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, password }),
    });
    if (!res.ok) throw new Error('Error al registrarse');
    return res.json();
  }

  async getProductos(): Promise<ProductoConConteo[]> {
    const res = await fetch(`${API_BASE_URL}/productos`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener productos');
    return res.json();
  }

  async getProducto(
    tipo: string,
    numeroBarras: string
  ): Promise<ProductoConConteo | null> {
    const res = await fetch(
      `${API_BASE_URL}/productos/${tipo}/${numeroBarras}`,
      { headers: this.getHeaders() }
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Error al obtener producto');
    return res.json();
  }

  async searchProductos(query: string): Promise<ProductoConConteo[]> {
    const res = await fetch(
      `${API_BASE_URL}/productos/search?q=${encodeURIComponent(query)}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) throw new Error('Error al buscar productos');
    return res.json();
  }

  async getHistorial(idUsuario: number): Promise<HistorialItem[]> {
    const res = await fetch(`${API_BASE_URL}/recicla/${idUsuario}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener historial');
    return res.json();
  }

  async getProfile(idUsuario: number): Promise<Usuario> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener perfil');
    return res.json();
  }

  async updateNombre(
    idUsuario: number,
    nuevoNombre: string,
    passwordActual: string
  ): Promise<Usuario> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}/nombre`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ nuevoNombre, passwordActual }),
    });
    if (!res.ok) throw new Error('Error al actualizar nombre');
    return res.json();
  }

  async updatePassword(
    idUsuario: number,
    passwordActual: string,
    passwordNueva: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}/password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ passwordActual, passwordNueva }),
    });
    if (!res.ok) throw new Error('Error al cambiar contraseña');
  }

  async deleteAccount(
    idUsuario: number,
    passwordActual: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ passwordActual }),
    });
    if (!res.ok) throw new Error('Error al eliminar cuenta');
  }
}
