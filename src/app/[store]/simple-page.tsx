'use client';

import React, { useState } from 'react';
import { Search, MapPin, ShoppingCart, Filter, Bell, User, Clock } from 'lucide-react';
import { StoreProvider, useStoreContext } from '@/providers/StoreProvider';
import { useCartStore } from '@/store/cart';

function SimpleStoreContent() {
  const { store, products, isLoading } = useStoreContext();
  const { items, toggleCart, addItem } = useCartStore();

  const sampleProducts = [
    {
      id: '1',
      name: '2KG Chinese rice is any substance consumed',
      price: 2830.90,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop',
      category: 'FOOD',
      stock: '122'
    },
    {
      id: '2', 
      name: '8KG Big size pizza is any substance consumed',
      price: 8000,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
      category: 'FOOD',
      stock: '122'
    },
    {
      id: '3',
      name: '75CL Coca Cola pizza is any substance consumed', 
      price: 1000,
      image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop',
      category: 'DRINK',
      stock: '32'
    }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Exact match to Image #1 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Red Logo */}
            <div className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg">
              LOGO
            </div>
            
            {/* Center Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search Food, Drinks, etc"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[#112e40]"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Filter className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-[#112e40] hover:text-[#112e40]">
                <Clock className="h-5 w-5" />
                <span>Track Order</span>
              </button>
              <Bell className="h-6 w-6 text-gray-400" />
              <button onClick={toggleCart} className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
                {items.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Categories - Exact match to Image #1 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-[#112e40] mb-4">Category</h2>
          <div className="flex gap-4">
            <button className="flex items-center gap-3 px-6 py-3 bg-gray-50 border border-gray-200 rounded-xl">
              <span className="text-2xl">🥤</span>
              <span className="font-medium text-[#112e40]">Food & Drinks</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">64</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="text-2xl">🥖</span>
              <span className="font-medium text-[#112e40]">Bakery</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">45</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="text-2xl">🛍️</span>
              <span className="font-medium text-[#112e40]">Groceries</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">614</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="text-2xl">🍎</span>
              <span className="font-medium text-[#112e40]">Fruits</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">14</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <span className="text-2xl">🥩</span>
              <span className="font-medium text-[#112e40]">Protein</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Exact Layout from Image #1 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <div className="w-80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#112e40]">Cakes</h3>
              <button className="text-gray-400 hover:text-[#112e40] text-sm">View all</button>
            </div>
            <div className="space-y-4">
              {sampleProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
                  <div className="p-4">
                    <p className="text-xs text-[#112e40] mb-2 line-clamp-2">{product.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-600">NGN</span>
                      <span className="text-xs font-semibold text-[#112e40]">{product.price.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      <span className="bg-gray-100 border border-gray-200 text-[#112e40] px-2 py-1 rounded text-xs">
                        {product.category}
                      </span>
                      <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-medium">
                        {product.stock}
                      </span>
                    </div>
                    <button className="text-xs text-black underline hover:no-underline">
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Hero Banner */}
            <div className="relative h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-orange-400 to-orange-600">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=300&fit=crop"
                alt="Our Culinary Adventure"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <p className="text-lg mb-2">Our Culinary Adventure</p>
                  <h1 className="text-4xl font-bold">Starts Here.</h1>
                </div>
              </div>
            </div>

            {/* Cakes Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-[#112e40]">Cakes</h3>
                <button className="text-gray-400 hover:text-[#112e40]">View all</button>
              </div>
              <div className="grid grid-cols-3 gap-6">
                {[...sampleProducts, ...sampleProducts].map((product, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <p className="text-sm text-[#112e40] mb-2 line-clamp-2">{product.name}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-blue-600">NGN</span>
                        <span className="text-sm font-semibold text-[#112e40]">{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-1">
                          <span className="bg-gray-100 border border-gray-200 text-[#112e40] px-2 py-1 rounded text-xs">
                            {product.category}
                          </span>
                          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs font-medium">
                            {product.stock}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="text-yellow-400">⭐</span>
                          <span>4.8/5</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => addItem(product as any)}
                        className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimpleStorePage() {
  return (
    <StoreProvider>
      <SimpleStoreContent />
    </StoreProvider>
  );
}