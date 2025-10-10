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
      category: {
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
      product: {
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
      order: {
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
      order_item: {
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