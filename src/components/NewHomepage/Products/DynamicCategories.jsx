'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { productAPI, categoryAPI, notificationAPI } from '@/services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const DynamicCategorySection = ({ category, config }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Since we don't have a specific endpoint for paginated products by category easily exposed yet, 
        // We will assume productAPI.getProducts(params) works or similar.
        // Let's check how shop page does it, or use productAPI.getAllProducts
        const params = new URLSearchParams();
        params.append('category', category._id);
        
        let limit = config.maxProducts || 10;
        if (config.hasPagination) {
            limit = config.productsPerPage || 10;
            params.append('page', 1);
        }
        params.append('limit', limit);
        
        if (config.sortOrder === 'latest') {
            params.append('sort', '-createdAt');
        } else if (config.sortOrder === 'random') {
            params.append('random', 'true'); // or handle randomly on frontend if backend doesn't support
        }

        const res = await productAPI.getProducts(Object.fromEntries(params));
        if (res.success) {
            let finalProducts = res.data.products || res.data;
            if (config.sortOrder === 'random' && !params.get('random')) {
                finalProducts = finalProducts.sort(() => Math.random() - 0.5);
            }
            setProducts(finalProducts);
            
            if (config.hasPagination) {
                const totalPages = res.pagination?.totalPages || 1;
                setHasMore(totalPages > 1 && config.maxPages > 1);
            }
        }
      } catch (error) {
        console.error(`Failed to fetch products for ${category.name}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category._id, config]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
        setLoadingMore(true);
        const nextPage = page + 1;
        const params = new URLSearchParams();
        params.append('category', category._id);
        params.append('limit', config.productsPerPage || 10);
        params.append('page', nextPage);
        if (config.sortOrder === 'latest') params.append('sort', '-createdAt');

        const res = await productAPI.getProducts(Object.fromEntries(params));
        if (res.success) {
            const newProducts = res.data.products || res.data;
            setProducts([...products, ...newProducts]);
            setPage(nextPage);
            
            const totalPages = res.pagination?.totalPages || 1;
            if (nextPage >= totalPages || nextPage >= config.maxPages) {
                setHasMore(false);
            }
        }
    } catch (error) {
        console.error('Failed to load more products', error);
    } finally {
        setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8 pb-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">{category.name}</h2>
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

  if (!products || products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 relative">
      <div className="flex justify-between items-end mb-4 sm:mb-8 pb-2 sm:pb-4">
        <div className="max-w-[70%]">
          <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-2">{category.name}</h2>
          <p className="text-xs sm:text-base text-gray-500 font-medium truncate">Explore our wide range of collections</p>
        </div>

        <div className="flex items-center gap-4">
          {config.displayType !== 'slider' && (
            <a href={`/shop?category=${category._id}`} className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 transition-colors pb-1 shrink-0">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          )}

          {config.displayType === 'slider' && products.length > 0 && (
            <div className="hidden md:flex gap-2">
              <button className={`swiper-button-prev-${category._id} w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className={`swiper-button-next-${category._id} w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {config.displayType === 'slider' ? (
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: `.swiper-button-prev-${category._id}`,
            nextEl: `.swiper-button-next-${category._id}`,
          }}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 5, spaceBetween: 24 },
          }}
          className="-mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {products.map((product) => (
            <SwiperSlide key={product._id} className="pb-8">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
            </div>
            
            {config.hasPagination && hasMore && (
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
}

const DynamicCategories = () => {
    const [categories, setCategories] = useState([]);
    const [layoutConfigs, setLayoutConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLayoutAndCategories = async () => {
            try {
                // Fetch settings
                const layoutRes = await notificationAPI.getHomepageLayout(); // Reusing the same endpoint as Trending
                const catRes = await categoryAPI.getCategories({ limit: 1000 });
                
                if (layoutRes.success && catRes.success) {
                    const sectionCategories = catRes.data.filter(c => c.showHomepageAsSection);
                    const dynamics = layoutRes.data.dynamicCategories || [];
                    
                    setCategories(sectionCategories);
                    setLayoutConfigs(dynamics);
                }
            } catch (error) {
                console.error("Failed to load dynamic categories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLayoutAndCategories();
    }, []);

    if (loading) return null;

    return (
        <>
            {categories.map(category => {
                const config = layoutConfigs.find(c => c.categoryId === category._id) || {
                    isVisible: true,
                    displayType: 'grid',
                    sortOrder: 'latest',
                    maxProducts: 10,
                    hasPagination: false
                };
                
                if (!config.isVisible) return null;
                
                return (
                    <DynamicCategorySection 
                        key={category._id} 
                        category={category} 
                        config={config} 
                    />
                );
            })}
        </>
    );
};

export default DynamicCategories;
