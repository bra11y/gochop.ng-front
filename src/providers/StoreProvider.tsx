'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { useStore, useStoreSubscription } from '@/hooks/useStore';
import { useStoreStore } from '@/store/store';

interface StoreContextValue {
  store: any;
  categories: any[];
  products: any[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

interface StoreProviderProps {
  children: ReactNode;
  storeSlug?: string;
}

export function StoreProvider({ children, storeSlug }: StoreProviderProps) {
  const params = useParams();
  const slug = storeSlug || (params?.store as string);
  
  const {
    store,
    categories,
    products,
    isLoading,
    error,
    refetch,
  } = useStore(slug);

  // Enable real-time subscriptions for this store
  useStoreSubscription(store?.id);

  const value: StoreContextValue = {
    store,
    categories,
    products,
    isLoading,
    error,
    refetch,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}

// HOC for pages that need store context
export function withStoreProvider<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    return (
      <StoreProvider>
        <Component {...props} />
      </StoreProvider>
    );
  };
}