'use client';

import React, { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonialAPI } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await testimonialAPI.getActiveTestimonials();
        if (res.success) {
          setReviews(res.data.testimonials);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-4">Happy Parents, Happy Kids</h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium">See what our customers have to say about us</p>
        </div>
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-8 hide-scrollbar">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="min-w-[85vw] md:min-w-0 shrink-0 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-pulse h-64">
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null; // Don't show the section if there are no testimonials
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 relative">
      <div className="flex justify-between items-end mb-6 sm:mb-12 pb-2">
        <div className="text-left">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-2">Happy Parents, Happy Kids</h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium">See what our customers have to say about us</p>
        </div>

        {reviews.length > 0 && (
          <div className="flex gap-1 sm:gap-2 shrink-0">
            <button className="testimonial-prev w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="testimonial-next w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        loop={reviews.length > 1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          prevEl: '.testimonial-prev',
          nextEl: '.testimonial-next',
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 3, spaceBetween: 32 },
        }}
        className="pb-12"
        style={{ alignItems: 'stretch' }}
      >
        {reviews.map((review, i) => (
          <SwiperSlide key={i} style={{ height: 'auto', display: 'flex' }}>
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 relative flex flex-col w-full mx-1 mt-1 mb-2" style={{ flex: 1 }}>
              <Quote className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-12 sm:h-12 text-blue-50" />

              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${index < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>

              <p className="text-sm sm:text-base text-gray-700 italic mb-6 sm:mb-8 relative z-10 leading-relaxed flex-grow">
                "{review.text}"
              </p>

              <div className="flex items-center gap-3 sm:gap-4 mt-auto">
                {review.image ? (
                  <img src={review.image} alt={review.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {review.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-gray-900">{review.name}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{review.role || 'Customer'}</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonials;
