'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, ShoppingBag, Filter, User, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import Cart from '@/components/Cart';
import { useCartStore } from '@/store/cart';

// Mock data for development
const mockCategories: Category[] = [
  { id: '1', name: 'Drinks', slug: 'drinks', emoji: '🥤', position: 1 },
  { id: '2', name: 'Vegetable', slug: 'vegetable', emoji: '🥬', position: 2 },
  { id: '3', name: 'Milk', slug: 'milk', emoji: '🥛', position: 3 },
  { id: '4', name: 'Fruits', slug: 'fruits', emoji: '🍎', position: 4 },
  { id: '5', name: 'Meat', slug: 'meat', emoji: '🥩', position: 5 },
];

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'COCA COLA',
    price: 2000,
    currency: 'NGN',
    category: mockCategories[0],
    image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    stockQuantity: 100,
    active: true,
  },
  {
    id: '2',
    name: 'EVA WATER 75CL',
    price: 2000,
    currency: 'NGN',
    category: mockCategories[0],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400',
    stockQuantity: 50,
    active: true,
  },
  {
    id: '3',
    name: 'Rice Meat',
    price: 14000,
    currency: 'NGN',
    category: mockCategories[1],
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=400',
    stockQuantity: 30,
    active: true,
    rating: 4.8,
    badge: 'food',
    description: 'Food is any substance consumed',
  },
  {
    id: '4',
    name: 'Soup Rice',
    price: 14000,
    currency: 'NGN',
    category: mockCategories[1],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
    stockQuantity: 25,
    active: true,
    rating: 4.8,
    badge: 'food',
    description: 'Food is any substance consumed',
  },
];

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('Ado, Ota, Ogun');
  const [deliveryAnimation, setDeliveryAnimation] = useState(false);
  const [addToCartAnimation, setAddToCartAnimation] = useState<string | null>(null);
  
  const { items, toggleCart, addItem } = useCartStore();
  
  // Use mock data for development, replace with real API calls
  const categories = mockCategories;
  const products = mockProducts.filter(product => 
    (!selectedCategory || product.category.id === selectedCategory) &&
    (!searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDesktopAddToCart = (product: Product) => {
    addItem(product);
    setAddToCartAnimation(product.id);
    setTimeout(() => setAddToCartAnimation(null), 1000);
  };

  const triggerDeliveryAnimation = () => {
    setDeliveryAnimation(true);
    setTimeout(() => setDeliveryAnimation(false), 3000);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-blue-600">FoodCart</h1>
            </div>
            
            {/* User & Cart */}
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleCart}
                className="relative p-2 text-gray-600 hover:text-green-600"
              >
                <ShoppingBag className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Location & Search */}
          <div className="pb-3 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs">Location</span>
              <span className="ml-2 font-medium">{location}</span>
            </div>
            
            <div className="relative flex gap-2">
              <input
                type="text"
                placeholder="Search Food, Drinks, etc"
                className="flex-1 px-4 py-2 pl-10 text-sm border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <button className="p-2 bg-green-600 text-white rounded-lg">
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop Binto Design Header */}
      <header className="hidden md:block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-3 rounded-full">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">FoodCart</h1>
                <p className="text-blue-100">Premium Grocery Experience</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{location}</span>
              </div>
              
              <button
                onClick={triggerDeliveryAnimation}
                className="bg-white text-green-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Track Delivery
              </button>
              
              <button 
                onClick={toggleCart}
                className="relative bg-white/20 p-3 rounded-full hover:bg-white/30 transition"
              >
                <ShoppingBag className="h-6 w-6" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Desktop Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for groceries, drinks, and more..."
              className="w-full px-6 py-4 pl-12 text-gray-800 text-lg rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          </div>
        </div>
      </header>
      
      {/* Mobile Categories */}
      <div className="md:hidden">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

      {/* Desktop Categories - Binto Style */}
      <section className="hidden md:block bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Categories
            </button>
          </div>
          <div className="grid grid-cols-8 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                className={`group p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-xl'
                    : 'bg-gray-50 hover:bg-gradient-to-br hover:from-green-100 hover:to-blue-100'
                }`}
              >
                <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                  {category.emoji}
                </div>
                <p className="text-sm font-medium">{category.name}</p>
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mobile Promotional Banner */}
      <section className="md:hidden mx-4 my-6">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Up to 30% offer!
            </h3>
            <p className="text-gray-700 mb-4">
              Enjoy our big offer of every day.
            </p>
            <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-green-50 transition shadow-md">
              Shop Now
            </button>
          </div>
          <div className="absolute right-0 bottom-0 w-48 h-48 opacity-20">
            <div className="text-[150px]">🛒</div>
          </div>
        </div>
      </section>

      {/* Desktop Hero Section */}
      <section className="hidden md:block bg-gradient-to-r from-purple-100 via-blue-100 to-green-100">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold text-gray-800 mb-6">
                Fresh Groceries
                <span className="block text-green-600">Delivered Fast</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Experience premium quality products with lightning-fast delivery to your doorstep.
              </p>
              <button
                onClick={triggerDeliveryAnimation}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Order Now - 30 min delivery 🚀
              </button>
            </div>
            <div className="relative">
              <div className={`transition-all duration-1000 ${deliveryAnimation ? 'animate-bounce' : ''}`}>
                <div className="text-[200px] text-center">🛍️</div>
              </div>
              {deliveryAnimation && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></div>
                  <div className="relative inline-flex rounded-full h-32 w-32 bg-green-500 items-center justify-center text-4xl">
                    🚚
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Mobile Products Grid */}
      <section className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategory ? 'Filtered Products' : 'Popular Items'}
          </h2>
          <button 
            onClick={() => setSelectedCategory(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Desktop Products Grid - Binto Style */}
      <section className="hidden md:block max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {selectedCategory ? 'Filtered Products' : 'Premium Selection'}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedCategory(null)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All Products
            </button>
            <div className="text-sm text-gray-500">
              {products.length} items available
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {product.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      {product.badge}
                    </span>
                  </div>
                )}
                
                <img
                  src={product.image || '/api/placeholder/300/200'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                
                {product.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {product.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ₦{product.compareAtPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => handleDesktopAddToCart(product)}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform ${
                    addToCartAnimation === product.id
                      ? 'bg-green-500 text-white scale-95 animate-pulse'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {addToCartAnimation === product.id ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-30">
        <div className="grid grid-cols-4 py-2">
          <button className="flex flex-col items-center py-2 text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full mb-1"></div>
            <ShoppingBag className="h-5 w-5" />
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="h-2 mb-1"></div>
            <Search className="h-5 w-5" />
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="h-2 mb-1"></div>
            <MapPin className="h-5 w-5" />
          </button>
          <button className="flex flex-col items-center py-2 text-gray-400">
            <div className="h-2 mb-1"></div>
            <User className="h-5 w-5" />
          </button>
        </div>
      </nav>
      
      {/* Cart Sidebar */}
      <Cart />
    </div>
  );
}