'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AdminNav() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link 
        href="/admin"
        className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110 group"
        title="Super Admin Panel"
      >
        <Shield className="h-6 w-6" />
        <span className="absolute -top-8 -left-6 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Admin Panel
        </span>
      </Link>
    </div>
  );
}