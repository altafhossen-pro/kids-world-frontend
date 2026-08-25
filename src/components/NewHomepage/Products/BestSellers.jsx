import React from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, Flame } from 'lucide-react';

const bestSellers = [
  { id: 501, name: 'Kids Electric Ride On Car - Best Seller', category: 'Ride On Cars', price: 8990, originalPrice: 11000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 502, name: '3-Wheel LED Scooter Pink', category: 'Scooters', price: 2100, originalPrice: 2500, discount: 16, rating: 4.9, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 503, name: 'Kids Bicycle 16 Inch Blue', category: 'Bicycles', price: 4800, originalPrice: 5500, discount: 13, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 504, name: 'Remote Control Sports Car 1:16', category: 'Toys & Games', price: 1250, originalPrice: 1500, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 505, name: 'Kids Smart Watch with Camera', category: 'Toys & Games', price: 1490, originalPrice: 1800, discount: 17, rating: 4.6, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
];

const BestSellers = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Best Sellers</h2>
          </div>
          <p className="text-gray-500 font-medium">Our most loved products by parents across Bangladesh</p>
        </div>
        <a href="/shop?sort=best-sellers" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1">
          View All <ArrowRight className="w-4 h-4" />
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {bestSellers.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
