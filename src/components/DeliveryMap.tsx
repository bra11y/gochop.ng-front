'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock } from 'lucide-react';

interface DeliveryMapProps {
  orderStatus: string;
  customerAddress?: string;
  storeAddress?: string;
  estimatedDeliveryTime?: string;
}

export default function DeliveryMap({ 
  orderStatus, 
  customerAddress, 
  storeAddress,
  estimatedDeliveryTime 
}: DeliveryMapProps) {
  const [driverLocation, setDriverLocation] = useState({
    lat: 6.5244, // Lagos coordinates as default
    lng: 3.3792
  });

  // Simulate driver movement for demo purposes
  useEffect(() => {
    if (orderStatus === 'ready' || orderStatus === 'delivered') {
      const interval = setInterval(() => {
        setDriverLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [orderStatus]);

  const getMapEmbedUrl = () => {
    // This would typically use a proper map service like Google Maps or Mapbox
    // For demo purposes, we'll show a placeholder map
    const query = customerAddress ? encodeURIComponent(customerAddress) : 'Lagos,Nigeria';
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${query}&zoom=14`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#112e40]">Live Tracking</h2>
        {orderStatus === 'ready' && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Driver en route</span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative bg-gray-100 rounded-lg h-64 overflow-hidden mb-4">
        {/* Placeholder Map - In production, this would be replaced with actual map integration */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <p className="text-gray-700 font-medium">Interactive Map</p>
            <p className="text-sm text-gray-500">Real-time delivery tracking</p>
          </div>
        </div>

        {/* Driver Location Indicator */}
        {(orderStatus === 'ready') && (
          <div className="absolute top-4 left-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Driver Location
            </div>
          </div>
        )}

        {/* Destination Marker */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Destination
          </div>
        </div>
      </div>

      {/* Delivery Information */}
      <div className="space-y-3">
        {storeAddress && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
              🏪
            </div>
            <div>
              <p className="text-sm font-medium text-[#112e40]">Pickup Location</p>
              <p className="text-sm text-gray-600">{storeAddress}</p>
            </div>
          </div>
        )}

        {customerAddress && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-500 mt-1" />
            <div>
              <p className="text-sm font-medium text-[#112e40]">Delivery Address</p>
              <p className="text-sm text-gray-600">{customerAddress}</p>
            </div>
          </div>
        )}

        {estimatedDeliveryTime && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-[#112e40]">Estimated Delivery</p>
              <p className="text-sm text-gray-600">{estimatedDeliveryTime}</p>
            </div>
          </div>
        )}
      </div>

      {/* Status-based Information */}
      {orderStatus === 'preparing' && (
        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-orange-800 text-sm">
            📦 Your order is being prepared. Driver will be assigned soon.
          </p>
        </div>
      )}

      {orderStatus === 'ready' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            🚗 Driver is on the way to your location. Track live updates above.
          </p>
        </div>
      )}

      {orderStatus === 'delivered' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">
            ✅ Order delivered successfully! Thank you for your business.
          </p>
        </div>
      )}
    </div>
  );
}