'use client';
import React from 'react';
import StaticCategorySection from './StaticCategorySection';
import { productAPI } from '@/services/api';

const NewArrivals = () => {
  const headerMarkup = (
    <div>
      <span className="text-blue-500 font-bold uppercase tracking-wider text-[10px] sm:text-sm mb-0 sm:mb-1 block">Just Landed</span>
      <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-1 sm:mb-2">New Arrivals</h2>
      <div className="w-12 sm:w-16 h-1 bg-blue-500 rounded-full mb-0 sm:mb-2"></div>
    </div>
  );

  return (
    <StaticCategorySection 
        title="New Arrivals"
        subtitle=""
        sectionKey="newArrivals"
        apiMethod={productAPI.getNewArrivalProducts}
        viewAllLink="/shop?sort=new"
        headerMarkup={headerMarkup}
    />
  );
};

export default NewArrivals;
