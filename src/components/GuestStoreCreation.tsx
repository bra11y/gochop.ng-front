'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Store, Sparkles, Zap, Clock, ArrowRight } from 'lucide-react';

interface StoreFormData {
  name: string;
  email: string;
  description: string;
}

export default function GuestStoreCreation() {
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    email: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slug = generateSlug(formData.name);
      
      // Check if slug already exists
      const { data: existingStore } = await supabase
        .from('store')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingStore) {
        setError('A store with this name already exists. Please choose a different name.');
        setLoading(false);
        return;
      }

      // Create guest store
      const { data: store, error: createError } = await supabase
        .from('store')
        .insert([{
          name: formData.name,
          slug: slug,
          email: formData.email,
          settings: {
            description: formData.description,
            theme: 'default'
          },
          is_guest: true,
          guest_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          status: 'active',
          subscription_tier: 'starter',
          product_count: 0
        }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Redirect to store dashboard
      router.push(`/store/${slug}/dashboard`);

    } catch (err: any) {
      console.error('Store creation error:', err);
      setError(err.message || 'Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof StoreFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Your Free Store</h1>
          <p className="text-gray-600">Launch your online business in under 2 minutes</p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            What you get for free:
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Up to 10 products</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Your own store link (yourstore.gochop.ng)</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-green-500" />
              <span>Accept payments instantly</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>30 days free trial</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Campus Snacks Store"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.name && (
                <p className="text-xs text-gray-500 mt-1">
                  Your store link: {generateSlug(formData.name)}.gochop.ng
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Tell customers what you sell..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formData.name || !formData.email}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create My Free Store
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Trust indicators */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>✓ No credit card required • ✓ Start selling immediately • ✓ Upgrade anytime</p>
        </div>
      </div>
    </div>
  );
}