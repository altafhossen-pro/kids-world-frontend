'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { menuAPI } from '@/services/api';

const NavigationBar = () => {
  const [leftMenu, setLeftMenu] = useState([]);
  const [rightMenu, setRightMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await menuAPI.getHeaderMenus();
        if (response.success && response.data) {
          const left = response.data.filter(m => m.section === 'leftMenu' && m.isVisible).sort((a, b) => a.order - b.order);
          const right = response.data.filter(m => m.section === 'rightMenu' && m.isVisible).sort((a, b) => a.order - b.order);
          setLeftMenu(left);
          setRightMenu(right);
        }
      } catch (error) {
        console.error('Failed to fetch header menus:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenus();
  }, []);

  return (
    <div className="hidden lg:block bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-[60px]">

        {/* Left Nav Links */}
        <nav className="flex items-center gap-8 ml-0">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={`left-skel-${i}`} className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
            ))
          ) : (
            leftMenu.map((link) => (
              <Link
                key={link._id}
                href={link.href}
                className={`flex items-center gap-1 py-4 text-[15px] font-bold transition-colors text-gray-700 hover:text-blue-600`}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-gray-500" />}
              </Link>
            ))
          )}
        </nav>

        {/* Right Nav Links */}
        <nav className="flex items-center gap-8 ml-auto">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={`right-skel-${i}`} className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            ))
          ) : (
            rightMenu.map((link) => (
              <Link
                key={link._id}
                href={link.href}
                className={`flex items-center gap-1 py-4 text-[15px] font-bold transition-colors text-gray-700 hover:text-blue-600`}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 ml-0.5 text-gray-500" />}
              </Link>
            ))
          )}
        </nav>

      </div>
    </div>
  );
};

export default NavigationBar;
