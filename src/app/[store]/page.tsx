'use client';

import React, { useState } from 'react';
import { Search, MapPin, ShoppingCart, Filter, Bell, User, Clock, Heart, Settings } from 'lucide-react';
import { StoreProvider, useStoreContext } from '@/providers/StoreProvider';
import { useCartStore } from '@/store/cart';
import Cart from '@/components/Cart';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useParams } from 'next/navigation';

function StorePageContent() {
  const [selectedCategory, setSelectedCategory] = useState('food-drinks');
  const [addToCartAnimation, setAddToCartAnimation] = useState<string | null>(null);
  
  const { store, categories, products, isLoading, error } = useStoreContext();
  const { items, toggleCart, addItem } = useCartStore();
  const params = useParams();

  const handleAddToCart = (product: any) => {
    addItem(product);
    setAddToCartAnimation(product.id);
    setTimeout(() => setAddToCartAnimation(null), 1000);
  };

  // Add mock products for testing cart UI when no real products exist
  const mockProducts = products.length === 0 ? [
    {
      id: 'mock-1',
      name: 'Premium Pizza Margherita',
      description: 'Fresh tomatoes, mozzarella, basil on crispy crust',
      price: 4500,
      stock_quantity: 10,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      category: { name: 'FOOD' }
    },
    {
      id: 'mock-2',
      name: 'Chinese Fried Rice',
      description: 'Aromatic fried rice with vegetables and eggs',
      price: 2800,
      stock_quantity: 15,
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      category: { name: 'FOOD' }
    },
    {
      id: 'mock-3',
      name: 'Fresh Coca Cola',
      description: 'Refreshing cold beverage',
      price: 1000,
      stock_quantity: 25,
      image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop',
      category: { name: 'DRINK' }
    }
  ] : products;

  // Dynamic Categories based on actual store data or mock categories
  const mockCategories = products.length === 0 ? [
    { id: 'food', name: 'Food', count: 2, icon: '🍕', color: 'bg-gray-100' },
    { id: 'drinks', name: 'Drinks', count: 1, icon: '🥤', color: 'bg-gray-100' }
  ] : [];
  
  const dynamicCategories = products.length > 0 ? categories.map(category => {
    const productCount = products.filter(p => p.category_id === category.id).length;
    return {
      id: category.slug || category.id,
      name: category.name,
      count: productCount,
      icon: category.icon || '📦',
      color: 'bg-gray-100'
    };
  }).filter(cat => cat.count > 0) : mockCategories;

  // Filter products based on selected category  
  const filteredProducts = mockProducts.filter((product: any) => {
    if (!selectedCategory || selectedCategory === 'all') {
      return true; // Show all products
    }
    
    // Find category by slug or id
    const category = categories.find(cat => 
      cat.slug === selectedCategory || cat.id === selectedCategory
    );
    
    return category ? product.category_id === category.id : true;
  });

  // Determine layout based on store settings, not filtered product count
  const getStoreLayout = (totalProductCount: number, storeSettings: any) => {
    // Check if store has explicitly set a layout preference
    const preferredLayout = storeSettings?.layout_type;
    
    if (preferredLayout) {
      // Use store's preferred layout regardless of product count
      const layoutConfigs = {
        'hero': {
          layoutType: 'hero',
          gridCols: 'grid-cols-1',
          showSidebar: false,
          showHeroBanner: true
        },
        'minimal': {
          layoutType: 'minimal',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          showSidebar: false,
          showHeroBanner: true
        },
        'compact': {
          layoutType: 'compact',
          gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
          showSidebar: false,
          showHeroBanner: true
        },
        'marketplace': {
          layoutType: 'full',
          gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
          showSidebar: true,
          showHeroBanner: true
        }
      };
      return layoutConfigs[preferredLayout as keyof typeof layoutConfigs] || layoutConfigs['compact'];
    }
    
    // Auto-detect layout only for new stores (fallback)
    if (totalProductCount === 1) {
      return {
        layoutType: 'hero',
        gridCols: 'grid-cols-1',
        showSidebar: false,
        showHeroBanner: true
      };
    } else if (totalProductCount <= 3) {
      return {
        layoutType: 'minimal',
        gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        showSidebar: false,
        showHeroBanner: true
      };
    } else if (totalProductCount <= 10) {
      return {
        layoutType: 'compact',
        gridCols: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        showSidebar: false,
        showHeroBanner: true
      };
    } else {
      return {
        layoutType: 'full',
        gridCols: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3',
        showSidebar: true,
        showHeroBanner: true
      };
    }
  };

  // Use total product count for layout, not filtered count
  const layout = getStoreLayout(mockProducts.length, store?.settings || {});

  // Product Card Component (matching Image #1 style)
  const ProductCard = ({ product, variant = 'default' }: { product: any; variant?: 'default' | 'large' }) => {
    const isLarge = variant === 'large';
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all ${isLarge ? 'min-h-64 h-auto' : 'h-full'}`}>
        <div className={`relative ${isLarge ? 'h-28' : 'h-48'} bg-gray-50 overflow-hidden`}>
          <img
            src={product.image_url || product.primary_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              Only {product.stock_quantity} left
            </div>
          )}
        </div>
        
        <div className={`p-4 space-y-3 ${isLarge ? 'p-3 space-y-2' : ''}`}>
          <div>
            <h3 className={`font-medium text-[#112e40] line-clamp-2 leading-tight ${isLarge ? 'text-xs' : 'text-sm'}`}>
              {product.name}
            </h3>
            <p className={`text-gray-500 mt-1 line-clamp-1 ${isLarge ? 'text-xs' : 'text-xs'}`}>
              {product.description || 'Food is any substance consumed'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className={`font-bold text-[#112e40] ${isLarge ? 'text-sm' : 'text-lg'}`}>
                NGN {product.price?.toLocaleString() || '0'}
              </span>
            </div>
            {!isLarge && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span className="text-yellow-400">⭐</span>
                <span>4.8/5</span>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock_quantity <= 0}
            className={`w-full rounded-lg font-medium transition-all ${
              isLarge ? 'py-1.5 text-xs' : 'py-2 text-sm'
            } ${
              product.stock_quantity <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : addToCartAnimation === product.id
                ? 'bg-green-600 text-white scale-95'
                : 'bg-white text-[#112e40] border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {product.stock_quantity <= 0 ? 'Out of Stock' : 
             addToCartAnimation === product.id ? '✓ Added!' : 'ADD TO CART'}
            {!isLarge && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                {product.category?.name || 'FOOD'}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-[#112e40]">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[#112e40] mb-2">
            Failed to Load Store
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to connect to the store. Please check your connection and try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🏪</div>
          <h2 className="text-xl font-semibold text-[#112e40] mb-2">
            Store Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The store you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show message when no products are available (but skip if we have mock products)
  if (!isLoading && products.length === 0 && false) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header for empty state */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg">
                {store.name}
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center pt-20">
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg max-w-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🏪</span>
            </div>
            <h2 className="text-2xl font-bold text-[#112e40] mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              {store.name} is setting up their amazing products. Check back soon for fresh deals and quality items!
            </p>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  🔔 Want to be notified when products are added?
                </p>
                <p className="text-green-700 text-sm mt-1">
                  Contact the store directly for updates!
                </p>
              </div>
              
              {/* CTA for store owners */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-3">
                  👋 Are you the store owner?
                </p>
                <button
                  onClick={() => window.location.href = `/${store.slug}/manage`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <span>📦</span>
                  Add Your First Product
                </button>
                <p className="text-blue-700 text-xs mt-2 text-center">
                  Start building your store inventory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg">
                GochopNg
              </div>
              
              {/* Search Bar */}
              <div className="flex-1 max-w-md mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search Food, Drinks, etc"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[#112e40]"
                  />
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>
              
              {/* Right Actions */}
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-[#112e40] hover:text-[#112e40]">
                  <Clock className="h-5 w-5" />
                  Track Order
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-6 w-6" />
                </button>
                <button 
                  onClick={toggleCart}
                  className="relative p-2 text-gray-400 hover:text-gray-600"
                >
                  <ShoppingCart className="h-6 w-6" />
                  {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-[#112e40]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Categories - Only show if there are multiple categories */}
        {dynamicCategories.length > 1 && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <h2 className="text-lg font-semibold text-[#112e40] mb-4">Categories</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {dynamicCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium text-[#112e40]">{category.name}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-medium">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Adaptive Layout */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {layout.layoutType === 'hero' && filteredProducts.length >= 1 ? (
            /* Single Hero Product Layout */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-8">
                  <div className="space-y-6">
                    <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden">
                      <img
                        src={filteredProducts[0].image_url || filteredProducts[0].primary_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'}
                        alt={filteredProducts[0].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-[#112e40] mb-4">
                        {filteredProducts[0].name}
                      </h1>
                      <p className="text-lg text-gray-600 mb-6">
                        {filteredProducts[0].description || 'Premium quality product from our store'}
                      </p>
                      <div className="text-4xl font-bold text-green-600 mb-6">
                        ₦{filteredProducts[0].price?.toLocaleString() || '0'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(filteredProducts[0])}
                      disabled={filteredProducts[0].stock_quantity <= 0}
                      className={`w-full py-4 rounded-xl text-lg font-semibold transition-all ${
                        filteredProducts[0].stock_quantity <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : addToCartAnimation === filteredProducts[0].id
                          ? 'bg-green-600 text-white scale-95'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {filteredProducts[0].stock_quantity <= 0 ? 'Out of Stock' : 
                       addToCartAnimation === filteredProducts[0].id ? '✓ Added to Cart!' : 'Add to Cart'}
                    </button>
                    {filteredProducts[0].stock_quantity <= 10 && filteredProducts[0].stock_quantity > 0 && (
                      <p className="text-orange-600 text-sm font-medium">
                        Only {filteredProducts[0].stock_quantity} left in stock
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : layout.showSidebar ? (
            /* Full Marketplace Layout */
            <div className="flex gap-8">
              <div className="w-80 space-y-6">
                <div>
                  <h3 className="font-semibold text-[#112e40] text-lg mb-4">Featured Products</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredProducts.slice(0, 4).map((product) => (
                      <ProductCard key={product.id} product={product} variant="large" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-8">
                {layout.showHeroBanner && (
                  <div className="relative h-60 rounded-2xl overflow-hidden bg-gradient-to-r from-green-400 to-blue-500">
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                        <p className="text-lg">Fresh. Quality. Delivered.</p>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-[#112e40] mb-6">All Products</h3>
                  <div className={`grid ${layout.gridCols} gap-6`}>
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Minimal/Compact Layout */
            <div className="space-y-8">
              {layout.showHeroBanner && (
                <div className="relative h-60 rounded-2xl overflow-hidden bg-gradient-to-r from-green-400 to-blue-500">
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
                      <p className="text-lg">Quality products, great service</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="max-w-5xl mx-auto">
                <div className={`grid ${layout.gridCols} gap-8 justify-items-center`}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={`w-full max-w-sm ${
                      layout.layoutType === 'minimal' ? 'max-w-md' : ''
                    }`}>
                      <ProductCard product={product} variant={layout.layoutType === 'minimal' ? 'large' : 'default'} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen bg-white">
        {/* Mobile Header */}
        <header className="bg-white border-b border-gray-200 px-[25px] py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <span className="font-medium text-[#112e40]">{store.city}, {store.state}</span>
            </div>
            <button className="p-2 text-gray-400">
              <Bell className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search Food, Drinks, etc"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-[#112e40]"
              />
            </div>
            <button className="bg-green-600 text-white p-3 rounded-lg">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Promotional Banner */}
        <div className="mx-[25px] mt-4 bg-green-50 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-green-800 mb-2">Up to 30% offer!</h2>
            <p className="text-green-600 mb-4">Enjoy our big offer of every day</p>
            <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium text-sm">
              Shop Now
            </button>
          </div>
          <div className="absolute right-4 top-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="px-[25px] py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#112e40]">Category</h3>
            <button className="text-gray-400 text-sm">View all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dynamicCategories.map((category) => (
              <button
                key={category.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">{category.icon}</span>
                </div>
                <span className="text-xs font-medium text-[#112e40]">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Items */}
        <div className="px-[25px] pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#112e40]">Popular items</h3>
            <button className="text-gray-400 text-sm">View all</button>
          </div>
          <div className="grid grid-cols-2 gap-4 auto-rows-fr">
            {filteredProducts.slice(0, 4).map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">
                <div className="relative h-24 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm"
                  >
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <h4 className="font-medium text-[#112e40] text-sm mb-1 line-clamp-2">{product.name}</h4>
                  <p className="text-lg font-bold text-[#112e40]">NGN {product.price?.toLocaleString() || '0'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="grid grid-cols-4 py-2">
            <button className="flex flex-col items-center py-3 text-[#112e40]">
              <div className="w-6 h-6 bg-[#112e40] rounded flex items-center justify-center mb-1">
                <span className="w-2 h-2 bg-white rounded-full"></span>
              </div>
            </button>
            <button className="flex flex-col items-center py-3 text-gray-400">
              <Clock className="h-6 w-6 mb-1" />
            </button>
            <button className="flex flex-col items-center py-3 text-gray-400">
              <Heart className="h-6 w-6 mb-1" />
            </button>
            <button className="flex flex-col items-center py-3 text-gray-400">
              <User className="h-6 w-6 mb-1" />
            </button>
          </div>
        </nav>
      </div>

      {/* Floating Cart Button - Mobile and Desktop */}
      {items.length > 0 && (
        <button
          onClick={toggleCart}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg z-40 transition-all transform hover:scale-105"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </button>
      )}

      <Cart />
    </>
  );
}

export default function StorePage() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <StorePageContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}