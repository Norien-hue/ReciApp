// Interfaz del servicio API - contrato que deben cumplir todas las implementaciones
import type {
  AuthResponse,
  Usuario,
  ProductoConConteo,
  HistorialItem,
} from '@/types';

export interface ApiService {
  // Conexión
  checkConnection(): Promise<boolean>;

  // Autenticación
  login(nombre: string, password: string): Promise<AuthResponse>;
  register(nombre: string, password: string): Promise<AuthResponse>;

  // Productos
  getProductos(): Promise<ProductoConConteo[]>;
  getProducto(
    tipo: string,
    numeroBarras: string
  ): Promise<ProductoConConteo | null>;
  searchProductos(query: string): Promise<ProductoConConteo[]>;

  // Historial de reciclaje
  getHistorial(idUsuario: number): Promise<HistorialItem[]>;

  // Perfil
  getProfile(idUsuario: number): Promise<Usuario>;
  updateNombre(
    idUsuario: number,
    nuevoNombre: string,
    passwordActual: string
  ): Promise<Usuario>;
  updatePassword(
    idUsuario: number,
    passwordActual: string,
    passwordNueva: string
  ): Promise<void>;
  deleteAccount(idUsuario: number, passwordActual: string): Promise<void>;
}
