'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { categoryAPI } from '@/services/api';

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getCategories();
        if (res.success) {
          // Filter to only featured or top categories if needed, for now just slice first 7
          setCategories(res.data.slice(0, 7));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop by Category</h2>
        <Link href="/shop" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors">
          View All Categories <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col items-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden h-40">
              <div className="w-full aspect-square bg-gray-200"></div>
              <div className="w-full p-3 flex justify-center bg-white">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => (
            <Link key={i} href={`/shop?category=${cat.slug || cat._id}`} className="group flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-full aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center ">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-3 w-full flex items-center justify-center bg-white">
                <span className="text-sm font-bold text-gray-800 text-center truncate px-2">{cat.name}</span>
              </div>
            </Link>
          ))}
          {/* More button */}
          <Link href="/shop" className="group flex flex-col items-center justify-center bg-[#F4F9FF] rounded-xl shadow-sm border border-blue-100 hover:bg-blue-50 transition-all h-full min-h-[160px]">
            <div className="w-full flex flex-col items-center justify-center p-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                <LayoutGrid className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-blue-600">More</span>
            </div>
          </Link>
        </div>
      )}
    </section>
  );
};

export default ShopByCategory;
