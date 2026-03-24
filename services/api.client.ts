// Implementacion real del servicio API — conecta al backend Express

import type { ApiService } from './api';
import type {
  AuthResponse,
  Usuario,
  ProductoConConteo,
  HistorialItem,
} from '@/types';

const API_BASE_URL = 'http://localhost:3000/api';

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

  private async handleError(res: Response, fallback: string): Promise<never> {
    let msg = fallback;
    try {
      const body = await res.json();
      if (body.error) msg = body.error;
    } catch { /* no-op */ }
    throw new Error(msg);
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
    const res = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, password }),
    });
    if (!res.ok) await this.handleError(res, 'Error al iniciar sesion');
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  async register(nombre: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/usuarios/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nombre, password }),
    });
    if (!res.ok) await this.handleError(res, 'Error al registrarse');
    const data = await res.json();
    this.token = data.token;
    return data;
  }

  async getProductos(): Promise<ProductoConConteo[]> {
    const res = await fetch(`${API_BASE_URL}/productos`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) await this.handleError(res, 'Error al obtener productos');
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
    if (!res.ok) await this.handleError(res, 'Error al obtener producto');
    return res.json();
  }

  async searchProductos(query: string): Promise<ProductoConConteo[]> {
    const res = await fetch(
      `${API_BASE_URL}/productos/search?q=${encodeURIComponent(query)}`,
      { headers: this.getHeaders() }
    );
    if (!res.ok) await this.handleError(res, 'Error al buscar productos');
    return res.json();
  }

  async getHistorial(idUsuario: number): Promise<HistorialItem[]> {
    const res = await fetch(`${API_BASE_URL}/historial/${idUsuario}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) await this.handleError(res, 'Error al obtener historial');
    return res.json();
  }

  async getProfile(idUsuario: number): Promise<Usuario> {
    const res = await fetch(`${API_BASE_URL}/usuarios/profile/${idUsuario}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) await this.handleError(res, 'Error al obtener perfil');
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
    if (!res.ok) await this.handleError(res, 'Error al actualizar nombre');
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
    if (!res.ok) await this.handleError(res, 'Error al cambiar contrasena');
  }

  async deleteAccount(
    idUsuario: number,
    passwordActual: string
  ): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ password: passwordActual }),
    });
    if (!res.ok) await this.handleError(res, 'Error al eliminar cuenta');
  }
}
