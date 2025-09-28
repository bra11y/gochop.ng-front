import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Product, Category, Store, Order } from '@/types';
import { supabaseAPI } from './supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const USE_SUPABASE = true; // Toggle for MVP - use Supabase by default

class ApiClient {
  private client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.error || 'Something went wrong';
        toast.error(message);
        
        return Promise.reject(error);
      }
    );
  }

  // Store methods
  async createStore(data: any) {
    if (USE_SUPABASE) {
      return await supabaseAPI.createStore(data);
    }
    const response = await this.client.post('/stores', data);
    return response.data;
  }

  async getStore(subdomain: string) {
    const response = await this.client.get(`/stores/${subdomain}`);
    return response.data;
  }

  // Product methods
  async getProducts(params?: any) {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }

  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/products/bulk_import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Order methods
  async createOrder(data: any) {
    const response = await this.client.post('/orders', data);
    return response.data;
  }

  async trackOrder(orderNumber: string) {
    const response = await this.client.get(`/orders/${orderNumber}/track`);
    return response.data;
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.token);
    return response.data;
  }

  async setupStripeConnect() {
    const response = await this.client.post('/payment/stripe-connect');
    return response.data;
  }
}

export const api = new ApiClient();