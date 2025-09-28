import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Store {
  id: string
  name: string
  slug: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  latitude?: number
  longitude?: number
  delivery_radius_km?: number
  status: 'pending' | 'active' | 'suspended'
  settings: Record<string, any>
  theme: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  store_id: string
  name: string
  slug: string
  icon?: string
  position: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  store_id: string
  category_id: string
  name: string
  description?: string
  price: number
  compare_at_price?: number
  stock_quantity: number
  track_inventory: boolean
  active: boolean
  slug: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  store_id: string
  order_number: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  subtotal: number
  tax: number
  delivery_fee: number
  total: number
  delivery_address: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

// Supabase Functions
export const supabaseAPI = {
  // Stores
  async createStore(data: Partial<Store>) {
    const { data: store, error } = await supabase
      .from('stores')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return store
  },

  async getStore(slug: string) {
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return store
  },

  // Categories
  async getCategories(storeId: string) {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('position')
    
    if (error) throw error
    return categories
  },

  // Products
  async getProducts(storeId: string, categoryId?: string) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('store_id', storeId)
      .eq('active', true)

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: products, error } = await query
    
    if (error) throw error
    return products
  },

  // Orders
  async createOrder(data: Partial<Order>) {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([data])
      .select()
      .single()
    
    if (error) throw error
    return order
  },

  async createOrderItems(orderItems: Partial<OrderItem>[]) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()
    
    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToOrders(storeId: string, callback: (payload: any) => void) {
    return supabase
      .channel('orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeId}`,
        },
        callback
      )
      .subscribe()
  },
}