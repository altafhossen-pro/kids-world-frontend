'use client';
import React from 'react';
import StaticCategorySection from './StaticCategorySection';
import { productAPI } from '@/services/api';

const BestSellers = () => {
  return (
    <StaticCategorySection 
        title="Best Sellers"
        subtitle="Our most loved products"
        sectionKey="bestSellers"
        apiMethod={productAPI.getBestsellingProducts}
        viewAllLink="/shop?sort=bestselling"
    />
  );
};

export default BestSellers;
