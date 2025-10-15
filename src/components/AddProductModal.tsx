'use client';

import { useState } from 'react';
import { X, Upload, Plus, DollarSign, Package, Tag, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productQueries, categoryQueries } from '@/lib/supabase/queries';

interface AddProductModalProps {
  storeId: string;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ storeId, categories, onClose, onSuccess }: AddProductModalProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    image_url: ''
  });

  const [quickOptions] = useState([
    { name: 'Coca Cola 35cl', price: '200', category: 'Beverages', image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400' },
    { name: 'Bread Loaf', price: '450', category: 'Bakery', image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400' },
    { name: 'Rice 2kg', price: '2500', category: 'Food', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
    { name: 'Fresh Tomatoes 1kg', price: '800', category: 'Vegetables', image: 'https://images.unsplash.com/photo-1546470427-e6e5b0c7e0b1?w=400' }
  ]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleQuickAdd = (product: any) => {
    setFormData({
      name: product.name,
      description: `Quality ${product.name.toLowerCase()} for your daily needs`,
      price: product.price,
      stock_quantity: '50',
      category_id: categories.find(cat => cat.name.toLowerCase().includes(product.category.toLowerCase()))?.id || categories[0]?.id || '',
      image_url: product.image
    });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        store_id: storeId,
        category_id: formData.category_id || null, // Fix: Use null instead of empty string
        name: formData.name,
        slug: generateSlug(formData.name),
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url || null,
        active: true
      };

      await productQueries.create(productData);
      toast.success('Product added successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error('Failed to add product: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-[#112e40]">Add New Product</h2>
            <p className="text-gray-600">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-[#112e40] mb-4">Quick Start</h3>
            <p className="text-gray-600 mb-6">Choose a common product to get started quickly, or create from scratch.</p>
            
            {/* Quick Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {quickOptions.map((product, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAdd(product)}
                  className="group flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-[#112e40] group-hover:text-green-700">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.category}</p>
                    <p className="text-green-600 font-semibold">₦{parseInt(product.price).toLocaleString()}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Product Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <Plus className="h-6 w-6 text-gray-400 group-hover:text-green-600" />
                <span className="text-gray-600 group-hover:text-green-700 font-medium">Create Custom Product</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4" />
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Coca Cola 35cl"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4" />
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Package className="h-4 w-4" />
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => updateFormData('stock_quantity', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4" />
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => updateFormData('category_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell customers about your product..."
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => updateFormData('image_url', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a link to your product image. We'll add image upload soon!
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.name || !formData.price || !formData.stock_quantity}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}