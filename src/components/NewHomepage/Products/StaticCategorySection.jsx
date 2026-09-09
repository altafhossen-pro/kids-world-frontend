'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { notificationAPI } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const StaticCategorySection = ({ title, subtitle, sectionKey, apiMethod, viewAllLink, headerMarkup = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layoutConfig, setLayoutConfig] = useState({
    isVisible: true,
    displayType: 'grid',
    hasPagination: false,
    productsPerPage: 10,
    maxPages: 3,
    maxProducts: 10
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch layout settings
        const layoutRes = await notificationAPI.getHomepageLayout();
        let currentLayout = {
          isVisible: true, displayType: 'grid', maxProducts: 10,
          hasPagination: false, productsPerPage: 10, maxPages: 3
        };

        if (layoutRes.success && layoutRes.data && layoutRes.data[sectionKey]) {
          currentLayout = { ...currentLayout, ...layoutRes.data[sectionKey] };
          setLayoutConfig(currentLayout);
        }

        if (!currentLayout.isVisible) {
          setLoading(false);
          return;
        }

        let limit = currentLayout.maxProducts || 10;
        if (currentLayout.hasPagination) {
          limit = currentLayout.productsPerPage || 10;
        }

        let timestampParam = `&page=1`;
        if (currentLayout.sortOrder === 'random') {
          timestampParam += `&t=${Date.now()}`;
        }

        const response = await apiMethod(limit, timestampParam);
        if (response.success) {
          let finalProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
          if (currentLayout.sortOrder === 'random') {
            finalProducts = finalProducts.sort(() => Math.random() - 0.5);
          }
          setProducts(finalProducts);

          if (currentLayout.hasPagination) {
            const totalPages = response.pagination?.totalPages || 1;
            setHasMore(totalPages > 1 && currentLayout.maxPages > 1);
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${sectionKey} products:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sectionKey, apiMethod]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;

      let timestampParam = `&page=${nextPage}`;
      if (layoutConfig.sortOrder === 'random') {
        timestampParam += `&t=${Date.now()}`;
      }

      const response = await apiMethod(layoutConfig.productsPerPage || 10, timestampParam);
      if (response.success) {
        const newProducts = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setProducts([...products, ...newProducts]);
        setPage(nextPage);

        const totalPages = response.pagination?.totalPages || 1;
        if (nextPage >= totalPages || nextPage >= layoutConfig.maxPages) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error(`Failed to load more ${sectionKey} products`, error);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{title}</h2>
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
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 relative">
      <div className="flex justify-between items-end mb-4 sm:mb-8 pb-2 sm:pb-4">
        {headerMarkup ? headerMarkup : (
          <div className="max-w-[70%]">
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-2">{title}</h2>
            <p className="text-xs sm:text-base text-gray-500 font-medium truncate">{subtitle}</p>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {layoutConfig.displayType !== 'slider' && (
            <a href={viewAllLink} className="text-blue-600 text-xs sm:text-base font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1">
              View All <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </a>
          )}

          {layoutConfig.displayType === 'slider' && products.length > 0 && (
            <div className="flex gap-1 sm:gap-2">
              <button className={`${sectionKey}-prev w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer`}>
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className={`${sectionKey}-next w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer`}>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {layoutConfig.displayType === 'slider' ? (
        <Swiper
          modules={[Navigation]}
          loop={products.length > 5}
          navigation={{
            prevEl: `.${sectionKey}-prev`,
            nextEl: `.${sectionKey}-next`,
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
            <SwiperSlide key={product._id || product.id} className="h-auto flex mb-3">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          {layoutConfig.hasPagination && hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-12 py-2.5 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    See More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default StaticCategorySection;
