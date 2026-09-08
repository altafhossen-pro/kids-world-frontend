'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/NewHomepage/Products/ProductCard';
import { Filter, Search, ChevronDown, Check } from 'lucide-react';

import { productAPI, categoryAPI } from '@/services/api';

const BRANDS = ['Kids World', 'Mercedes', 'Audi', 'Lamborghini', 'Generic'];

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCat, setSelectedCat] = useState(categoryParam || 'All');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCat(categoryParam);
    }
  }, [categoryParam]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productAPI.getProducts({ limit: 100 }),
          categoryAPI.getCategories()
        ]);
        
        if (prodRes.success && prodRes.data) {
          const formattedProducts = prodRes.data.map(p => {
            const minPrice = p.calculatedPriceRange?.min || p.basePrice || 0;
            return {
              id: p._id,
              name: p.title,
              slug: p.slug,
              category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Uncategorized'),
              price: minPrice,
              originalPrice: null, // could add if discount logic exists
              discount: 0,
              rating: p.averageRating || 5.0,
              image: p.featuredImage || p.gallery?.[0]?.url || 'https://via.placeholder.com/400'
            };
          });
          setProducts(formattedProducts);
        }

        if (catRes.success && catRes.data) {
          setCategories(['All', ...catRes.data.map(c => c.name)]);
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter products based on selected category and search query
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
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
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCat(cat)}
                        className={`w-full flex items-center justify-between text-sm py-1.5 transition-colors ${selectedCat === cat ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600 font-medium'}`}
                      >
                        {cat}
                        {selectedCat === cat && <Check className="w-4 h-4" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <p className="text-sm font-bold text-gray-800 mb-3">Price Range</p>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                  <span className="text-gray-400">-</span>
                  <input type="number" placeholder="Max" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Brands */}
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">Brands</p>
                <ul className="space-y-2.5">
                  {BRANDS.map(brand => (
                    <li key={brand} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" id={brand} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor={brand} className="text-sm text-gray-600 font-medium cursor-pointer flex-1">{brand}</label>
                    </li>
                  ))}
                </ul>
              </div>
              
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-gray-700">
                Showing <span className="text-blue-600">{filteredProducts.length}</span> products
              </p>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className="text-gray-500">Sort by:</span>
                <select className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:outline-none focus:border-blue-500 text-gray-700 font-bold cursor-pointer">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
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
                  onClick={() => { setSelectedCat('All'); setSearch(''); }}
                  className="mt-6 text-blue-600 font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
            
            {/* Pagination Placeholder */}
            {filteredProducts.length > 0 && (
              <div className="mt-10 flex justify-center gap-2">
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 font-bold transition-colors shadow-sm">{'<'}</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 border border-blue-600 text-white font-bold shadow-md shadow-blue-100">1</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 font-bold transition-colors shadow-sm">2</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 font-bold transition-colors shadow-sm">3</button>
                <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 font-bold transition-colors shadow-sm">{'>'}</button>
              </div>
            )}
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
