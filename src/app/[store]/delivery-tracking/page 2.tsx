'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { StoreProvider, useStoreContext } from '@/providers/StoreProvider';
import { orderQueries } from '@/lib/supabase/queries';
import { toast } from 'react-hot-toast';

function DeliveryTrackingContent() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeSlug = params.store as string;
  const orderId = searchParams.get('order');
  const { store } = useStoreContext();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const orderData = await orderQueries.getById(orderId!);
      setOrder(orderData);
    } catch (error: any) {
      setError('Order not found');
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    return steps.indexOf(status);
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your order has been placed and is awaiting confirmation';
      case 'confirmed':
        return 'Your order has been confirmed and payment received';
      case 'preparing':
        return 'Your order is being prepared';
      case 'ready':
        return 'Your order is ready for pickup/delivery';
      case 'delivered':
        return 'Your order has been delivered';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  const getEstimatedTime = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Waiting for confirmation';
      case 'confirmed':
        return '15-30 minutes';
      case 'preparing':
        return '10-20 minutes';
      case 'ready':
        return 'Ready now';
      case 'delivered':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-[#112e40]">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-[#112e40] mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/${storeSlug}`)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);
  const steps = [
    { 
      id: 'pending', 
      name: 'Order Placed', 
      icon: Clock, 
      description: 'Order received' 
    },
    { 
      id: 'confirmed', 
      name: 'Confirmed', 
      icon: CheckCircle, 
      description: 'Payment verified' 
    },
    { 
      id: 'preparing', 
      name: 'Preparing', 
      icon: Clock, 
      description: 'In the kitchen' 
    },
    { 
      id: 'ready', 
      name: 'Ready', 
      icon: CheckCircle, 
      description: 'Ready for delivery' 
    },
    { 
      id: 'delivered', 
      name: 'Delivered', 
      icon: Truck, 
      description: 'Order complete' 
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#112e40] hover:text-[#112e40]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#112e40]">Order #{order.order_number}</h1>
              <p className="text-gray-600">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#112e40]">₦{order.total?.toLocaleString()}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
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
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{getStatusMessage(order.status)}</p>
            <p className="text-blue-600 text-sm mt-1">
              Estimated time: {getEstimatedTime(order.status)}
            </p>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#112e40] mb-6">Order Progress</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 w-[calc(100%-3rem)] h-0.5 bg-gray-200">
              <div 
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index <= currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-center mt-2">
                      <p className={`text-sm font-medium ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Map Placeholder */}
        {(order.status === 'ready' || order.status === 'delivered') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#112e40] mb-4">Live Tracking</h2>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Live Tracking Map</p>
                <p className="text-sm text-gray-500">Driver location updates in real-time</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-[#112e40] mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_item?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.product_snapshot?.image || item.product?.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop'}
                      alt={item.product_snapshot?.name || item.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#112e40]">
                      {item.product_snapshot?.name || item.product?.name}
                    </h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium text-[#112e40]">
                      ₦{item.total_price?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Store Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#112e40] mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    👤
                  </div>
                  <span className="text-[#112e40]">{order.customer_name}</span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-[#112e40]">{order.customer_phone}</span>
                  </div>
                )}
                {order.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-[#112e40]">{order.customer_email}</span>
                  </div>
                )}
                {order.delivery_address?.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <span className="text-[#112e40]">{order.delivery_address.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Store Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#112e40] mb-4">Store Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    🏪
                  </div>
                  <span className="text-[#112e40] font-medium">{store?.name}</span>
                </div>
                {store?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`tel:${store.phone}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      {store.phone}
                    </a>
                  </div>
                )}
                {store?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a 
                      href={`mailto:${store.email}`}
                      className="text-green-600 hover:text-green-700"
                    >
                      {store.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push(`/${storeSlug}`)}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => window.location.href = `tel:${store?.phone}`}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Contact Store
          </button>
        </div>
      </div>
    </div>
  );
}