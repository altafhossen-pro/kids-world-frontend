'use client';
import React, { useState } from 'react';
import ProductCard from '@/components/NewHomepage/Products/ProductCard';
import { Filter, Search, ChevronDown, Check } from 'lucide-react';

const FAKE_CATEGORIES = ['All', 'Ride On Cars', 'Scooters', 'Bicycles', 'Toys & Games', 'Learning', 'Baby', 'Outdoor'];
const FAKE_BRANDS = ['Kids World', 'Mercedes', 'Audi', 'Lamborghini', 'Generic'];

const FAKE_PRODUCTS = [
  { id: 1, name: 'Kids Electric Ride On Car 12V', category: 'Ride On Cars', price: 8990, originalPrice: 11000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: '3-Wheel LED Scooter Pink', category: 'Scooters', price: 2100, originalPrice: 2500, discount: 16, rating: 4.9, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Kids Bicycle 16 Inch Blue', category: 'Bicycles', price: 4800, originalPrice: 5500, discount: 13, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Remote Control Sports Car 1:16', category: 'Toys & Games', price: 1250, originalPrice: 1500, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Educational Building Blocks 100pcs', category: 'Learning', price: 850, originalPrice: null, discount: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Plush Teddy Bear Ultra Soft 30cm', category: 'Baby', price: 650, originalPrice: 800, discount: 19, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Mercedes Benz G63 Kids Electric Car', category: 'Ride On Cars', price: 12500, originalPrice: 15000, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Kids Smart Watch with Camera', category: 'Toys & Games', price: 1490, originalPrice: 1800, discount: 17, rating: 4.6, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 9, name: 'Balance Bike 12 Inch No Pedal', category: 'Bicycles', price: 2800, originalPrice: 3500, discount: 20, rating: 4.9, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 10, name: 'Kids Stunt Scooter Pro Black', category: 'Scooters', price: 3200, originalPrice: 3800, discount: 16, rating: 4.8, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 11, name: 'Magnetic Drawing Board Toddlers', category: 'Learning', price: 450, originalPrice: 600, discount: 25, rating: 4.9, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 12, name: 'Kids Tractor with Trailer', category: 'Ride On Cars', price: 5500, originalPrice: 6500, discount: 15, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
];

export default function NewShop() {
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter products based on selected category and search query
  const filteredProducts = FAKE_PRODUCTS.filter(p => {
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
                  {FAKE_CATEGORIES.map(cat => (
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
                  {FAKE_BRANDS.map(brand => (
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
            {filteredProducts.length > 0 ? (
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
