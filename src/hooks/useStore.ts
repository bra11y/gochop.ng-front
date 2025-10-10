import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { storeQueries, categoryQueries, productQueries, subscriptions } from '@/lib/supabase/queries';
import { useStoreStore } from '@/store/store';

// Simple local types to avoid complex type instantiation
interface Store {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number | null;
  status: 'pending' | 'active' | 'suspended';
  settings: any;
  theme: any;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock_quantity: number;
  track_inventory: boolean;
  active: boolean;
  slug: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for store management
export function useStore(slug?: string) {
  const {
    currentStore,
    setCurrentStore,
    categories,
    setCategories,
    products,
    setProducts,
    setLoading,
    setCategoriesLoading,
    setProductsLoading,
    setError,
  } = useStoreStore();

  // Query store by slug
  const storeQuery = useQuery<Store>({
    queryKey: ['store', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      return await storeQueries.getBySlug(slug);
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Query categories
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ['categories', currentStore?.id],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store ID');
      return await categoryQueries.getByStore(currentStore.id);
    },
    enabled: !!currentStore?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Query products
  const productsQuery = useQuery<Product[]>({
    queryKey: ['products', currentStore?.id],
    queryFn: async () => {
      if (!currentStore?.id) throw new Error('No store ID');
      return await productQueries.getByStore(currentStore.id);
    },
    enabled: !!currentStore?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store state when queries succeed
  useEffect(() => {
    if (storeQuery.data && storeQuery.data.id !== currentStore?.id) {
      setCurrentStore(storeQuery.data);
    }
  }, [storeQuery.data, currentStore?.id, setCurrentStore]);

  useEffect(() => {
    if (categoriesQuery.data) {
      setCategories(categoriesQuery.data);
    }
    setCategoriesLoading(categoriesQuery.isLoading);
  }, [categoriesQuery.data, categoriesQuery.isLoading, setCategories, setCategoriesLoading]);

  useEffect(() => {
    if (productsQuery.data) {
      setProducts(productsQuery.data);
    }
    setProductsLoading(productsQuery.isLoading);
  }, [productsQuery.data, productsQuery.isLoading, setProducts, setProductsLoading]);

  // Handle loading states
  useEffect(() => {
    setLoading(storeQuery.isLoading);
  }, [storeQuery.isLoading, setLoading]);

  // Handle errors
  useEffect(() => {
    if (storeQuery.error) {
      const errorMessage = storeQuery.error.message || 'Store not found';
      setError(errorMessage);
      toast.error(errorMessage);
    } else if (categoriesQuery.error) {
      const errorMessage = 'Failed to load categories';
      setError(errorMessage);
      toast.error(errorMessage);
    } else if (productsQuery.error) {
      const errorMessage = 'Failed to load products';
      setError(errorMessage);
      toast.error(errorMessage);
    } else {
      setError(null);
    }
  }, [storeQuery.error, categoriesQuery.error, productsQuery.error, setError]);

  return {
    store: currentStore,
    categories,
    products,
    isLoading: storeQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    isProductsLoading: productsQuery.isLoading,
    error: storeQuery.error || categoriesQuery.error || productsQuery.error,
    refetch: () => {
      storeQuery.refetch();
      categoriesQuery.refetch();
      productsQuery.refetch();
    },
  };
}

// Hook for creating a new store
export function useCreateStore() {
  const queryClient = useQueryClient();
  const { setCurrentStore } = useStoreStore();

  return useMutation<Store, Error, any>({
    mutationFn: storeQueries.create,
    onSuccess: (store) => {
      setCurrentStore(store);
      queryClient.setQueryData(['store', store.slug], store);
      toast.success('Store created successfully!');
    },
    onError: (error: any) => {
      const message = error.message || 'Failed to create store';
      toast.error(message);
    },
  });
}

// Hook for real-time store updates
export function useStoreSubscription(storeId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!storeId) return;

    // Subscribe to order updates for this store
    const orderSubscription = subscriptions.orders(storeId, (payload) => {
      // Invalidate and refetch orders when they change
      queryClient.invalidateQueries({ queryKey: ['orders', storeId] });
      
      // Show notification for new orders
      if (payload.eventType === 'INSERT') {
        toast.success('New order received!', {
          duration: 5000,
          icon: '🛒',
        });
      }
    });

    return () => {
      orderSubscription.unsubscribe();
    };
  }, [storeId, queryClient]);
}

// Hook for store validation
export function useStoreValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateSlug = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    setIsValidating(true);
    try {
      await storeQueries.getBySlug(slug);
      // If we get here, the slug exists
      return false;
    } catch {
      // If we get an error, the slug doesn't exist (available)
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return {
    validateSlug,
    generateSlug,
    isValidating,
  };
}

// Hook for store analytics
export function useStoreAnalytics(storeId?: string) {
  const { products, categories } = useStoreStore();

  const analytics = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.active).length,
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.active).length,
    averagePrice: products.length > 0 
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length 
      : 0,
    lowStockProducts: products.filter(p => p.track_inventory && p.stock_quantity < 10).length,
  };

  return analytics;
}