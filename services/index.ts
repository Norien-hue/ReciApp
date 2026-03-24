// Barrel file - exporta la implementacion activa del servicio API
import type { ApiService } from './api';
import { OfflineApiService } from './api.offline';
import { RealApiService } from './api.client';

// Instancia real (intenta conectar al backend)
const _realInstance = new RealApiService();

// Instancia offline (datos mock)
const _offlineInstance = new OfflineApiService();

// Por defecto usa la real. Si checkConnection falla, la app
// mostrara el modal y usara datos de cache/mock igualmente.
let _useReal = true;

export function setUseRealApi(value: boolean) {
  _useReal = value;
}

export function getApiService(): ApiService {
  return _useReal ? _realInstance : _offlineInstance;
}

export function getRealApiService(): RealApiService {
  return _realInstance;
}

export type { ApiService } from './api';
