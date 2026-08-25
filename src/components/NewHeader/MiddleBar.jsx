import React from 'react';
import { Search, ChevronDown, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const MiddleBar = () => {
  return (
    <div className="bg-white py-5 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 lg:gap-12">

        {/* Logo (Left) */}
        <Link href="/" className="flex-shrink-0">
          <img
            src="/images/logo.webp"
            alt="Kids World Logo"
            className="h-10 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Search Bar (Center) */}
        <div className="flex-1 max-w-3xl hidden md:flex">
          <div className="flex w-full border-2 border-gray-100 rounded-full focus-within:border-blue-500 transition-colors overflow-hidden h-[50px] shadow-sm">
            <input
              type="text"
              placeholder="Search for toys, ride-ons, baby care & more..."
              className="flex-1 px-6 outline-none text-sm text-gray-700 bg-gray-50/30 font-medium placeholder-gray-400"
            />

            <div className="flex items-center bg-gray-50/50 px-5 border-l border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              <span className="text-sm text-gray-600 font-semibold">All Categories</span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
            </div>

            <button className="bg-[#1877F2] text-white px-8 hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-6 lg:gap-8 flex-shrink-0">
          <Link href="/login" className="flex items-center gap-3 group">
            <div className="p-2.5 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <User className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs text-gray-500 font-semibold">My Account</p>
              <p className="text-sm font-extrabold text-gray-800">Login / Register</p>
            </div>
          </Link>

          <Link href="/cart" className="flex items-center gap-3 group">
            <div className="relative p-2.5 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
              <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[11px] font-bold w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm">
                2
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs text-gray-500 font-semibold">My Cart</p>
              <p className="text-sm font-extrabold text-gray-800">৳0.00</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MiddleBar;
