'use client';

import React, { useEffect, useState } from 'react';
import { X, Menu, ChevronRight, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categoryAPI } from '@/services/api';

const SidebarCategoryItem = ({ category, allCategories, handleCategoryClick, depth = 0, isOpen, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Find children
  const children = allCategories.filter(cat => cat.parent && (cat.parent === category._id || cat.parent._id === category._id));
  const hasChildren = children.length > 0;

  return (
    <div className={`transition-all duration-200 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ transitionDelay: depth === 0 ? `${index * 50}ms` : '0ms' }}>
      <div className={`flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-all duration-200 group ${depth > 0 ? 'ml-6 border-l-2 border-gray-100' : ''}`}>
        <button
          onClick={() => handleCategoryClick(category)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          {/* Category Image or Icon (only for top level) */}
          {depth === 0 && (
            category.image ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-base font-bold">
                  {category.name?.charAt(0)?.toUpperCase() || 'C'}
                </span>
              </div>
            )
          )}
          
          {/* Category Name */}
          <div className="flex-1 min-w-0">
            <h3 className={`${depth === 0 ? 'font-medium' : 'text-sm'} text-gray-800 group-hover:text-[#2563EB] transition-colors truncate`}>
              {category.name}
            </h3>
          </div>
        </button>

        {/* Chevron Icon for Expansion */}
        {hasChildren ? (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="p-2 -mr-2 flex-shrink-0 text-gray-400 hover:text-[#2563EB] transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        ) : (
          <div className="w-9"></div> // Placeholder for alignment
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-1 flex flex-col gap-1">
          {children.map((child, childIdx) => (
            <SidebarCategoryItem
              key={child._id || childIdx}
              category={child}
              allCategories={allCategories}
              handleCategoryClick={handleCategoryClick}
              depth={depth + 1}
              isOpen={true} // child animations not needed when already open
              index={childIdx}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategorySidebar({ isOpen, onClose }) {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    if (isOpen && allCategories.length === 0) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getCategories({ limit: 1000 });

      if (response.success) {
        const cats = response.data || [];
        setAllCategories(cats);
        setMainCategories(cats.filter(cat => !cat.parent));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setAllCategories([]);
      setMainCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle category click - navigate to shop with category filter
  const handleCategoryClick = (category) => {
    router.push(`/shop?category=${category.slug}`);
    onClose();
  };

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
        className={`fixed inset-0 bg-black z-[9999] transition-all duration-300 ease-out ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        style={{ display: isOpen ? 'block' : 'none' }}
      ></div>

      {/* Category Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-white z-[10000] transform transition-all duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
          <div className="flex items-center gap-2">
            <Menu className="w-6 h-6 text-[#2563EB]" />
            <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hover:scale-110"
            aria-label="Close categories"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Categories List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // Loading skeleton
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-12 bg-gray-100 rounded-lg animate-pulse transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                ></div>
              ))}
            </div>
          ) : mainCategories.length === 0 ? (
            <div className={`text-center py-8 px-4 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Menu className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No categories found</h3>
              <p className="text-sm text-gray-500">Categories will appear here</p>
            </div>
          ) : (
            <div className="p-2 flex flex-col gap-2">
              {mainCategories.map((category, index) => (
                <SidebarCategoryItem
                  key={category._id || index}
                  category={category}
                  allCategories={allCategories}
                  handleCategoryClick={handleCategoryClick}
                  isOpen={isOpen}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer - View All Button */}
        {!loading && mainCategories.length > 0 && (
          <div className={`border-t border-gray-200 p-4 flex-shrink-0 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <button
              onClick={handleViewAll}
              className="w-full bg-[#2563EB] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#D63447] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] hover:shadow-lg"
            >
              <Menu className="w-5 h-5" />
              <span>View All Categories</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}

