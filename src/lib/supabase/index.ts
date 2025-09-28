// Export all Supabase utilities
export { supabase, supabaseAdmin } from './client'
export { storeQueries, categoryQueries, productQueries, orderQueries, subscriptions } from './queries'
export type { Database } from './types'

// Re-export commonly used types
export type Store = Database['public']['Tables']['stores']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']