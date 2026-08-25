import React from 'react';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

const dummyProducts = [
  {
    id: 1,
    name: "Remote Control Sports Car 1:16 Scale",
    category: "Toys & Games",
    price: 1250,
    originalPrice: 1500,
    discount: 16,
    rating: 4.8,
    isNew: true,
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    name: "Educational Building Blocks Set (100 Pcs)",
    category: "Learning & Edu.",
    price: 850,
    originalPrice: null,
    discount: 0,
    rating: 4.9,
    isNew: false,
    image: "https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    name: "Plush Teddy Bear - Ultra Soft 30cm",
    category: "Stuffed Toys",
    price: 650,
    originalPrice: 800,
    discount: 18,
    rating: 4.7,
    isNew: true,
    image: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 4,
    name: "Kids Balance Bike - Lightweight Aluminum",
    category: "Ride On Cars",
    price: 3200,
    originalPrice: 4000,
    discount: 20,
    rating: 5.0,
    isNew: false,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 5,
    name: "Classic Wooden Rocking Horse",
    category: "Ride On Cars",
    price: 4500,
    originalPrice: 5000,
    discount: 10,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80"
  }
];

const TrendingProducts = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Trending Now</h2>
          <p className="text-gray-500 font-medium">Top picks for your little ones</p>
        </div>
        <a href="/shop" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {dummyProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;
