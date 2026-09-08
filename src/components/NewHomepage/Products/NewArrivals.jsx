'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI, notificationAPI } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layoutConfig, setLayoutConfig] = useState({
    isVisible: true,
    displayType: 'grid'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const layoutRes = await notificationAPI.getHomepageLayout();
        let currentLayout = { isVisible: true, displayType: 'grid', maxProducts: 10 };
        
        if (layoutRes.success && layoutRes.data && layoutRes.data.newArrivals) {
          currentLayout = layoutRes.data.newArrivals;
          setLayoutConfig(currentLayout);
        }

        if (!currentLayout.isVisible) {
          setLoading(false);
          return;
        }

        const response = await productAPI.getNewArrivalProducts(currentLayout.maxProducts || 10);
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch new arrival products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="flex flex-col items-center mb-10 text-center border-b border-gray-100 pb-4">
          <span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-2">Just Landed</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">New Arrivals</h2>
          <div className="w-16 h-1 bg-blue-500 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mt-2"></div>
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
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative group">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-100 pb-4">
        <div>
          <span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-1 block">Just Landed</span>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">New Arrivals</h2>
          <div className="w-16 h-1 bg-blue-500 rounded-full mb-2"></div>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {layoutConfig.displayType !== 'slider' && (
            <a href="/shop?sort=new" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          )}

          {layoutConfig.displayType === 'slider' && products.length > 0 && (
            <div className="flex gap-2">
              <button className="newarrival-prev w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white cursor-pointer">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="newarrival-next w-10 h-10 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-colors bg-white cursor-pointer">
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
            prevEl: '.newarrival-prev',
            nextEl: '.newarrival-next',
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

export default NewArrivals;
