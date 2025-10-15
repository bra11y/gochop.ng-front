'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Package, Plus, Star, Users, Zap, Crown, 
  AlertTriangle, CheckCircle, Calendar, ExternalLink 
} from 'lucide-react';

interface Store {
  id: string;
  name: string;
  slug: string;
  product_count: number;
  guest_expires_at: string;
  is_guest: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface GuestStoreDashboardProps {
  storeSlug: string;
}

export default function GuestStoreDashboard({ storeSlug }: GuestStoreDashboardProps) {
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, [storeSlug]);

  const fetchStoreData = async () => {
    try {
      // Fetch store info
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('id, name, slug, product_count, guest_expires_at, is_guest')
        .eq('slug', storeSlug)
        .single();

      if (storeError) throw storeError;
      setStore(storeData);

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, active')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!store?.guest_expires_at) return 0;
    const expiryDate = new Date(store.guest_expires_at);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getProductLimitColor = () => {
    const count = store?.product_count || 0;
    if (count >= 10) return 'text-red-600';
    if (count >= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-600">The store you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const productCount = store.product_count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
              <p className="text-gray-600">Free Trial Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={`https://${store.slug}.gochop.ng`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                View Store <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Trial Status Banner */}
        <div className={`rounded-lg p-4 mb-6 ${
          daysRemaining <= 3 
            ? 'bg-red-50 border border-red-200' 
            : daysRemaining <= 7 
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className={`h-5 w-5 ${
                daysRemaining <= 3 ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-blue-600'
              }`} />
              <div>
                <h3 className={`font-medium ${
                  daysRemaining <= 3 ? 'text-red-800' : daysRemaining <= 7 ? 'text-yellow-800' : 'text-blue-800'
                }`}>
                  {daysRemaining === 0 
                    ? 'Your free trial has expired' 
                    : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} left in your free trial`
                  }
                </h3>
                <p className={`text-sm ${
                  daysRemaining <= 3 ? 'text-red-700' : daysRemaining <= 7 ? 'text-yellow-700' : 'text-blue-700'
                }`}>
                  {daysRemaining === 0 
                    ? 'Upgrade now to keep your store active'
                    : 'Upgrade anytime to unlock unlimited features'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                daysRemaining <= 3 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {daysRemaining === 0 ? 'Upgrade Now' : 'View Plans'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className={`text-2xl font-bold ${getProductLimitColor()}`}>
                  {productCount}/10
                </p>
                <p className="text-sm text-gray-500">Free plan limit</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            {productCount >= 7 && (
              <div className="mt-4 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  {productCount >= 10 
                    ? '🚫 Product limit reached! Upgrade to add more.'
                    : `⚠️ Only ${10 - productCount} product slots remaining`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Orders */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                📊 Upgrade to see detailed analytics
              </button>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦0</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                💰 Upgrade to track revenue trends
              </button>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
            <button
              disabled={productCount >= 10}
              onClick={() => {/* TODO: Open add product modal */}}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-6">Add your first product to start selling</p>
              <button
                onClick={() => {/* TODO: Open add product modal */}}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-lg font-bold text-blue-600">₦{product.price.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      product.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade Your Store</h3>
              <p className="text-gray-600">Unlock unlimited products and powerful features</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Unlimited products</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Detailed analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Custom domain</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">WhatsApp integration</span>
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">₦2,500</div>
              <div className="text-sm text-gray-500 mb-4">per month</div>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition mb-3">
                Upgrade Now
              </button>
              
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full text-gray-600 hover:text-gray-800 transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}