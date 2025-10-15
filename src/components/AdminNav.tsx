'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Settings, BarChart3 } from 'lucide-react';
import { User } from '@/lib/auth';

interface AdminNavProps {
  user?: User | null;
}

export default function AdminNav({ user }: AdminNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Only show admin nav for platform admins and support agents
    if (user && (user.role === 'platform_admin' || user.role === 'support_agent')) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  if (!isVisible) {
    return null; // Don't render anything for non-admin users
  }

  const adminLinks = [
    {
      href: '/admin',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'Platform Overview'
    },
    {
      href: '/admin/stores',
      icon: Shield,
      label: 'Store Management',
      description: 'Approve & Manage Stores'
    },
    ...(user?.role === 'platform_admin' ? [{
      href: '/admin/settings',
      icon: Settings,
      label: 'Platform Settings',
      description: 'System Configuration'
    }] : [])
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`transition-all duration-300 ${isExpanded ? 'mb-2' : ''}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Expanded Menu */}
        <div className={`transition-all duration-300 transform ${
          isExpanded ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2 mb-2 min-w-[200px]">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 group"
                >
                  <Icon className="h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{link.label}</div>
                    <div className="text-xs text-gray-500">{link.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Button */}
        <button
          className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group relative"
          title={`Admin Panel - ${user?.firstName} ${user?.lastName}`}
        >
          <Shield className="h-6 w-6" />
          
          {/* Status Indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
          
          {/* Role Badge */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {user?.role === 'platform_admin' ? 'Platform Admin' : 'Support Agent'}
          </div>
        </button>
      </div>
    </div>
  );
}