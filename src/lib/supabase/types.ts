export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      store: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          delivery_radius_km: number | null
          status: 'pending' | 'active' | 'suspended'
          settings: Json
          theme: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          delivery_radius_km?: number | null
          status?: 'pending' | 'active' | 'suspended'
          settings?: Json
          theme?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          delivery_radius_km?: number | null
          status?: 'pending' | 'active' | 'suspended'
          settings?: Json
          theme?: Json
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          slug: string
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          latitude: number | null
          longitude: number | null
          delivery_radius_km: number | null
          status: 'pending' | 'active' | 'suspended'
          settings: Json
          theme: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          delivery_radius_km?: number | null
          status?: 'pending' | 'active' | 'suspended'
          settings?: Json
          theme?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          latitude?: number | null
          longitude?: number | null
          delivery_radius_km?: number | null
          status?: 'pending' | 'active' | 'suspended'
          settings?: Json
          theme?: Json
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          store_id: string
          name: string
          slug: string
          icon: string | null
          position: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          slug: string
          icon?: string | null
          position?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          slug?: string
          icon?: string | null
          position?: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          store_id: string
          category_id: string
          name: string
          description: string | null
          price: number
          compare_at_price: number | null
          stock_quantity: number
          track_inventory: boolean
          active: boolean
          slug: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          category_id: string
          name: string
          description?: string | null
          price: number
          compare_at_price?: number | null
          stock_quantity?: number
          track_inventory?: boolean
          active?: boolean
          slug: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          compare_at_price?: number | null
          stock_quantity?: number
          track_inventory?: boolean
          active?: boolean
          slug?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          order_number: string
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          tax: number
          delivery_fee: number
          total: number
          delivery_address: Json
          customer_email: string | null
          customer_phone: string | null
          customer_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          order_number: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          tax?: number
          delivery_fee?: number
          total: number
          delivery_address?: Json
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          order_number?: string
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal?: number
          tax?: number
          delivery_fee?: number
          total?: number
          delivery_address?: Json
          customer_email?: string | null
          customer_phone?: string | null
          customer_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          product_snapshot?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          product_snapshot?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone: string | null
          role: 'store_owner' | 'customer' | 'platform_admin'
          status: string
          login_attempts: number
          locked_until: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: 'store_owner' | 'customer' | 'platform_admin'
          status?: string
          login_attempts?: number
          locked_until?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: 'store_owner' | 'customer' | 'platform_admin'
          status?: string
          login_attempts?: number
          locked_until?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}