'use client';
import React, { useEffect, useState } from 'react';
import { ArrowRight, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { categoryAPI } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const ShopByCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Fetch only categories marked with 'Show on Homepage' (isFeatured)
        const res = await categoryAPI.getFeaturedCategories(100);
        if (res.success) {
          setCategories(res.data);
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
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 relative">
      <div className="flex justify-between items-end mb-4 sm:mb-8 pb-2 sm:pb-4">
        <div className="max-w-[70%]">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-2">Shop by Category</h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium truncate">Explore our wide range of collections</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">

          <div className="flex gap-1 sm:gap-2">
            <button className="category-prev p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white shadow-sm flex items-center justify-center cursor-pointer">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="category-next p-1.5 sm:p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors bg-white shadow-sm flex items-center justify-center cursor-pointer">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col items-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden h-40">
              <div className="w-full aspect-square bg-gray-200 rounded-full scale-75"></div>
              <div className="w-full p-3 flex justify-center bg-white">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Navigation, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{
            prevEl: '.category-prev',
            nextEl: '.category-next',
          }}
          spaceBetween={16}
          slidesPerView={4}
          breakpoints={{
            480: { slidesPerView: 4, spaceBetween: 16 },
            640: { slidesPerView: 4, spaceBetween: 16 },
            768: { slidesPerView: 5, spaceBetween: 16 },
            1024: { slidesPerView: 7, spaceBetween: 16 },
            1280: { slidesPerView: 8, spaceBetween: 16 },
          }}
          loop={true}
          className="pb-4"
        >
          {categories.map((cat, i) => (
            <SwiperSlide key={i} className="h-auto ">
              <Link href={`/shop?category=${cat.slug || cat._id}`} className="group flex flex-col items-center bg-white rounded-xl overflow-hidden transition-all h-full">
                <div className="w-full aspect-square rounded-full bg-blue-100 overflow-hidden flex items-center justify-center ">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300 "
                  />
                </div>
                <div className="p-2 md:p-3 w-full flex items-center justify-center bg-white">
                  <span className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-blue-600 text-center truncate px-2">{cat.name}</span>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default ShopByCategory;
