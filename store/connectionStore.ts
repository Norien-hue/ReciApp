import { create } from 'zustand';

interface ConnectionState {
  isOnline: boolean;
  hasChecked: boolean;
  setOnline: (online: boolean) => void;
  setHasChecked: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  isOnline: false,
  hasChecked: false,
  setOnline: (online) => set({ isOnline: online }),
  setHasChecked: () => set({ hasChecked: true }),
}));
