import { supabase } from './client'
import type { Database } from './types'

type Store = Database['public']['Tables']['stores']['Row']
type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']

// Store Operations
export const storeQueries = {
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data
  },

  async create(store: Database['public']['Tables']['stores']['Insert']) {
    const { data, error } = await supabase
      .from('stores')
      .insert([store])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(storeId: string, updates: Database['public']['Tables']['stores']['Update']) {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Category Operations
export const categoryQueries = {
  async getByStore(storeId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId)
      .eq('active', true)
      .order('position')
    
    if (error) throw error
    return data
  },

  async create(category: Database['public']['Tables']['categories']['Insert']) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Product Operations
export const productQueries = {
  async getByStore(storeId: string, categoryId?: string, includeInactive: boolean = false) {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories(*)
      `)
      .eq('store_id', storeId)

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories(*),
        stores(*)
      `)
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) throw error
    return data
  },

  async create(product: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Order Operations
export const orderQueries = {
  async create(order: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createItems(orderItems: Database['public']['Tables']['order_items']['Insert'][]) {
    const { data, error } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getByStore(storeId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(*)
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateStatus(orderId: string, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updatePaymentStatus(orderId: string, paymentStatus: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateOrderAndPayment(orderId: string, status: string, paymentStatus: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const subscriptions = {
  orders(storeId: string, callback: (payload: any) => void) {
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

  orderItems(orderId: string, callback: (payload: any) => void) {
    return supabase
      .channel('order_items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
          filter: `order_id=eq.${orderId}`,
        },
        callback
      )
      .subscribe()
  }
}