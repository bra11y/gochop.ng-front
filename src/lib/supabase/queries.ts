import { createClient } from '@supabase/supabase-js'
// TODO: Re-enable tenant routing after Phase 1 completion
// import { getTenantDatabase, executeWithMonitoring } from '@/lib/tenant/router'

// Create an untyped client to avoid type issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Legacy client for backward compatibility
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Use any types for now to avoid Supabase typing issues
type Store = any
type Product = any
type Category = any
type Order = any
type OrderItem = any

// Store Operations (Tenant Context will be added in Phase 1 completion)
export const storeQueries = {
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('store')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data
  },

  async create(store: any) {
    const { data, error } = await supabase
      .from('store')
      .insert([store])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(storeId: string, updates: any) {
    const { data, error } = await supabase
      .from('store')
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

  async create(category: any) {
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
        store(*)
      `)
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) throw error
    return data
  },

  async create(product: any) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: any) {
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
  async create(order: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async createItems(orderItems: any[]) {
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