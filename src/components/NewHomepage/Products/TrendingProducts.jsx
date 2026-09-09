'use client';
import React from 'react';
import StaticCategorySection from './StaticCategorySection';
import { productAPI } from '@/services/api';

const TrendingProducts = () => {
  return (
    <StaticCategorySection 
        title="Trending Now"
        subtitle="Top picks for your little ones"
        sectionKey="trending"
        apiMethod={productAPI.getTrendingProducts}
        viewAllLink="/shop?sort=trending"
    />
  );
};

export default TrendingProducts;
