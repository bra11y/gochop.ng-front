// ENTERPRISE ADMIN DASHBOARD LAYOUT
// High-performance, responsive layout with real-time updates

'use client';

import React, { useState, useEffect, Suspense, memo } from 'react';
import { 
  LayoutDashboard, Store, Users, BarChart3, Settings, 
  Bell, Search, Menu, X, ChevronDown, LogOut, User as UserIcon,
  Shield, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  permissions?: string[];
  children?: NavItem[];
}

// Memoized Sidebar Item Component
const SidebarItem = memo(({ item, isActive, isCollapsed }: { 
  item: NavItem; 
  isActive: boolean; 
  isCollapsed: boolean; 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = item.icon;

  return (
    <div className="relative">
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
          ${isActive 
            ? 'bg-blue-600 text-white shadow-lg' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }
          ${isCollapsed ? 'justify-center' : ''}
        `}
        onMouseEnter={() => !item.children || setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        
        {!isCollapsed && (
          <>
            <span className="flex-1 font-medium text-sm">{item.label}</span>
            
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
            
            {item.children && (
              <ChevronDown className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} />
            )}
          </>
        )}
      </Link>
      
      {/* Tooltip for collapsed sidebar */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default function DashboardLayout({ 
  children, 
  user, 
  title = 'Dashboard', 
  subtitle 
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  // Navigation items based on user role
  const navigationItems: NavItem[] = [
    {
      label: 'Overview',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Store Management',
      href: '/admin/stores',
      icon: Store,
      badge: notifications.filter(n => n.type === 'store_approval').length || undefined,
      children: [
        { label: 'Pending Approval', href: '/admin/stores/pending', icon: AlertTriangle },
        { label: 'Active Stores', href: '/admin/stores/active', icon: CheckCircle },
        { label: 'All Stores', href: '/admin/stores/all', icon: Store }
      ]
    },
    ...(user.role === 'platform_admin' ? [
      {
        label: 'User Management',
        href: '/admin/users',
        icon: Users,
        permissions: ['platform_admin']
      },
      {
        label: 'Analytics',
        href: '/admin/analytics',
        icon: BarChart3,
        children: [
          { label: 'Revenue', href: '/admin/analytics/revenue', icon: TrendingUp },
          { label: 'Performance', href: '/admin/analytics/performance', icon: BarChart3 }
        ]
      },
      {
        label: 'Platform Settings',
        href: '/admin/settings',
        icon: Settings,
        permissions: ['platform_admin']
      }
    ] : [])
  ];

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock notifications - replace with real-time updates
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'store_approval', message: 'New store pending approval' },
      { id: 2, type: 'user_signup', message: 'New user registered' }
    ]);
  }, []);

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300
        ${isSidebarCollapsed ? 'w-16' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div>
                  <h1 className="font-bold text-lg text-gray-900">GochopNg</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 hidden lg:flex"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              // Check permissions
              if (item.permissions && !item.permissions.includes(user.role)) {
                return null;
              }
              
              return (
                <div key={item.href} className="group">
                  <SidebarItem 
                    item={item} 
                    isActive={isActive} 
                    isCollapsed={isSidebarCollapsed} 
                  />
                </div>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 text-sm">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}