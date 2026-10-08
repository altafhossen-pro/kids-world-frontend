'use client';

import React, { useEffect, useState } from 'react';
import { X, Menu, ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categoryAPI } from '@/services/api';

const SidebarCategoryItem = ({
  category,
  allCategories,
  handleCategoryClick,
  depth = 0,
  isOpen,
  index,
  isLast = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Find children
  const children = allCategories.filter(cat => cat.parent && (cat.parent === category._id || cat.parent._id === category._id));
  const hasChildren = children.length > 0;

  return (
    <div className={`relative transition-all duration-200 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: depth === 0 ? `${index * 30}ms` : '0ms' }}>
      {/* Subcategory connector lines for depth > 0 */}
      {depth > 0 && (
        <>
          {/* Vertical line segment */}
          <div
            className={`absolute left-0 w-[1.5px] bg-gray-300 ${isLast ? 'top-0 h-5' : 'top-0 h-full'}`}
          />
          {/* Horizontal line connector */}
          <div
            className="absolute left-0 top-5 w-4 h-[1.5px] bg-gray-300"
          />
        </>
      )}

      <div className={`flex items-center justify-between py-2 transition-all duration-150 group ${depth === 0
        ? 'px-4 hover:bg-orange-50/50'
        : 'pl-6 pr-3 hover:bg-orange-50/40 rounded-md my-0.5'
        }`}>
        <button
          onClick={() => handleCategoryClick(category)}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
        >
          {/* Category Image or Icon */}
          {category.image ? (
            <div className={`${depth === 0 ? 'w-7 h-7' : 'w-6 h-6'} rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center bg-white`}>
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className={`${depth === 0 ? 'w-7 h-7' : 'w-6 h-6'} rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0`}>
              <span className="text-blue-600 text-xs font-bold">
                {category.name?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            </div>
          )}

          {/* Category Name */}
          <div className="flex-1 min-w-0">
            <span className={`${depth === 0 ? 'text-[15px] font-medium text-gray-800' : 'text-sm font-normal text-gray-700'} group-hover:text-blue-600 transition-colors truncate block`}>
              {category.name}
            </span>
          </div>
        </button>

        {/* Chevron Icon for Expansion */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-1.5 -mr-1 flex-shrink-0 text-gray-400 hover:text-[#e65525] transition-colors rounded hover:bg-gray-100"
            aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-6"></div> // Placeholder for alignment
        )}
      </div>

      {/* Children tree container */}
      {isExpanded && hasChildren && (
        <div className="relative ml-7 my-1">
          {children.map((child, childIdx) => (
            <SidebarCategoryItem
              key={child._id || childIdx}
              category={child}
              allCategories={allCategories}
              handleCategoryClick={handleCategoryClick}
              depth={depth + 1}
              isOpen={true}
              index={childIdx}
              isLast={childIdx === children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategorySidebar({ isOpen, onClose, defaultTab = 'categories' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [allCategories, setAllCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [headerMenus, setHeaderMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync activeTab with defaultTab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  // Fetch categories and menus
  useEffect(() => {
    if (isOpen) {
      if (allCategories.length === 0) fetchCategories();
      if (headerMenus.length === 0) fetchHeaderMenus();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategories({ limit: 1000 });

      if (response.success) {
        const cats = response.data || [];
        const sortedCats = [...cats].sort((a, b) => {
          const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 999999;
          const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 999999;
          if (orderA !== orderB) return orderA - orderB;
          return (a.name || '').localeCompare(b.name || '');
        });
        setAllCategories(sortedCats);
        setMainCategories(sortedCats.filter(cat => !cat.parent));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAllCategories([]);
      setMainCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeaderMenus = async () => {
    try {
      const { menuAPI } = require('@/services/api');
      const response = await menuAPI.getHeaderMenus();
      if (response.success && response.data) {
        const transformedMenus = response.data
          .filter(menu => menu.isVisible && menu.isActive)
          .sort((a, b) => a.order - b.order)
        setHeaderMenus(transformedMenus);
      }
    } catch (e) { }
  };

  // Handle category click - navigate to shop with category filter
  const handleCategoryClick = (category) => {
    router.push(`/shop?category=${category.slug}`);
    onClose();
  };

  const handleMenuClick = (href) => {
    router.push(href);
    onClose();
  }

  // Handle view all categories
  const handleViewAll = () => {
    router.push('/categories');
    onClose();
  };

  // Body scroll lock when sidebar is open
  useEffect(() => {
    let scrollY = 0;

    if (isOpen) {
      // Save current scroll position
      scrollY = window.scrollY;

      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Disable body scroll and prevent layout shift
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restore body scroll and position
      const savedScrollY = parseInt(document.body.style.top || '0') * -1;

      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position
      if (savedScrollY > 0) {
        window.scrollTo(0, savedScrollY);
      }
    }

    // Cleanup function
    return () => {
      const savedScrollY = parseInt(document.body.style.top || '0') * -1;

      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position on cleanup
      if (savedScrollY > 0) {
        window.scrollTo(0, savedScrollY);
      }
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[9999] transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none' }}
      ></div>

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm sm:w-80 bg-white z-[10000] transform transition-transform duration-300 ease-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}>

        {/* Close Button on the outside right of drawer */}
        {isOpen && (
          <button
            onClick={onClose}
            className="absolute -right-11 top-4 p-2 bg-white rounded-full shadow-lg text-gray-800 transition-transform duration-200 hover:scale-110 cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Tabs Header */}
        <div className="flex w-full border-b border-gray-200">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'categories' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'menu' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-100' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Menu
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'categories' && (
            <div className="py-2">
              {loading ? (
                // Loading skeleton
                <div className="p-4 space-y-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-8 bg-gray-100 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : mainCategories.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Menu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No categories found</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {mainCategories.map((category, index) => (
                    <div key={category._id || index} className="border-b border-gray-100 last:border-b-0">
                      <SidebarCategoryItem
                        category={category}
                        allCategories={allCategories}
                        handleCategoryClick={handleCategoryClick}
                        isOpen={isOpen}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'menu' && (
            <div className="py-2">
              <div className="flex flex-col">
                <button onClick={() => handleMenuClick('/')} className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100">Home</button>
                <button onClick={() => handleMenuClick('/shop')} className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100">Shop</button>

                {headerMenus.map(menu => (
                  <button key={menu._id || menu.id} onClick={() => handleMenuClick(menu.href)} className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100">
                    {menu.name}
                  </button>
                ))}

                <button onClick={() => handleMenuClick('/contact-us')} className="text-left px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border-b border-gray-100">Contact</button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'categories' && !loading && mainCategories.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
            <button
              onClick={handleViewAll}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              View All Categories
            </button>
          </div>
        )}
      </div>
    </>
  );
}

