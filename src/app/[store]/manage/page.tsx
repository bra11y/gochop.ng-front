'use client';

import { useState } from 'react';
import { Plus, Upload, BarChart3, Package, Users, Settings, X, Save } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { StoreProvider, useStoreContext } from '@/providers/StoreProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CSVImport from '@/components/CSVImport';
import SecurePaymentInfo from '@/components/SecurePaymentInfo';
import AddProductModal from '@/components/AddProductModal';
import { productQueries, orderQueries, storeQueries } from '@/lib/supabase/queries';
import { toast } from 'react-hot-toast';

function StoreManagementContent() {
  const { store, categories, refetch } = useStoreContext();
  const [activeTab, setActiveTab] = useState('products');
  const router = useRouter();
  const params = useParams();
  const storeSlug = params.store as string;
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const queryClient = useQueryClient();

  // Fetch ALL products for management (including inactive ones)
  const { data: allProducts = [], refetch: refetchProducts } = useQuery({
    queryKey: ['manage-products', store?.id],
    queryFn: async () => {
      if (!store?.id) throw new Error('No store ID');
      return await productQueries.getByStore(store.id, undefined, true); // includeInactive = true
    },
    enabled: !!store?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch orders for this store
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['store-orders', store?.id],
    queryFn: async () => {
      if (!store?.id) throw new Error('No store ID');
      return await orderQueries.getByStore(store.id);
    },
    enabled: !!store?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const tabs = [
    { id: 'products', name: 'Products', icon: Package, count: allProducts.length },
    { id: 'categories', name: 'Categories', icon: BarChart3, count: categories.length },
    { id: 'orders', name: 'Orders', icon: Users, count: orders.length },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    setIsUpdating(true);
    try {
      await productQueries.update(editingProduct.id, {
        active: editingProduct.active,
        name: editingProduct.name,
        price: editingProduct.price,
        stock_quantity: editingProduct.stock_quantity,
        description: editingProduct.description
      });
      
      toast.success('Product updated successfully');
      setEditingProduct(null);
      refetch();
      refetchProducts();
    } catch (error: any) {
      toast.error('Failed to update product: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) return;

    try {
      await productQueries.delete(productId);
      toast.success('Product deleted successfully');
      refetch();
      refetchProducts();
    } catch (error: any) {
      toast.error('Failed to delete product: ' + error.message);
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      // Update both order status and payment status
      await orderQueries.updateOrderAndPayment(orderId, 'confirmed', 'paid');
      toast.success('Payment confirmed and order accepted!');
      refetchOrders();
    } catch (error: any) {
      toast.error('Failed to confirm order: ' + error.message);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    
    try {
      await orderQueries.updateStatus(orderId, 'cancelled');
      toast.success('Order rejected');
      refetchOrders();
    } catch (error: any) {
      toast.error('Failed to reject order: ' + error.message);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await orderQueries.updateStatus(orderId, 'delivered');
      toast.success('Order marked as delivered');
      refetchOrders();
    } catch (error: any) {
      toast.error('Failed to update order: ' + error.message);
    }
  };

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-[#112e40]">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#112e40]">Store Management</h1>
              <p className="text-[#112e40]">{store.name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCSVImport(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
              
              <button 
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition ${
                    isActive
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-[#112e40] hover:text-[#112e40]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.name}</span>
                  {tab.count !== undefined && (
                    <span className="bg-gray-100 text-[#112e40] px-2 py-1 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-green-600">{allProducts.length}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Active Products</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {allProducts.filter((p: any) => p.active).length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Low Stock</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {allProducts.filter((p: any) => p.stock_quantity <= 10).length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Categories</h3>
                <p className="text-3xl font-bold text-purple-600">{categories.length}</p>
              </div>
            </div>

            {/* Products Grid */}
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allProducts.map((product: any) => (
                  <div key={product.id} className={`bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all ${
                    !product.active ? 'border-gray-300 opacity-75' : 'border-gray-100'
                  }`}>
                    <div className="relative h-48 bg-gray-50 overflow-hidden">
                      <img
                        src={product.image_url || product.primary_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Only {product.stock_quantity} left
                        </div>
                      )}
                      {product.stock_quantity <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-[#112e40] px-3 py-1 rounded-lg font-medium text-sm">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {!product.active && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Restricted
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-[#112e40] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-[#112e40]">
                            ₦{product.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {product.stock_quantity}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#112e40] mb-2">No products yet</h3>
                <p className="text-gray-500 mb-6">
                  Start building your inventory by adding products or importing from CSV
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowCSVImport(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Import CSV
                  </button>
                  <button 
                    onClick={() => setShowAddProduct(true)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Categories ({categories.length})</h2>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon || '📦'}</div>
                      <div>
                        <h3 className="font-medium text-[#112e40]">{category.name}</h3>
                        <p className="text-sm text-gray-500">
                          {allProducts.filter((p: any) => p.category_id === category.id).length} products
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories created yet</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Pending Orders</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter((o: any) => o.status === 'pending').length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Confirmed Orders</h3>
                <p className="text-3xl font-bold text-green-600">
                  {orders.filter((o: any) => o.status === 'confirmed').length}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-[#112e40] mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ₦{orders.reduce((sum, o: any) => sum + (o.total || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Orders ({orders.length})</h2>
              <div className="space-y-4">
                {orders.length > 0 ? orders.map((order: any) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-[#112e40] text-lg">Order #{order.order_number}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-[#112e40]">
                            <span className="font-medium">{order.customer_name || 'Customer'}</span>
                            {order.customer_phone && <span> • {order.customer_phone}</span>}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                        {order.delivery_address?.address && (
                          <p className="text-sm text-gray-600 mt-1">📍 {order.delivery_address.address}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#112e40] text-lg">₦{order.total?.toLocaleString() || '0'}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            Payment: {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.order_item && order.order_item.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-[#112e40] mb-2">Order Items ({order.order_item.length})</h4>
                        <div className="space-y-2">
                          {order.order_item.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <span>{item.product_snapshot?.name || item.product?.name} x{item.quantity}</span>
                              <span className="font-medium">₦{item.total_price?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleConfirmOrder(order.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                          >
                            ✓ Confirm Payment & Order
                          </button>
                          <button 
                            onClick={() => handleRejectOrder(order.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
                          >
                            ✗ Reject Order
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <>
                          <button 
                            onClick={() => orderQueries.updateStatus(order.id, 'preparing').then(() => refetchOrders())}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition"
                          >
                            👨‍🍳 Start Preparing
                          </button>
                        </>
                      )}
                      {order.status === 'preparing' && (
                        <button 
                          onClick={() => orderQueries.updateStatus(order.id, 'ready').then(() => refetchOrders())}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
                        >
                          ✅ Mark as Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleMarkDelivered(order.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          🚚 Mark as Delivered
                        </button>
                      )}
                      <button 
                        onClick={() => router.push(`/${storeSlug}/orders/${order.id}`)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition"
                      >
                        👁️ View Full Details
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="text-gray-300 text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-[#112e40] mb-2">No orders yet</h3>
                    <p className="text-gray-500">Orders will appear here when customers place them</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Store Layout Configuration */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Store Layout</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#112e40] mb-3">
                    Choose your store layout style
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        id: 'hero',
                        name: 'Hero Layout',
                        description: 'Perfect for single signature products',
                        icon: '🎯',
                        example: 'Specialty cake shops, unique items'
                      },
                      {
                        id: 'minimal',
                        name: 'Minimal Layout',
                        description: 'Clean design for 2-5 products',
                        icon: '✨',
                        example: 'Home bakers, small vendors'
                      },
                      {
                        id: 'compact',
                        name: 'Compact Grid',
                        description: 'Efficient layout for growing inventory',
                        icon: '📦',
                        example: 'Small shops, local stores'
                      },
                      {
                        id: 'marketplace',
                        name: 'Marketplace',
                        description: 'Full featured layout with categories',
                        icon: '🏪',
                        example: 'Grocery stores, large inventories'
                      }
                    ].map((layout) => (
                      <div
                        key={layout.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          (store.settings?.layout_type || 'auto') === layout.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={async () => {
                          try {
                            await storeQueries.update(store.id, {
                              settings: {
                                ...store.settings,
                                layout_type: layout.id
                              }
                            });
                            toast.success(`Layout changed to ${layout.name}`);
                            refetch(); // Refresh store data
                          } catch (error: any) {
                            toast.error('Failed to update layout: ' + error.message);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{layout.icon}</span>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#112e40]">{layout.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{layout.description}</p>
                            <p className="text-xs text-gray-500 mt-2">{layout.example}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">💡</span>
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Consistency Principle</p>
                        <p>Once you choose a layout, it stays consistent regardless of category filters. This ensures your customers always have the same shopping experience.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Settings */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Direct Bank Payments</p>
                      <p>Customers pay directly to your bank account. No transaction fees, instant settlements.</p>
                    </div>
                  </div>
                </div>
                
                {/* Mock payment info - in real app, fetch from secure store */}
                <SecurePaymentInfo 
                  paymentInfo={{
                    bank_name: 'First Bank of Nigeria',
                    account_name: store.name,
                    account_number_mask: '****1234',
                    account_number: '1234567890' // Only shown after verification
                  }}
                  isOwner={true}
                />
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>Your account details are encrypted and only visible to you. Customers see a masked version until payment confirmation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Store Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#112e40] mb-1">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={store.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#112e40] mb-1">
                    Store URL
                  </label>
                  <input
                    type="text"
                    value={`${window.location.origin}/${store.slug}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#112e40] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={store.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#112e40]">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Product Status Toggle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={editingProduct.active}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      active: e.target.checked
                    })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="font-medium text-[#112e40]">
                      {editingProduct.active ? 'Product Active' : 'Product Restricted'}
                    </span>
                    <p className="text-sm text-[#112e40]">
                      {editingProduct.active 
                        ? 'This product is available for sale' 
                        : 'This product is hidden from customers'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-[#112e40] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    name: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-[#112e40] mb-1">
                  Price (₦)
                </label>
                <input
                  type="number"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    price: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-[#112e40] mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={editingProduct.stock_quantity}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    stock_quantity: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#112e40] mb-1">
                  Description
                </label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    description: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-[#112e40] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProduct}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <AddProductModal
          storeId={store.id}
          categories={categories}
          onClose={() => setShowAddProduct(false)}
          onSuccess={() => {
            refetch();
            refetchProducts();
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showCSVImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CSVImport
            storeId={store.id}
            onSuccess={() => {
              refetch();
              setShowCSVImport(false);
            }}
            onClose={() => setShowCSVImport(false)}
          />
        </div>
      )}
    </div>
  );
}

export default function StoreManagementPage() {
  return (
    <StoreProvider>
      <StoreManagementContent />
    </StoreProvider>
  );
}