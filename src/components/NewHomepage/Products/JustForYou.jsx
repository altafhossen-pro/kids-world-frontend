'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';

// ── Product pool — 50 unique fake products ───────────────────────────────────
const ALL_PRODUCTS = [
  { id: 'jfy-1',  name: 'Kids Electric Ride On Car 12V',         category: 'Ride On Cars',   price: 8990,  originalPrice: 11000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-2',  name: '3-Wheel LED Scooter Pink',              category: 'Scooters',       price: 2100,  originalPrice: 2500,  discount: 16, rating: 4.9, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-3',  name: 'Kids Bicycle 16 Inch Blue',             category: 'Bicycles',       price: 4800,  originalPrice: 5500,  discount: 13, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-4',  name: 'Remote Control Sports Car 1:16',        category: 'Toys & Games',   price: 1250,  originalPrice: 1500,  discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-5',  name: 'Educational Building Blocks 100pcs',    category: 'Learning',       price: 850,   originalPrice: null,  discount: 0,  rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-6',  name: 'Plush Teddy Bear Ultra Soft 30cm',      category: 'Stuffed Toys',   price: 650,   originalPrice: 800,   discount: 19, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-7',  name: 'Mercedes Benz G63 Kids Electric Car',   category: 'Ride On Cars',   price: 12500, originalPrice: 15000, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-8',  name: 'Kids Smart Watch with Camera',          category: 'Toys & Games',   price: 1490,  originalPrice: 1800,  discount: 17, rating: 4.6, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-9',  name: 'Balance Bike 12 Inch No Pedal',         category: 'Bicycles',       price: 2800,  originalPrice: 3500,  discount: 20, rating: 4.9, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-10', name: 'Kids Stunt Scooter Pro Black',          category: 'Scooters',       price: 3200,  originalPrice: 3800,  discount: 16, rating: 4.8, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-11', name: 'Magnetic Drawing Board Toddlers',       category: 'Learning',       price: 450,   originalPrice: 600,   discount: 25, rating: 4.9, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-12', name: 'Kids Tractor with Trailer',             category: 'Ride On Cars',   price: 5500,  originalPrice: 6500,  discount: 15, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-13', name: 'Lamborghini Kids Electric Car Yellow',  category: 'Ride On Cars',   price: 14800, originalPrice: 18000, discount: 18, rating: 5.0, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-14', name: 'Mini Scooter with Light & Music',       category: 'Scooters',       price: 1200,  originalPrice: 1500,  discount: 20, rating: 4.6, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-15', name: 'Mountain Bicycle 20 Inch 6 Speed',      category: 'Bicycles',       price: 7500,  originalPrice: 9000,  discount: 17, rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-16', name: 'Baby Walker Push Car White',            category: 'Ride On Cars',   price: 2200,  originalPrice: 2800,  discount: 21, rating: 4.6, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-17', name: 'Kids BMX Stunt Bicycle',               category: 'Bicycles',       price: 5800,  originalPrice: 7000,  discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-18', name: 'Wooden Puzzle Set 48 Pieces',           category: 'Learning',       price: 380,   originalPrice: 500,   discount: 24, rating: 4.7, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-19', name: 'Kids Bicycle 14 Inch Pink Basket',      category: 'Bicycles',       price: 4200,  originalPrice: null,  discount: 0,  rating: 5.0, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-20', name: 'Foldable Electric Scooter Kids',        category: 'Scooters',       price: 6500,  originalPrice: 8000,  discount: 19, rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-21', name: 'Kids RC Helicopter Indoor',             category: 'Toys & Games',   price: 950,   originalPrice: 1200,  discount: 21, rating: 4.5, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-22', name: 'Paint & Craft Art Set 60 Pcs',          category: 'Learning',       price: 590,   originalPrice: 750,   discount: 21, rating: 4.8, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-23', name: 'Soft Foam Play Mat 9 Tiles',            category: 'Baby',           price: 720,   originalPrice: 900,   discount: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-24', name: 'Kids Police Ride On Car with Siren',    category: 'Ride On Cars',   price: 7200,  originalPrice: 9000,  discount: 20, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-25', name: 'Adjustable 2-Wheel Scooter Blue',       category: 'Scooters',       price: 1850,  originalPrice: null,  discount: 0,  rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-26', name: 'Kids Drum Set Musical Toy',             category: 'Toys & Games',   price: 1100,  originalPrice: 1400,  discount: 21, rating: 4.6, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-27', name: 'Classic Rocking Horse Brown',           category: 'Ride On Cars',   price: 4500,  originalPrice: 5500,  discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-28', name: 'Kids Telescope Beginner Set',           category: 'Learning',       price: 1350,  originalPrice: 1600,  discount: 16, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-29', name: 'Baby Stroller Lightweight Travel',      category: 'Baby',           price: 5200,  originalPrice: 6500,  discount: 20, rating: 4.8, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-30', name: 'Kids Bicycle 18 Inch Green',            category: 'Bicycles',       price: 5500,  originalPrice: 6500,  discount: 15, rating: 4.8, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-31', name: 'Foam Sword & Shield Set',               category: 'Toys & Games',   price: 320,   originalPrice: 450,   discount: 29, rating: 4.5, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-32', name: 'Dinosaur Figurine Set 12pcs',           category: 'Toys & Games',   price: 480,   originalPrice: 600,   discount: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-33', name: 'Kids Doll House with Furniture',        category: 'Toys & Games',   price: 2800,  originalPrice: 3500,  discount: 20, rating: 4.9, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-34', name: 'Kids Electric Jeep 4WD Black',          category: 'Ride On Cars',   price: 16500, originalPrice: 20000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-35', name: 'Adjustable Inline Roller Skates',       category: 'Scooters',       price: 1600,  originalPrice: 2000,  discount: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-36', name: 'Coding Robot for Kids STEM',            category: 'Learning',       price: 3500,  originalPrice: 4200,  discount: 17, rating: 4.9, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-37', name: 'Mini Kitchen Playset 25pcs',            category: 'Toys & Games',   price: 980,   originalPrice: 1200,  discount: 18, rating: 4.6, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-38', name: 'Baby Swing Cradle Electric',            category: 'Baby',           price: 4800,  originalPrice: 5800,  discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-39', name: 'Kids Archery Set Foam Arrows',          category: 'Toys & Games',   price: 420,   originalPrice: 550,   discount: 24, rating: 4.5, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-40', name: 'Kids Electric Motorcycle 6V',           category: 'Ride On Cars',   price: 5800,  originalPrice: 7000,  discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-41', name: 'Giant Floor Puzzle 100pcs World Map',   category: 'Learning',       price: 650,   originalPrice: 800,   discount: 19, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-42', name: 'Kids Walkie Talkie Set 2pcs',           category: 'Toys & Games',   price: 580,   originalPrice: 720,   discount: 19, rating: 4.6, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-43', name: 'Baby High Chair Adjustable',            category: 'Baby',           price: 3200,  originalPrice: 4000,  discount: 20, rating: 4.7, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-44', name: 'Kids Trampoline 6 Feet with Net',       category: 'Outdoor',        price: 7800,  originalPrice: 9500,  discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-45', name: 'Inflatable Pool 150cm Round',           category: 'Outdoor',        price: 1800,  originalPrice: 2200,  discount: 18, rating: 4.7, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-46', name: 'Nerf Rival Blaster Set',                category: 'Toys & Games',   price: 1650,  originalPrice: 2000,  discount: 18, rating: 4.6, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-47', name: 'Kids Science Experiment Kit',           category: 'Learning',       price: 1100,  originalPrice: 1350,  discount: 19, rating: 4.8, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-48', name: 'Baby Monitor WiFi HD Camera',           category: 'Baby',           price: 3800,  originalPrice: 4600,  discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-49', name: 'Kids Easel Whiteboard & Chalkboard',    category: 'Learning',       price: 2200,  originalPrice: 2700,  discount: 19, rating: 4.9, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
  { id: 'jfy-50', name: 'Slide & Swing Outdoor Playset',         category: 'Outdoor',        price: 9500,  originalPrice: 12000, discount: 21, rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
];

const PAGE_SIZE = 10; // load 10 products at a time
const MAX_PRODUCTS = 50;

const JustForYou = () => {
  const [products, setProducts] = useState(ALL_PRODUCTS.slice(0, PAGE_SIZE));
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      setProducts(prev => {
        const next = ALL_PRODUCTS.slice(0, Math.min(prev.length + PAGE_SIZE, MAX_PRODUCTS));
        if (next.length >= MAX_PRODUCTS) setHasMore(false);
        return next;
      });
      setLoading(false);
    }, 600);
  }, [loading, hasMore]);

  // IntersectionObserver — triggers when sentinel div enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '200px' }  // start loading 200px before sentinel is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-500 fill-blue-100" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Just For You</h2>
          </div>
          <p className="text-gray-500 font-medium">Handpicked products based on what kids love</p>
        </div>
        <span className="text-sm text-gray-400 font-medium pb-1">{products.length} / {MAX_PRODUCTS} products</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Sentinel / loader */}
      <div ref={sentinelRef} className="flex justify-center items-center py-10 mt-4">
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading more products...
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-gray-400 text-sm font-medium">
            You've seen all {MAX_PRODUCTS} products 🎉
          </p>
        )}
      </div>
    </section>
  );
};

export default JustForYou;
