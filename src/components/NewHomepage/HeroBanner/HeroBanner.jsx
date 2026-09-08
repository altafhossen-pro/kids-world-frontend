'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { heroBannerAPI } from '@/services/api';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const HeroBanner = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await heroBannerAPI.getHeroBanners();
        if (res.success && res.data) {
          setSlides(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch hero banners', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] md:h-[400px] lg:h-[500px] bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-gray-400 font-medium">Loading...</span>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return null; // Don't show if no banners are added yet
  }

  return (
    <section className="w-full mt-2 lg:mt-6 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/9] shadow-md bg-gray-100">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={slides.length > 1}
            grabCursor={true}
            className="w-full h-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index} className="w-full h-full relative">
                {slide.link ? (
                  <Link href={slide.link} className="block w-full h-full">
                    <img
                      src={slide.image}
                      alt="Hero Banner"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                ) : (
                  <img
                    src={slide.image}
                    alt="Hero Banner"
                    className="w-full h-full object-cover"
                  />
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
