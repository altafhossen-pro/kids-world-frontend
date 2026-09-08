import React from 'react';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

const dummyProducts = [
  {
    id: 5,
    name: "Musical Learning Table for Toddlers",
    category: "Baby Care",
    price: 1800,
    originalPrice: 2000,
    discount: 10,
    rating: 4.6,
    isNew: true,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 6,
    name: "Wooden Train Track Set (50 Pieces)",
    category: "Toys & Games",
    price: 1450,
    originalPrice: null,
    discount: 0,
    rating: 4.8,
    isNew: true,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 7,
    name: "Dinosaur Figure Collection Set",
    category: "Toys & Games",
    price: 950,
    originalPrice: 1200,
    discount: 20,
    rating: 4.5,
    isNew: true,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 8,
    name: "3-Wheel Kick Scooter with LED Lights",
    category: "Scooters",
    price: 2100,
    originalPrice: 2500,
    discount: 16,
    rating: 4.9,
    isNew: true,
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 9,
    name: "Interactive Robot Toy with Voice Control",
    category: "Learning & Edu.",
    price: 3500,
    originalPrice: 4200,
    discount: 16,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80"
  }
];

const NewArrivals = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex flex-col items-center mb-10 text-center">
        <span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-2">Just Landed</span>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-4">New Arrivals</h2>
        <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {dummyProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a href="/new-arrivals" className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center gap-2">
          Discover More <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
};

export default NewArrivals;
