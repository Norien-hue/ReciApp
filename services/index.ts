// Barrel file - exporta la implementación activa del servicio API
import type { ApiService } from './api';
import { OfflineApiService } from './api.offline';
// import { RealApiService } from './api.client'; // Descomentar cuando exista el backend

let _instance: ApiService | null = null;

export function getApiService(): ApiService {
  if (!_instance) {
    // Por ahora siempre offline. Cuando el backend esté listo,
    // usar RealApiService y comprobar connectionStore.isOnline
    _instance = new OfflineApiService();
  }
  return _instance;
}

export type { ApiService } from './api';
