import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const NavigationBar = () => {
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop', hasDropdown: true },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Best Sellers', href: '/best-sellers' },
    { name: 'Offers', href: '/offers' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact Us', href: '/contact-us' },
  ];

  return (
    <div className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        
        {/* All Categories Button */}
        <div className="relative flex-shrink-0 -mt-2">
          <button className="bg-[#1877F2] text-white px-8 py-3.5 rounded-b-2xl flex items-center gap-3 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
            <Menu className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wide">All Categories</span>
          </button>
        </div>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 ml-10">
          {navLinks.map((link, index) => (
            <Link 
              key={index} 
              href={link.href}
              className={`flex items-center gap-1 py-4 text-[15px] font-bold transition-colors ${
                link.name === 'Home' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {link.name}
              {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-gray-500" />}
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
};

export default NavigationBar;
