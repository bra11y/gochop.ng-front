'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price?: number;
  image_url?: string;
  description?: string;
  rating?: number;
  stock_quantity: number;
}

interface OptimizedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
}

const OptimizedProductCard = memo(({ product, onAddToCart, isAdding }: OptimizedProductCardProps) => {
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-50 overflow-hidden">
        {hasDiscount && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
              -{discountPercent}%
            </span>
          </div>
        )}
        
        {product.stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-lg font-medium text-sm">
              Out of Stock
            </span>
          </div>
        )}
        
        <Image
          src={product.image_url || '/api/placeholder/300/200'}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>
        
        {/* Price and Rating */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ₦{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ₦{product.compare_at_price!.toLocaleString()}
                </span>
              )}
            </div>
            
            {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
              <p className="text-xs text-orange-600 font-medium">
                Only {product.stock_quantity} left
              </p>
            )}
          </div>
          
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">{product.rating}</span>
            </div>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock_quantity <= 0 || isAdding}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            product.stock_quantity <= 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isAdding
              ? 'bg-green-600 text-white scale-95'
              : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-95'
          }`}
        >
          {product.stock_quantity <= 0 ? (
            'Out of Stock'
          ) : isAdding ? (
            '✓ Added!'
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard;