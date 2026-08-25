'use client';
import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

// ── Fake category-based products ────────────────────────────────────────────
const categories = [
  {
    id: 'ride-on-cars',
    label: 'Ride On Cars',
    color: 'bg-blue-600',
    products: [
      { id: 101, name: 'Kids Electric Ride On Car 12V - Red', category: 'Ride On Cars', price: 8990, originalPrice: 11000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
      { id: 102, name: 'Mercedes Benz G63 Kids Ride On', category: 'Ride On Cars', price: 12500, originalPrice: 15000, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
      { id: 103, name: 'Lamborghini Kids Electric Car - Yellow', category: 'Ride On Cars', price: 14800, originalPrice: 18000, discount: 18, rating: 5.0, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
      { id: 104, name: 'Kids Tractor with Trailer Ride On', category: 'Ride On Cars', price: 5500, originalPrice: 6500, discount: 15, rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
      { id: 105, name: 'Baby Walker Ride On Push Car', category: 'Ride On Cars', price: 2200, originalPrice: 2800, discount: 21, rating: 4.6, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    id: 'scooters',
    label: 'Scooters',
    color: 'bg-pink-500',
    products: [
      { id: 201, name: '3-Wheel LED Light Kick Scooter - Pink', category: 'Scooters', price: 2100, originalPrice: 2500, discount: 16, rating: 4.9, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
      { id: 202, name: 'Kids Stunt Scooter Pro - Black', category: 'Scooters', price: 3200, originalPrice: 3800, discount: 16, rating: 4.8, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
      { id: 203, name: 'Adjustable 2-Wheel Scooter Blue', category: 'Scooters', price: 1850, originalPrice: null, discount: 0, rating: 4.7, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
      { id: 204, name: 'Foldable Electric Scooter for Kids', category: 'Scooters', price: 6500, originalPrice: 8000, discount: 19, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
      { id: 205, name: 'Mini Scooter with Light & Music', category: 'Scooters', price: 1200, originalPrice: 1500, discount: 20, rating: 4.6, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    id: 'bicycles',
    label: 'Bicycles',
    color: 'bg-green-500',
    products: [
      { id: 301, name: 'Kids Bicycle 16 Inch - Blue', category: 'Bicycles', price: 4800, originalPrice: 5500, discount: 13, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
      { id: 302, name: 'Balance Bike 12 Inch - No Pedal', category: 'Bicycles', price: 2800, originalPrice: 3500, discount: 20, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
      { id: 303, name: 'Mountain Bicycle 20 Inch 6 Speed', category: 'Bicycles', price: 7500, originalPrice: 9000, discount: 17, rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
      { id: 304, name: 'Kids Bicycle 14 Inch Pink with Basket', category: 'Bicycles', price: 4200, originalPrice: null, discount: 0, rating: 5.0, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
      { id: 305, name: 'BMX Stunt Bicycle for Kids', category: 'Bicycles', price: 5800, originalPrice: 7000, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
    ]
  },
  {
    id: 'toys',
    label: 'Toys & Games',
    color: 'bg-orange-500',
    products: [
      { id: 401, name: 'Remote Control Sports Car 1:16 Scale', category: 'Toys & Games', price: 1250, originalPrice: 1500, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
      { id: 402, name: 'Educational Building Blocks 100 Pcs', category: 'Toys & Games', price: 850, originalPrice: null, discount: 0, rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
      { id: 403, name: 'Plush Teddy Bear Ultra Soft 30cm', category: 'Toys & Games', price: 650, originalPrice: 800, discount: 19, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
      { id: 404, name: 'Kids Smart Watch with Camera - Blue', category: 'Toys & Games', price: 1490, originalPrice: 1800, discount: 17, rating: 4.6, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
      { id: 405, name: 'Magnetic Drawing Board for Toddlers', category: 'Toys & Games', price: 450, originalPrice: 600, discount: 25, rating: 4.9, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
    ]
  },
];

const CategoryProducts = () => {
  const [activeTab, setActiveTab] = useState(categories[0].id);
  const active = categories.find(c => c.id === activeTab);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Shop by Category</h2>
          <p className="text-gray-500 font-medium">Browse our top categories handpicked for you</p>
        </div>
        <a href="/shop" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1 shrink-0">
          View All <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              activeTab === cat.id
                ? `${cat.color} text-white shadow-md`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {active.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default CategoryProducts;
