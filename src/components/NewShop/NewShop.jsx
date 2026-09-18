'use client';
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/NewHomepage/Products/ProductCard';
import { Filter, Search, ChevronDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

import { productAPI, categoryAPI } from '@/services/api';

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const sortParam = searchParams.get('sort');
  
  const [selectedCat, setSelectedCat] = useState(categoryParam || 'All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sort, setSort] = useState(sortParam || 'recommended');
  
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([{ _id: 'all', name: 'All' }]);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle filter changes that should reset page
  const handleFilterChange = () => {
    setPage(1);
  };

  // Fetch initial data (Categories and Brands)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          categoryAPI.getCategories(),
          productAPI.getBrands()
        ]);
        
        if (catRes.success && catRes.data) {
          setCategories([{ _id: 'all', name: 'All' }, ...catRes.data]);
        }
        
        if (brandRes.success && brandRes.data) {
          setBrands(brandRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch products when filters or page change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 12
        };

        // Add Search
        if (debouncedSearch) {
          params.search = debouncedSearch;
        }

        // Add Category
        if (selectedCat !== 'All') {
          const catObj = categories.find(c => c.name === selectedCat);
          if (catObj && catObj._id !== 'all') {
            params.category = catObj._id;
          }
        }

        // Add Brands
        if (selectedBrands.length > 0) {
          params.brand = selectedBrands.join(',');
        }

        // Add Sort
        switch (sort) {
          case 'price-asc':
            params.sort = 'basePrice';
            break;
          case 'price-desc':
            params.sort = '-basePrice';
            break;
          case 'new-arrivals':
            params.sort = '-createdAt';
            break;
          case 'best-sellers':
            params.sort = '-displayTotalSold'; // Assuming backend supports sorting by totalSold or displayTotalSold
            break;
          default:
            // recommended: no specific sort, backend defaults to sortOrder -createdAt
            break;
        }

        const prodRes = await productAPI.getProducts(params);
        
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
          setTotalPages(prodRes.pagination?.totalPages || 1);
          setTotalProducts(prodRes.pagination?.totalProducts || prodRes.data.length);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalProducts(0);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if categories are loaded so we can map category name to ID
    if (categories.length > 1 || selectedCat === 'All') {
      fetchProducts();
    }
  }, [page, debouncedSearch, selectedCat, selectedBrands, sort, categories]);

  // Generate pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    
    if (page <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    
    if (page >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button 
          key={i} 
          onClick={() => { setPage(i); window.scrollTo(0, 0); }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors shadow-sm ${page === i ? 'bg-blue-600 border border-blue-600 text-white shadow-md shadow-blue-100' : 'bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300'}`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="mt-10 flex justify-center gap-2">
        <button 
          onClick={() => { setPage(Math.max(1, page - 1)); window.scrollTo(0, 0); }}
          disabled={page === 1}
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors shadow-sm ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100' : 'bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 cursor-pointer'}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {pages}
        
        <button 
          onClick={() => { setPage(Math.min(totalPages, page + 1)); window.scrollTo(0, 0); }}
          disabled={page === totalPages}
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors shadow-sm ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100' : 'bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 cursor-pointer'}`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">Shop All Products</h1>
          <p className="text-gray-500 font-medium">Find the perfect toys, rides, and learning tools for your kids.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <span className="font-bold text-gray-800">Filters</span>
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="bg-blue-50 text-blue-600 p-2 rounded-lg"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-extrabold text-gray-900">Filters</h2>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-800 mb-3">Search</p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-800 mb-3">Categories</p>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat._id}>
                      <button
                        onClick={() => { setSelectedCat(cat.name); handleFilterChange(); }}
                        className={`w-full flex items-center justify-between text-sm py-1.5 transition-colors ${selectedCat === cat.name ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600 font-medium'}`}
                      >
                        {cat.name}
                        {selectedCat === cat.name && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brands */}
              {brands.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">Brands</p>
                  <ul className="space-y-2.5">
                    {brands.map(brand => (
                      <li key={brand} className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          id={brand} 
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(b => b !== brand));
                            }
                            handleFilterChange();
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                        />
                        <label htmlFor={brand} className="text-sm text-gray-600 font-medium cursor-pointer flex-1">{brand}</label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-gray-700">
                Showing <span className="text-blue-600">{products.length}</span> of <span className="text-blue-600">{totalProducts}</span> products
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-gray-500">Sort by:</span>
                <select 
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
                  className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-500 text-gray-700 font-bold cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="new-arrivals">Newest Arrivals</option>
                  <option value="best-sellers">Best Sellers</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {products.map(product => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 font-medium">Try adjusting your filters or searching for something else.</p>
                <button 
                  onClick={() => { setSelectedCat('All'); setSearch(''); setSelectedBrands([]); setSort('recommended'); handleFilterChange(); }}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
            
            {/* Pagination Placeholder */}
            {renderPagination()}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function NewShop() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
