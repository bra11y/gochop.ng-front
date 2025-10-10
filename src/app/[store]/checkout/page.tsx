'use client';

import { useState } from 'react';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useStoreContext, StoreProvider } from '@/providers/StoreProvider';
import { orderQueries } from '@/lib/supabase/queries';
import { toast } from 'react-hot-toast';

function CheckoutPageContent() {
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.store as string;
  const { items, total, clearCart } = useCartStore();
  const { store } = useStoreContext();

  const bankDetails = {
    bankName: 'First Bank of Nigeria',
    accountName: 'FoodCart Store Account',
    accountNumber: '2048756321',
    amount: total.toLocaleString()
  };

  const orderNumber = `ORD-${Date.now()}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const confirmPayment = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error('Please fill in your name and phone number');
      return;
    }

    if (!store) {
      toast.error('Store not found');
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      // Create the order
      const order = await orderQueries.create({
        store_id: store.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: 'pending',
        subtotal: total,
        tax: 0,
        delivery_fee: 0,
        total: total,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone,
        delivery_address: customerInfo.address ? { 
          address: customerInfo.address 
        } : {}
      });

      // Create order items
      const orderItems = items.map(item => ({
        order_id: (order as any).id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        product_snapshot: {
          name: item.name,
          image: item.image,
          description: item.description
        }
      }));

      await orderQueries.createItems(orderItems);

      setPaymentConfirmed(true);
      toast.success('Order created! Redirecting...');
      
      setTimeout(() => {
        clearCart();
        router.push(`/${storeSlug}/payment-confirmation?order=${(order as any).id}`);
      }, 2000);
      
    } catch (error: any) {
      toast.error('Failed to create order: ' + error.message);
      console.error('Order creation error:', error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#112e40] mb-2">No items in cart</h2>
          <button 
            onClick={() => router.push(`/${storeSlug}`)}
            className="text-green-600 hover:text-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#112e40] hover:text-[#112e40]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#112e40] mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#112e40] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#112e40] mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+234 800 000 0000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#112e40] mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#112e40] mb-1">
                Delivery Address (Optional)
              </label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Your delivery address"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#112e40] mb-4">Order Summary</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="text-[#112e40]">{item.name}</span>
                  <span className="text-gray-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium">₦{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-[#112e40]">
            Order Number: <span className="font-medium">{orderNumber}</span>
          </div>
        </div>

        {/* Bank Transfer Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#112e40] mb-6">Bank Transfer Details</h2>
          
          <div className="space-y-4">
            {/* Bank Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-[#112e40] mb-2">Bank Name</label>
              <div className="flex items-center justify-between">
                <span className="text-[#112e40] font-medium">{bankDetails.bankName}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails.bankName, 'Bank Name')}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                >
                  {copied === 'Bank Name' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'Bank Name' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-[#112e40] mb-2">Account Name</label>
              <div className="flex items-center justify-between">
                <span className="text-[#112e40] font-medium">{bankDetails.accountName}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountName, 'Account Name')}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                >
                  {copied === 'Account Name' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'Account Name' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-blue-700 mb-2">Account Number</label>
              <div className="flex items-center justify-between">
                <span className="text-blue-900 font-bold text-lg">{bankDetails.accountNumber}</span>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber, 'Account Number')}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                >
                  {copied === 'Account Number' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'Account Number' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <label className="block text-sm font-medium text-green-700 mb-2">Amount to Transfer</label>
              <div className="flex items-center justify-between">
                <span className="text-green-900 font-bold text-xl">₦{bankDetails.amount}</span>
                <button
                  onClick={() => copyToClipboard(total.toString(), 'Amount')}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm"
                >
                  {copied === 'Amount' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied === 'Amount' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Payment Instructions</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Transfer the exact amount to the account above</li>
              <li>2. Use your order number <strong>{orderNumber}</strong> as reference</li>
              <li>3. Click "I have made payment" below after transfer</li>
              <li>4. Keep your receipt for verification</li>
            </ol>
          </div>

          {/* Confirm Payment Button */}
          <button
            onClick={confirmPayment}
            disabled={paymentConfirmed || isCreatingOrder || !customerInfo.name || !customerInfo.phone}
            className={`w-full mt-6 py-3 rounded-lg font-medium transition-all ${
              paymentConfirmed
                ? 'bg-green-600 text-white'
                : !customerInfo.name || !customerInfo.phone
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isCreatingOrder ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating Order...
              </div>
            ) : paymentConfirmed ? (
              '✓ Order Created'
            ) : (
              'I have made payment'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Your order will be processed once payment is verified
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <StoreProvider>
      <CheckoutPageContent />
    </StoreProvider>
  );
}