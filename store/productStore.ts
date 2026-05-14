import { create } from 'zustand';
import type { ProductoConConteo } from '@/types';
import { getApiService } from '@/services';

interface ProductState {
  productos: ProductoConConteo[];
  searchQuery: string;
  isLoading: boolean;
  fetchProductos: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  getFilteredProductos: () => ProductoConConteo[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  productos: [],
  searchQuery: '',
  isLoading: false,

  fetchProductos: async () => {
    set({ isLoading: true });
    try {
      const api = getApiService();
      const productos = await api.getProductos();
      set({ productos, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  getFilteredProductos: () => {
    const { productos, searchQuery } = get();
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) || p.numeroBarras.includes(searchQuery)
    );
  },
}));
