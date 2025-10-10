import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
// Simplified type definitions to avoid TypeScript deep instantiation issues
interface Order {
  id: string;
  store_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  total: number;
  delivery_address: any;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

interface OrderState {
  // Current order being placed
  currentOrder: Order | null;
  orderItems: OrderItem[];
  
  // Order history
  orderHistory: Order[];
  
  // Checkout state
  isCheckingOut: boolean;
  checkoutStep: 'cart' | 'details' | 'payment' | 'confirmation';
  
  // Customer details
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    address: string;
  } | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentOrder: (order: Order | null) => void;
  setOrderItems: (items: OrderItem[]) => void;
  addOrderHistory: (order: Order) => void;
  setCheckingOut: (checking: boolean) => void;
  setCheckoutStep: (step: OrderState['checkoutStep']) => void;
  setCustomerDetails: (details: OrderState['customerDetails']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Order management
  clearCurrentOrder: () => void;
  resetCheckout: () => void;
  
  // Computed values
  getTotalAmount: () => number;
  getItemsCount: () => number;
}

const initialState = {
  currentOrder: null,
  orderItems: [],
  orderHistory: [],
  isCheckingOut: false,
  checkoutStep: 'cart' as const,
  customerDetails: null,
  isLoading: false,
  error: null,
};

export const useOrderStore = create<OrderState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Actions
        setCurrentOrder: (order) => set((state) => {
          state.currentOrder = order;
        }),
        
        setOrderItems: (items) => set((state) => {
          state.orderItems = items;
        }),
        
        addOrderHistory: (order) => set((state) => {
          state.orderHistory.unshift(order);
          // Keep only last 50 orders
          if (state.orderHistory.length > 50) {
            state.orderHistory = state.orderHistory.slice(0, 50);
          }
        }),
        
        setCheckingOut: (checking) => set((state) => {
          state.isCheckingOut = checking;
        }),
        
        setCheckoutStep: (step) => set((state) => {
          state.checkoutStep = step;
        }),
        
        setCustomerDetails: (details) => set((state) => {
          state.customerDetails = details;
        }),
        
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        clearCurrentOrder: () => set((state) => {
          state.currentOrder = null;
          state.orderItems = [];
        }),
        
        resetCheckout: () => set((state) => {
          state.isCheckingOut = false;
          state.checkoutStep = 'cart';
          state.customerDetails = null;
          state.error = null;
        }),
        
        // Computed values
        getTotalAmount: () => {
          const state = get();
          return state.orderItems.reduce((total, item) => total + item.total_price, 0);
        },
        
        getItemsCount: () => {
          const state = get();
          return state.orderItems.reduce((count, item) => count + item.quantity, 0);
        },
      })),
      {
        name: 'foodcart-order',
        partialize: (state) => ({
          orderHistory: state.orderHistory,
          customerDetails: state.customerDetails,
        }),
      }
    )
  )
);

// Selector hooks
export const useCurrentOrder = () => useOrderStore((state) => state.currentOrder);
export const useOrderItems = () => useOrderStore((state) => state.orderItems);
export const useOrderHistory = () => useOrderStore((state) => state.orderHistory);
export const useCheckoutState = () => useOrderStore((state) => ({
  isCheckingOut: state.isCheckingOut,
  checkoutStep: state.checkoutStep,
  customerDetails: state.customerDetails,
}));
export const useOrderLoading = () => useOrderStore((state) => state.isLoading);
export const useOrderError = () => useOrderStore((state) => state.error);