'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Home, ShoppingCart, Clock, User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function PaymentConfirmation() {
  const [timeRemaining, setTimeRemaining] = useState(179); // 2:59 in seconds
  const [orderStatus, setOrderStatus] = useState('pending');
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.store as string;
  
  // Mock order data - in real app, get from URL params or API
  const orderData = {
    paymentId: 'OPAY:12343432323',
    accountNumber: 'Account Number',
    items: [
      { id: '1', name: 'Coca Cola 35cl', status: 'Confirmed' },
      { id: '2', name: 'Pringles Original', status: 'Confirmed' },
      { id: '3', name: 'Fresh Bananas', status: 'Confirmed' },
      { id: '4', name: 'Bread Loaf', status: 'Confirmed' },
      { id: '5', name: 'Rice 5kg', status: 'Confirmed' },
      { id: '6', name: 'Chicken 1kg', status: 'Confirmed' }
    ]
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          // Redirect to delivery tracking when timer ends
          router.push(`/${storeSlug}/delivery-tracking`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, storeSlug]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}mins`;
  };

  // Calculate progress percentage
  const progressPercentage = (timeRemaining / 179) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-green-600 font-medium"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {/* Payment ID Section */}
        <section aria-labelledby="payment-id" className="text-center mb-8">
          <h1 
            id="payment-id" 
            className="text-xl font-bold text-[#112e40] mb-2"
          >
            {orderData.paymentId}
          </h1>
          <p className="text-sm text-gray-500">
            {orderData.accountNumber}
          </p>
        </section>

        {/* Timer Circle */}
        <section 
          aria-labelledby="payment-status"
          className="flex justify-center mb-8"
        >
          <div className="relative w-48 h-48">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#10B981"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            
            {/* Timer text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p 
                className="text-3xl font-bold text-[#112e40]"
                role="timer"
                aria-live="polite"
              >
                {formatTime(timeRemaining)}
              </p>
              <p 
                id="payment-status"
                className="text-sm text-gray-500 mt-2"
              >
                Waiting to confirm payment
              </p>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section aria-labelledby="order-summary">
          <h2 
            id="order-summary"
            className="text-xl font-bold text-[#112e40] mb-6"
          >
            Order Summary
          </h2>
          
          <ul 
            className="space-y-4"
            role="list"
            aria-label="Order items list"
          >
            {orderData.items.map((item, index) => (
              <li 
                key={item.id}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  {/* Green status indicator */}
                  <div 
                    className="w-4 h-4 rounded-full bg-green-500"
                    role="status"
                    aria-label="Item confirmed"
                  />
                  <span className="text-base text-[#112e40] font-medium">
                    {item.name}
                  </span>
                </div>
                
                <span className="text-base text-green-600 font-medium">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav 
        className="md:hidden sticky bottom-0 bg-white border-t border-gray-200"
        aria-label="Main navigation"
      >
        <ul className="grid grid-cols-4 py-2" role="list">
          <li>
            <button 
              onClick={() => router.push(`/${storeSlug}`)}
              className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-green-600 transition"
              aria-label="Go to home"
            >
              <Home className="h-6 w-6" />
            </button>
          </li>
          
          <li>
            <button 
              className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-green-600 transition"
              aria-label="View shopping cart"
            >
              <ShoppingCart className="h-6 w-6" />
            </button>
          </li>
          
          <li>
            <button 
              className="flex flex-col items-center justify-center py-3 text-green-600"
              aria-label="Track order (current page)"
              aria-current="page"
            >
              <Clock className="h-6 w-6" />
              <span className="w-2 h-2 rounded-full bg-green-600 mt-1" aria-hidden="true" />
            </button>
          </li>
          
          <li>
            <button 
              className="flex flex-col items-center justify-center py-3 text-gray-400 hover:text-green-600 transition"
              aria-label="View profile"
            >
              <User className="h-6 w-6" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}