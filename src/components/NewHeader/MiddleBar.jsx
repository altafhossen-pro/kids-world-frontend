'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User, ShoppingCart, Menu, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import CartModal from '@/components/Cart/CartModal';
import MobileHeaderMenu from './MobileHeaderMenu';
import { productAPI } from '@/services/api';

const MiddleBar = ({ logoUrl }) => {
  const { user, isCartOpen, setIsCartOpen, cartTotal, cartCount } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await productAPI.searchProducts(searchQuery, { limit: 5 });
          if (res.success) {
            setSuggestions(res.data.slice(0, 5));
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error("Failed to fetch search suggestions:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="bg-blue-600 py-3 md:py-5 border-b border-blue-700">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 lg:gap-12">

        {/* Logo (Left) */}
        <Link href="/" className="flex-shrink-0">
          <img
            src={logoUrl || "/images/logo.webp"}
            alt="Kids World Logo"
            className="h-8 md:h-14 w-auto object-contain"
          />
        </Link>

        {/* Search Bar (Center / Flex-1) */}
        <div className="flex flex-1 md:max-w-3xl relative mx-2 md:mx-0" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex w-full border-2 border-gray-100 rounded-full focus-within:border-blue-500 transition-colors overflow-hidden h-[38px] md:h-[50px] shadow-sm relative bg-white z-10">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
              className="flex-1 px-3 md:px-6 outline-none text-xs md:text-sm text-gray-700 bg-white font-medium placeholder-gray-400"
            />

            <button type="submit" className="bg-white text-gray-800 px-4 md:px-8 hover:bg-gray-50 transition-colors flex items-center justify-center border-l border-gray-200">
              {isSearching ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Search className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[99]">
              {suggestions.map((product) => (
                <Link 
                  href={`/product/${product.slug}`} 
                  key={product._id}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                    <img 
                      src={product.featuredImage || '/images/placeholder.png'} 
                      alt={product.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-orange-600">৳{product.variants?.[0]?.currentPrice || 0}</span>
                      {product.variants?.[0]?.regularPrice > product.variants?.[0]?.currentPrice && (
                        <span className="text-xs text-gray-400 line-through">৳{product.variants?.[0]?.regularPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 flex-shrink-0">
          
          {/* Mobile Actions (Hamburger) */}
          <div className="flex md:hidden items-center gap-3">
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
