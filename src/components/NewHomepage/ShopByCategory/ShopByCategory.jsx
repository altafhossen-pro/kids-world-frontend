import React from 'react';
import { ArrowRight, LayoutGrid } from 'lucide-react';

const categories = [
  { name: "Ride On Cars", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80" },
  { name: "Scooters", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=300&q=80" },
  { name: "Bicycles", image: "https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=300&q=80" },
  { name: "Toys & Games", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=300&q=80" },
  { name: "Baby Care", image: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=300&q=80" },
  { name: "Learning & Edu.", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=300&q=80" },
  { name: "Stuffed Toys", image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=300&q=80" },
];

const ShopByCategory = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop by Category</h2>
        <a href="/categories" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors">
          View All Categories <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((cat, i) => (
          <a key={i} href={`/categories`} className="group flex flex-col items-center bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
            <div className="w-full aspect-square bg-[#F8FAFC] overflow-hidden">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="p-3 w-full flex items-center justify-center bg-white">
              <span className="text-sm font-bold text-gray-800 text-center">{cat.name}</span>
            </div>
          </a>
        ))}
        {/* More button */}
        <a href="/categories" className="group flex flex-col items-center justify-center bg-[#F4F9FF] rounded-xl shadow-sm border border-blue-100 hover:bg-blue-50 transition-all h-full">
          <div className="w-full flex flex-col items-center justify-center p-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
              <LayoutGrid className="w-7 h-7" />
            </div>
            <span className="text-sm font-bold text-blue-600">More</span>
          </div>
        </a>
      </div>
    </section>
  );
};

export default ShopByCategory;
