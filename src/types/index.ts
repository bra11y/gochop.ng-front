export interface Store {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    settings: {
      primaryColor: string;
      logo?: string;
      banner?: string;
    };
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    deliveryRadius: number;
    operatingHours: Record<string, { open: string; close: string }>;
  }
  
  export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    currency: string;
    category: Category;
    image: string;
    images?: string[];
    stockQuantity: number;
    active: boolean;
    rating?: number;
    tag?: 'food' | 'drink' | 'snack';
    badge?: string;
  }
  
  export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    emoji?: string;
    position: number;
    count?: number;
  }
  
  export interface CartItem extends Product {
    quantity: number;
  }
  
  export interface Order {
    id: string;
    orderNumber: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';
    items: OrderItem[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: Address;
    createdAt: string;
  }
  
  export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: number;
  }
  
  export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }