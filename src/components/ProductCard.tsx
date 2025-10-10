'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  
  const handleAddToCart = () => {
    // Convert product to cart-compatible format
    const cartProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compare_at_price: product.compareAtPrice,
      store_id: 'current-store', // This should be passed from store context
      stock_quantity: product.stockQuantity || 100, // Default stock if not specified
      active: product.active,
      image_url: product.image,
    };
    
    addItem(cartProduct);
    toast.success(`${product.name} added to cart!`);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative h-40 md:h-48 bg-gray-100 overflow-hidden">
        {product.badge && (
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              {product.badge}
            </span>
          </div>
        )}
        
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 left-2 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition"
        >
          <Heart
            className={`h-4 w-4 ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
        
        <Image
          src={product.image || '/api/placeholder/200/150'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      
      {/* Content */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-sm md:text-base text-gray-800 line-clamp-2 mb-1">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {product.description}
          </p>
        )}
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-lg md:text-xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{product.rating}/5</span>
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition group"
        >
          <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition" />
          <span className="text-sm font-medium">Add to Cart</span>
        </button>
      </div>
    </div>
  );
}