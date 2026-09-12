'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, User, ShoppingCart, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import CartModal from '@/components/Cart/CartModal';
import MobileHeaderMenu from './MobileHeaderMenu';

const MiddleBar = ({ logoUrl }) => {
  const { user, isCartOpen, setIsCartOpen, cartTotal, cartCount } = useAppContext();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-blue-600 py-3 md:py-5 border-b border-blue-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-y-4 gap-x-4 lg:gap-12">

        {/* Logo (Left) */}
        <Link href="/" className="flex-shrink-0">
          <img
            src={logoUrl || "/images/logo.webp"}
            alt="Kids World Logo"
            className="h-10 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Search Bar (Center / Full width on mobile) */}
        <div className={`${isMobileSearchOpen ? 'flex' : 'hidden'} w-full md:flex-1 md:max-w-3xl order-last md:order-none md:flex`}>
          <div className="flex w-full border-2 border-gray-100 rounded-full focus-within:border-blue-500 transition-colors overflow-hidden h-[42px] md:h-[50px] shadow-sm">
            <input
              type="text"
              placeholder="Search for toys, ride-ons, baby care & more..."
              className="flex-1 px-4 md:px-6 outline-none text-sm text-gray-700 bg-white font-medium placeholder-gray-400"
            />

            <button className="bg-orange-500 text-white px-5 md:px-8 hover:bg-orange-600 transition-colors flex items-center justify-center">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 flex-shrink-0">
          
          {/* Mobile Actions (Search Toggle & Hamburger) */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} 
              className="p-2 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              {isMobileSearchOpen ? <X className="w-6 h-6 text-white" /> : <Search className="w-6 h-6 text-white" />}
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Desktop Actions (User & Cart) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 flex-shrink-0">
            {user ? (
            <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-blue-500 border border-blue-400 flex items-center justify-center overflow-hidden transition-all group-hover:bg-blue-400">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs text-blue-100 font-medium">Welcome</p>
                <p className="text-sm font-bold text-white truncate max-w-[120px]">{user.name || 'User'}</p>
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-3 group">
              <div className="p-2.5 rounded-full bg-blue-500 border border-blue-400 group-hover:bg-blue-400 group-hover:border-blue-300 transition-all">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs text-blue-100 font-medium">My Account</p>
                <p className="text-sm font-bold text-white">Login / Register</p>
              </div>
            </Link>
          )}

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 group border-none bg-transparent outline-none cursor-pointer"
          >
            <div className="relative p-2.5 rounded-full bg-blue-500 border border-blue-400 group-hover:bg-blue-400 group-hover:border-blue-300 transition-all">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[11px] font-bold w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-sm">
                {cartCount || 0}
              </span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs text-blue-100 font-medium">My Cart</p>
              <p className="text-sm font-bold text-white">৳ {cartTotal?.toLocaleString() || '0.00'}</p>
            </div>
          </button>
          </div>
        </div>

      </div>
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Mobile Header Menu Sidebar */}
      <MobileHeaderMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
};

export default MiddleBar;
