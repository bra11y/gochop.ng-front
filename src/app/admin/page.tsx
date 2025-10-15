'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, Store, ShoppingCart, DollarSign, TrendingUp, 
  BarChart3, Activity, Settings, Search, Filter,
  Eye, Edit, Trash2, Plus, Download, CreditCard, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/lib/auth-client';
import AdminNav from '@/components/AdminNav';

interface AdminStats {
  totalStores: number;
  activeStores: number;
  totalOrders: number;
  totalRevenue: number;
  platformRevenue: number;
  monthlyGrowth: number;
  recentOrders: any[];
  topStores: any[];
  subscriptionBreakdown: any[];
  monthlyRecurringRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalStores: 0,
    activeStores: 0,
    totalOrders: 0,
    totalRevenue: 0,
    platformRevenue: 0,
    monthlyGrowth: 0,
    recentOrders: [],
    topStores: [],
    subscriptionBreakdown: [],
    monthlyRecurringRevenue: 0
  });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [pendingStores, setPendingStores] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const auth = useAuth();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await auth.checkAuth(['platform_admin', 'support_agent']);
        if (!currentUser) {
          window.location.href = '/login?redirect=/admin';
          return;
        }
        setUser(currentUser);
        setIsAuthenticated(true);
        fetchAdminStats();
      } catch (error) {
        console.error('Authentication failed:', error);
        window.location.href = '/login?redirect=/admin';
      }
    };
    
    checkAuth();
  }, [auth]);

  const fetchAdminStats = async () => {
    try {
      // Fetch real data from API endpoints
      const [metricsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/stores?status=pending')
      ]);
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setStats(metricsData);
      } else {
        // Fallback to mock data for development
        setMockStats();
      }
      
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingStores(pendingData);
      }
      
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setMockStats();
    } finally {
      setLoading(false);
    }
  };
  
  const setMockStats = () => {
    setStats({
      totalStores: 156,
      activeStores: 142,
      totalOrders: 2847,
      totalRevenue: 1245000,
      platformRevenue: 187500, // 15% commission from stores
      monthlyGrowth: 24.5,
      monthlyRecurringRevenue: 89400, // MRR from subscriptions
      subscriptionBreakdown: [
        { tier: 'Starter', count: 89, mrr: 26700, price: 300 },
        { tier: 'Growth', count: 45, mrr: 31500, price: 700 },
        { tier: 'Pro', count: 18, mrr: 25200, price: 1400 },
        { tier: 'Enterprise', count: 4, mrr: 6000, price: 1500 }
      ],
      recentOrders: [
        { id: '1', store: 'Campus Mart', customer: 'John Doe', amount: 3500, status: 'delivered', commission: 525 },
        { id: '2', store: 'Quick Bites', customer: 'Jane Smith', amount: 1200, status: 'preparing', commission: 180 },
        { id: '3', store: 'Fresh Foods', customer: 'Mike Johnson', amount: 2800, status: 'ready', commission: 420 },
        { id: '4', store: 'Campus Mart', customer: 'Sarah Wilson', amount: 1500, status: 'confirmed', commission: 225 },
        { id: '5', store: 'Quick Bites', customer: 'David Brown', amount: 4200, status: 'delivered', commission: 630 }
      ],
      topStores: [
        { name: 'Campus Mart', orders: 245, revenue: 156000, growth: '+12%', tier: 'Pro', commission: 23400 },
        { name: 'Quick Bites', orders: 189, revenue: 124000, growth: '+8%', tier: 'Growth', commission: 18600 },
        { name: 'Fresh Foods', orders: 167, revenue: 98000, growth: '+15%', tier: 'Growth', commission: 14700 },
        { name: 'Tech Store', orders: 134, revenue: 87000, growth: '+5%', tier: 'Starter', commission: 13050 }
      ]
    });
  };

  const handleApproveStore = async (storeId: string) => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Remove from pending list
        setPendingStores(prev => prev.filter(store => store.id !== storeId));
        // Refresh stats
        fetchAdminStats();
      } else {
        console.error('Failed to approve store');
      }
    } catch (error) {
      console.error('Error approving store:', error);
    }
  };

  const handleRejectStore = async (storeId: string) => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Remove from pending list
        setPendingStores(prev => prev.filter(store => store.id !== storeId));
      } else {
        console.error('Failed to reject store');
      }
    } catch (error) {
      console.error('Error rejecting store:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  // Show loading or redirect if not authenticated
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!isAuthenticated ? 'Authenticating...' : 'Loading admin dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Owner Dashboard</h1>
              <p className="text-gray-600">Track your business performance, manage pricing & monitor stores</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Store
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'stores', label: 'Stores', icon: Store },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'pricing', label: 'Pricing', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Pending Store Approvals Alert */}
        {pendingStores.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  {pendingStores.length} store{pendingStores.length === 1 ? '' : 's'} awaiting approval
                </h3>
                <p className="text-sm text-yellow-700">
                  Review and approve new store applications to activate them on the platform.
                </p>
              </div>
              <button
                onClick={() => setSelectedTab('stores')}
                className="ml-auto bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Platform Revenue"
                value={formatCurrency(stats.platformRevenue)}
                icon={DollarSign}
                color="bg-green-600"
                subtitle="Commission earnings"
              />
              <StatCard
                title="Monthly Recurring Revenue"
                value={formatCurrency(stats.monthlyRecurringRevenue)}
                icon={TrendingUp}
                color="bg-blue-600"
                subtitle={`+${stats.monthlyGrowth}% growth`}
              />
              <StatCard
                title="Total Stores"
                value={stats.totalStores}
                icon={Store}
                color="bg-purple-600"
                subtitle={`${stats.activeStores} active`}
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                icon={ShoppingCart}
                color="bg-orange-600"
                subtitle="Platform wide"
              />
            </div>

            {/* Subscription Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {stats.subscriptionBreakdown.map((sub) => (
                  <div key={sub.tier} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">{sub.tier}</p>
                      <p className="text-2xl font-bold text-gray-900">{sub.count}</p>
                      <p className="text-sm text-gray-500">stores</p>
                      <p className="text-sm font-medium text-green-600 mt-2">{formatCurrency(sub.mrr)}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders & Top Stores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.customer}</p>
                        <p className="text-sm text-gray-600">{order.store}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.amount)}</p>
                        <p className="text-sm text-green-600">+{formatCurrency(order.commission)} commission</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performing Stores */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Stores</h3>
                <div className="space-y-4">
                  {stats.topStores.map((store, index) => (
                    <div key={store.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{store.name}</p>
                          <p className="text-sm text-gray-600">{store.orders} orders • {store.tier}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(store.revenue)}</p>
                        <p className="text-sm text-green-600">+{formatCurrency(store.commission)} earned</p>
                        <p className="text-xs text-gray-500">{store.growth}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stores Tab */}
        {selectedTab === 'stores' && (
          <div className="space-y-6">
            {/* Pending Approvals Section */}
            {pendingStores.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Pending Store Approvals ({pendingStores.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingStores.map((store) => (
                    <div key={store.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{store.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{store.ownerName}</p>
                      <p className="text-sm text-gray-500 mb-3">{store.city}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveStore(store.id)}
                          className="flex-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectStore(store.id)}
                          className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>

            {/* Stores Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.topStores.map((store) => (
                      <tr key={store.name} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Store className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{store.name}</div>
                              <div className="text-sm text-gray-500">store-{store.name.toLowerCase().replace(' ', '-')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {store.orders}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(store.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {selectedTab === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Subscription Pricing Management</h3>
                <p className="text-gray-600">Manage platform subscription tiers and commission rates. Changes sync to homepage instantly.</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600">Live pricing sync enabled</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open('/api/subscription-tiers', '_blank')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview Public API
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Tier
                </button>
              </div>
            </div>

            {/* Real-time Pricing Status */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Pricing Sync Status</h4>
                  <p className="text-gray-600 mb-4">
                    Your pricing changes are automatically synced to the homepage and all public pages.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Database: Connected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">API: Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700">Cache: 5min TTL</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₦{stats.monthlyRecurringRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Monthly Recurring Revenue</div>
                  <div className="text-xs text-green-600 mt-1">+{stats.monthlyGrowth}% this month</div>
                </div>
              </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.subscriptionBreakdown.map((tier) => (
                <div key={tier.tier} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{tier.tier}</h4>
                      {tier.tier === 'Growth' && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Live on homepage"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(tier.price)}</p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active stores:</span>
                        <span className="font-medium">{tier.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monthly revenue:</span>
                        <span className="font-medium text-green-600">{formatCurrency(tier.mrr)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500 mb-2">Features included:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {tier.tier === 'Starter' && (
                          <>
                            <li>• Up to 100 products</li>
                            <li>• Basic analytics</li>
                            <li>• 15% commission</li>
                          </>
                        )}
                        {tier.tier === 'Growth' && (
                          <>
                            <li>• Up to 500 products</li>
                            <li>• Advanced analytics</li>
                            <li>• 12% commission</li>
                            <li>• Priority support</li>
                          </>
                        )}
                        {tier.tier === 'Pro' && (
                          <>
                            <li>• Unlimited products</li>
                            <li>• Custom analytics</li>
                            <li>• 10% commission</li>
                            <li>• API access</li>
                          </>
                        )}
                        {tier.tier === 'Enterprise' && (
                          <>
                            <li>• White-label solution</li>
                            <li>• Custom integrations</li>
                            <li>• 8% commission</li>
                            <li>• Dedicated support</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Commission Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Commission Rates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Commission Rate
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      defaultValue="15"
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Applied to orders from all stores</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Processing Fee
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      defaultValue="2.5"
                      className="block w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Additional fee for payment processing</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {selectedTab !== 'overview' && selectedTab !== 'stores' && selectedTab !== 'pricing' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Management
            </h3>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        )}
      </div>
      <AdminNav user={user} />
    </div>
  );
}