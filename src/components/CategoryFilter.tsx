'use client';

import { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
}

const categoryEmojis: Record<string, string> = {
  'drinks': '🥤',
  'vegetable': '🥬',
  'milk': '🥛',
  'fruits': '🍎',
  'meat': '🥩',
  'food & drink': '🍽️',
  'canned food': '🥫',
  'hot soup': '🍲',
  'rice': '🍚',
  'seafood': '🦐',
  'curry rice': '🍛',
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) {
  return (
    <div className="bg-white py-4 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button 
            onClick={() => onCategorySelect(null)}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(
                selectedCategory === category.id ? null : category.id
              )}
              className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-green-50 border-2 border-green-500 shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="text-2xl md:text-3xl mb-2">
                {categoryEmojis[category.slug?.toLowerCase()] || category.emoji || '📦'}
              </div>
              <span className="text-xs font-medium text-center line-clamp-1">
                {category.name}
              </span>
              {category.count && (
                <span className="text-xs text-gray-500 mt-1">
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}