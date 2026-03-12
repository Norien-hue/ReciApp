import { create } from 'zustand';
import type { HistorialItem } from '@/types';
import { getApiService } from '@/services';

interface RecycleState {
  historial: HistorialItem[];
  isLoading: boolean;
  fetchHistorial: (idUsuario: number) => Promise<void>;
}

export const useRecycleStore = create<RecycleState>((set) => ({
  historial: [],
  isLoading: false,

  fetchHistorial: async (idUsuario: number) => {
    set({ isLoading: true });
    try {
      const api = getApiService();
      const historial = await api.getHistorial(idUsuario);
      set({ historial, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
