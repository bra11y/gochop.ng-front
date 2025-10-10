import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// Simplified type definitions to avoid TypeScript deep instantiation issues
interface Store {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  status: string;
  settings?: any;
  theme?: any;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  emoji?: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  track_inventory: boolean;
  active: boolean;
  slug: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface StoreState {
  // Current store data
  currentStore: Store | null;
  categories: Category[];
  products: Product[];
  
  // Loading states
  isLoading: boolean;
  isCategoriesLoading: boolean;
  isProductsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  setCurrentStore: (store: Store | null) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  setLoading: (loading: boolean) => void;
  setCategoriesLoading: (loading: boolean) => void;
  setProductsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getProductsByCategory: (categoryId: string) => Product[];
  getActiveCategories: () => Category[];
  getActiveProducts: () => Product[];
  
  // Store management
  clearStore: () => void;
  resetState: () => void;
}

const initialState = {
  currentStore: null,
  categories: [],
  products: [],
  isLoading: false,
  isCategoriesLoading: false,
  isProductsLoading: false,
  error: null,
};

export const useStoreStore = create<StoreState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Actions
        setCurrentStore: (store) => set((state) => {
          state.currentStore = store;
          state.error = null;
        }),
        
        setCategories: (categories) => set((state) => {
          state.categories = categories;
          state.isCategoriesLoading = false;
        }),
        
        setProducts: (products) => set((state) => {
          state.products = products;
          state.isProductsLoading = false;
        }),
        
        addProduct: (product) => set((state) => {
          state.products.push(product);
        }),
        
        updateProduct: (productId, updates) => set((state) => {
          const index = state.products.findIndex(p => p.id === productId);
          if (index !== -1) {
            Object.assign(state.products[index], updates);
          }
        }),
        
        removeProduct: (productId) => set((state) => {
          state.products = state.products.filter(p => p.id !== productId);
        }),
        
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setCategoriesLoading: (loading) => set((state) => {
          state.isCategoriesLoading = loading;
        }),
        
        setProductsLoading: (loading) => set((state) => {
          state.isProductsLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        // Computed values
        getProductsByCategory: (categoryId) => {
          const state = get();
          return state.products.filter(p => p.category_id === categoryId && p.active);
        },
        
        getActiveCategories: () => {
          const state = get();
          return state.categories.filter(c => c.active).sort((a, b) => a.position - b.position);
        },
        
        getActiveProducts: () => {
          const state = get();
          return state.products.filter(p => p.active);
        },
        
        clearStore: () => set((state) => {
          state.currentStore = null;
          state.categories = [];
          state.products = [];
        }),
        
        resetState: () => set(() => ({ ...initialState })),
      })),
      {
        name: 'foodcart-store',
        partialize: (state) => ({
          currentStore: state.currentStore,
          categories: state.categories,
          products: state.products,
        }),
      }
    )
  )
);

// Store selector hooks for better performance
export const useCurrentStore = () => useStoreStore((state) => state.currentStore);
export const useCategories = () => useStoreStore((state) => state.categories);
export const useProducts = () => useStoreStore((state) => state.products);
export const useStoreLoading = () => useStoreStore((state) => state.isLoading);
export const useStoreError = () => useStoreStore((state) => state.error);