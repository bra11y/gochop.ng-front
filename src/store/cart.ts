import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  storeId: string | null;
  
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  
  // Computed
  getTotalPrice: () => number;
  getTotalItems: () => number;
  total: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      storeId: null,
      total: 0,
      
      addItem: (product) => {
        const state = get();
        
        // Ensure we're adding from the same store
        if (state.storeId && state.storeId !== product.store_id) {
          toast.error('Cannot add items from different stores');
          return;
        }
        
        if (!state.storeId) {
          set({ storeId: product.store_id });
        }
        
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          let newItems;
          
          if (existingItem) {
            // Check stock limit
            const newQuantity = existingItem.quantity + 1;
            if (product.stockQuantity && newQuantity > product.stockQuantity) {
              toast.error(`Only ${product.stockQuantity} items available`);
              return state;
            }
            
            newItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: newQuantity }
                : item
            );
          } else {
            // Check if product is in stock
            if (product.stockQuantity && product.stockQuantity < 1) {
              toast.error('Product is out of stock');
              return state;
            }
            
            newItems = [...state.items, { ...product, quantity: 1 }];
          }
          
          const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          toast.success(`${product.name} added to cart`);
          
          return {
            ...state,
            items: newItems,
            total: newTotal
          };
        });
      },
      
      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== productId);
          const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          
          // Clear storeId if cart is empty
          const newStoreId = newItems.length === 0 ? null : state.storeId;
          
          toast.success('Item removed from cart');
          
          return {
            ...state,
            items: newItems,
            total: newTotal,
            storeId: newStoreId
          };
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set((state) => {
          const newItems = state.items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );
          const newTotal = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          
          return {
            ...state,
            items: newItems,
            total: newTotal
          };
        });
      },
      
      clearCart: () => {
        set({ items: [], total: 0, storeId: null });
        toast.success('Cart cleared');
      },
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalPrice: () => {
        return get().total;
      },
      
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'foodcart-storage',
      partialize: (state) => ({ 
        items: state.items, 
        total: state.total, 
        storeId: state.storeId 
      }),
    }
  )
);