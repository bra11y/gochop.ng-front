'use client';

import { useState } from 'react';
import { storeQueries } from '@/lib/supabase/queries';
import { toast } from 'react-hot-toast';

export default function TestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [store, setStore] = useState<any>(null);

  const testStoreCreation = async () => {
    setIsLoading(true);
    try {
      const testStore = {
        name: 'Test Store',
        slug: 'test-store-' + Date.now(),
        email: 'test@example.com',
        phone: '+2341234567890',
        address: '123 Test Street',
        city: 'Lagos',
        state: 'Lagos',
        status: 'active' as const,
        settings: {
          currency: 'NGN',
          tax_rate: 0.075,
        },
        theme: {
          primary_color: '#059669',
        },
      };

      const createdStore = await storeQueries.create(testStore);
      setStore(createdStore);
      toast.success('Store created successfully!');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create store');
    } finally {
      setIsLoading(false);
    }
  };

  const testStoreRetrieval = async () => {
    if (!store) return;
    
    setIsLoading(true);
    try {
      const retrievedStore = await storeQueries.getBySlug(store.slug);
      toast.success('Store retrieved successfully!');
      console.log('Retrieved store:', retrievedStore);
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to retrieve store');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Integration Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Store Creation</h2>
            <button
              onClick={testStoreCreation}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium"
            >
              {isLoading ? 'Creating...' : 'Create Test Store'}
            </button>
          </div>

          {store && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Created Store:</h3>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-sm">{JSON.stringify(store, null, 2)}</pre>
              </div>
              
              <button
                onClick={testStoreRetrieval}
                disabled={isLoading}
                className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium"
              >
                {isLoading ? 'Retrieving...' : 'Test Store Retrieval'}
              </button>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Make sure you've run the Supabase schema in your database</li>
              <li>2. Update your .env.local with the correct Supabase keys</li>
              <li>3. Click "Create Test Store" to test the integration</li>
              <li>4. If successful, you can test the onboarding flow</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}