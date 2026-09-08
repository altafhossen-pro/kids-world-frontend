'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI, notificationAPI } from '@/services/api'; // using notificationAPI for getHomepageLayout temporarily since I added it there

// Need to import swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layoutConfig, setLayoutConfig] = useState({
    isVisible: true,
    displayType: 'grid'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch layout settings
        const layoutRes = await notificationAPI.getHomepageLayout();
        let currentLayout = { isVisible: true, displayType: 'grid', maxProducts: 10 };
        
        if (layoutRes.success && layoutRes.data && layoutRes.data.bestSellers) {
          currentLayout = layoutRes.data.bestSellers;
          setLayoutConfig(currentLayout);
        }

        if (!currentLayout.isVisible) {
          setLoading(false);
          return;
        }

        const response = await productAPI.getBestsellingProducts(currentLayout.maxProducts || 10);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch best sellers data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Best Sellers</h2>
            </div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-[3/4]"></div>
          ))}
        </div>
      </section>
    );
  }

  if (!layoutConfig.isVisible || !products || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 relative group">
      <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Best Sellers</h2>
          </div>
          <p className="text-gray-500 font-medium">Our most loved products by parents across Bangladesh</p>
        </div>
        
        <div className="flex items-center gap-4">
          {layoutConfig.displayType !== 'slider' && (
            <a href="/shop?sort=best-sellers" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1">
              View All <ArrowRight className="w-4 h-4" />
            </a>
          )}
          
          {layoutConfig.displayType === 'slider' && products.length > 0 && (
            <div className="flex gap-2">
              <button className="best-sellers-prev w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="best-sellers-next w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white cursor-pointer">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {layoutConfig.displayType === 'slider' ? (
        <Swiper
          modules={[Navigation]}
          loop={true}
          navigation={{
            prevEl: '.best-sellers-prev',
            nextEl: '.best-sellers-next',
          }}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="pb-4"
        >
          {products.map(product => (
            <SwiperSlide key={product._id || product.id} className="h-auto flex">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {products.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSellers;
