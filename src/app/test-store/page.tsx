'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestStorePage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testStoreCreation = async () => {
    setLoading(true);
    setStatus('Testing store creation...');

    try {
      const testSlug = 'test-store-' + Date.now();
      
      const { data, error } = await supabase
        .from('store')
        .insert([{
          name: 'Test Store',
          slug: testSlug,
          email: 'test@example.com',
          is_guest: true,
          guest_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          subscription_tier: 'starter',
          product_count: 0
        }])
        .select()
        .single();

      if (error) {
        setStatus(`❌ Error: ${error.message}`);
      } else {
        setStatus(`✅ Success! Store created with ID: ${data.id}`);
      }
    } catch (err: any) {
      setStatus(`❌ Exception: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Test Store Creation</h1>
        
        <button
          onClick={testStoreCreation}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Testing...' : 'Test Store Creation'}
        </button>

        {status && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-mono">{status}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>This page tests direct database insertion to troubleshoot issues.</p>
        </div>
      </div>
    </div>
  );
}