'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { Dialog, Transition } from '@headlessui/react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Cart() {
  const router = useRouter();
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    toggleCart();
    router.push('/checkout');
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={toggleCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <ShoppingBag className="h-5 w-5" />
                          Shopping Cart ({items.length})
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={toggleCart}
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Cart Items */}
                      <div className="mt-8">
                        {items.length === 0 ? (
                          <div className="text-center py-12">
                            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Your cart is empty</p>
                            <button
                              onClick={toggleCart}
                              className="mt-4 text-green-600 hover:text-green-700 font-medium"
                            >
                              Continue Shopping
                            </button>
                          </div>
                        ) : (
                          <div className="flow-root">
                            <ul className="-my-6 divide-y divide-gray-200">
                              {items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                      src={item.image || '/api/placeholder/100/100'}
                                      alt={item.name}
                                      width={100}
                                      height={100}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>
                                  
                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3>{item.name}</h3>
                                        <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {formatCurrency(item.price)} each
                                      </p>
                                    </div>
                                    
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="p-1 rounded-md hover:bg-gray-100"
                                        >
                                          <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="px-2 py-1 min-w-[2rem] text-center">
                                          {item.quantity}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="p-1 rounded-md hover:bg-gray-100"
                                        >
                                          <Plus className="h-4 w-4" />
                                        </button>
                                      </div>
                                      
                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-red-600 hover:text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Footer */}
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Subtotal</p>
                          <p>{formatCurrency(getTotalPrice())}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Shipping and taxes calculated at checkout.
                        </p>
                        
                        <div className="mt-6">
                          <button
                            onClick={handleCheckout}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
                          >
                            Checkout
                          </button>
                        </div>
                        
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                          <button
                            type="button"
                            className="font-medium text-green-600 hover:text-green-500"
                            onClick={toggleCart}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}