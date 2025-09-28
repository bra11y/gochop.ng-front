import React from 'react';
import Image from 'next/image';
import { Search, ShoppingBag, User, Bell, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Image src="/logo.svg" alt="FoodCart" width={140} height={40} />
      </div>
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full bg-gray-100 border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-600 hover:text-orange-500">
          <ShoppingBag size={24} />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </button>
        <button className="text-gray-600 hover:text-orange-500">
          <Bell size={24} />
        </button>
        <div className="flex items-center space-x-2">
          <Image src="/avatar.png" alt="User" width={32} height={32} className="rounded-full" />
          <span className="hidden md:block text-sm font-medium">Admin</span>
        </div>
        <button className="md:hidden">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
