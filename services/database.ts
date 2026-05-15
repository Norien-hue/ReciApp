// ============================================================
// services/database.ts
// ============================================================
// Funciones wrapper que llaman al API backend y devuelven
// respuestas con formato { success, data/error } para las
// pantallas de la app.
// ============================================================

import { getRealApiService } from './index';

const api = getRealApiService();

// ── Helpers ──────────────────────────────────────────────────

function withToken(token: string) {
  api.setToken(token);
}

// ── Usuario / Perfil ────────────────────────────────────────

export async function getUsuario(
  idUsuario: number,
  token: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    withToken(token);
    const user = await api.getProfile(idUsuario);
    return { success: true, user };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Historial de reciclaje ──────────────────────────────────

export async function getReciclajeUsuario(
  idUsuario: number,
  token: string
): Promise<{ success: boolean; reciclajes?: any[]; error?: string }> {
  try {
    withToken(token);
    const reciclajes = await api.getHistorial(idUsuario);
    return { success: true, reciclajes };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Productos ───────────────────────────────────────────────

export async function getProductos(
  token: string
): Promise<{ success: boolean; productos?: any[]; error?: string }> {
  try {
    withToken(token);
    const productos = await api.getProductos();
    return { success: true, productos };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Cambiar nombre ──────────────────────────────────────────

export async function cambiarNombre(
  idUsuario: number,
  nuevoNombre: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    withToken(token);
    // updateNombre necesita passwordActual; la pantalla de ajustes
    // ya valida la contrasena en su propio formulario, pero la API
    // de cambio de nombre no la exige (PUT /usuarios/:id/nombre).
    // Pasamos cadena vacia porque la firma lo requiere.
    await api.updateNombre(idUsuario, nuevoNombre, '');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Cambiar contrasena ──────────────────────────────────────

export async function cambiarPassword(
  idUsuario: number,
  passwordActual: string,
  passwordNueva: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    withToken(token);
    await api.updatePassword(idUsuario, passwordActual, passwordNueva);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Borrar cuenta ───────────────────────────────────────────

export async function borrarCuenta(
  idUsuario: number,
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    withToken(token);
    // deleteAccount requiere passwordActual pero la pantalla de
    // borrado no la pide — se envia cadena vacia para que la API
    // decida si lo acepta o no.
    await api.deleteAccount(idUsuario, '');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
