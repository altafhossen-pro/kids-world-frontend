'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { productAPI, notificationAPI } from '@/services/api';

const PAGE_SIZE = 10; // load 10 products at a time

const JustForYou = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [layoutConfig, setLayoutConfig] = useState({
    isVisible: true,
    sortOrder: 'latest',
    maxProducts: 50
  });

  const sentinelRef = useRef(null);
  const fetchingRef = useRef(false);

  // Fetch Layout Configuration on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchLayout = async () => {
      try {
        const layoutRes = await notificationAPI.getHomepageLayout();
        if (isMounted && layoutRes.success && layoutRes.data && layoutRes.data.justForYou) {
          setLayoutConfig(layoutRes.data.justForYou);
        }
      } catch (error) {
        console.error('Failed to fetch JustForYou layout:', error);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };
    fetchLayout();
    return () => { isMounted = false; };
  }, []);

  const loadMore = useCallback(async () => {
    if (fetchingRef.current || !hasMore || initialLoading || !layoutConfig.isVisible) return;

    // Stop if we have reached or exceeded the max limit
    if (products.length >= layoutConfig.maxProducts) {
      setHasMore(false);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    try {
      let newProducts = [];
      const remainingLimit = layoutConfig.maxProducts - products.length;
      const fetchLimit = Math.min(PAGE_SIZE, remainingLimit);

      if (layoutConfig.sortOrder === 'random') {
        // Fetch random products excluding already loaded ones
        const excludeIds = products.map(p => p._id || p.id);
        const res = await productAPI.getRandomProducts(fetchLimit, excludeIds);
        if (res.success && res.data) {
          newProducts = res.data;
        }
      } else {
        // Fetch latest products using pagination
        const res = await productAPI.getProducts({
          page: page,
          limit: fetchLimit,
          sort: '-createdAt'
        });
        if (res.success && res.data) {
          newProducts = Array.isArray(res.data) ? res.data : (res.data.products || []);
        }
      }

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
        if (newProducts.length < fetchLimit || products.length + newProducts.length >= layoutConfig.maxProducts) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products for Just For You:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [hasMore, initialLoading, layoutConfig, page, products]);

  // IntersectionObserver — triggers when sentinel div enters viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || initialLoading || !layoutConfig.isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '800px' }  // start loading 800px before sentinel is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, initialLoading, layoutConfig.isVisible]);

  // Initial load
  useEffect(() => {
    if (!initialLoading && layoutConfig.isVisible && products.length === 0 && hasMore) {
      loadMore();
    }
  }, [initialLoading, layoutConfig.isVisible, products.length, hasMore, loadMore]);


  if (initialLoading) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-gray-300" />
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-xl aspect-[3/4]"></div>
          ))}
        </div>
      </section>
    );
  }

  if (!layoutConfig.isVisible) return null;

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
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {products.map((product, index) => (
          <ProductCard key={`${product._id || product.id}-${index}`} product={product} />
        ))}
      </div>

      {/* Sentinel / loader */}
      <div ref={sentinelRef} className="flex justify-center items-center py-6 mt-4">
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading more products...
          </div>
        )}
        {/* {!hasMore && products.length > 0 && !loading && (
          <p className="text-gray-400 text-sm font-medium">
            You've seen all products 🎉
          </p>
        )} */}
      </div>
    </section>
  );
};

export default JustForYou;
