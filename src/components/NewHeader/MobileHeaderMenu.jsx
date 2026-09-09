'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { menuAPI } from '@/services/api';

const MobileHeaderMenu = ({ isOpen, onClose }) => {
  const [leftMenus, setLeftMenus] = useState([]);
  const [rightMenus, setRightMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await menuAPI.getHeaderMenus();
        if (response.success && response.data) {
          const left = response.data
            .filter((m) => m.section === 'leftMenu' && m.isVisible)
            .sort((a, b) => a.order - b.order);
          const right = response.data
            .filter((m) => m.section === 'rightMenu' && m.isVisible)
            .sort((a, b) => a.order - b.order);
            
          setLeftMenus(left);
          setRightMenus(right);
        }
      } catch (error) {
        console.error('Failed to load header menus:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && leftMenus.length === 0) {
      fetchMenus();
    }
  }, [isOpen]);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[999] transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] bg-white z-[1000] transition-transform duration-300 transform md:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-full bg-gray-100 animate-pulse rounded-lg"></div>
            ))
          ) : (
            <>
              {leftMenus.length > 0 && leftMenus.map((menu) => (
                <Link
                  key={menu._id}
                  href={menu.href || menu.link || '#'}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  <span>{menu.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}

              {(leftMenus.length > 0 && rightMenus.length > 0) && (
                <div className="h-px bg-gray-200 my-2"></div>
              )}

              {rightMenus.length > 0 && rightMenus.map((menu) => (
                <Link
                  key={menu._id}
                  href={menu.href || menu.link || '#'}
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                >
                  <span>{menu.name}</span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              ))}

              {(leftMenus.length === 0 && rightMenus.length === 0) && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No menus available
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileHeaderMenu;
