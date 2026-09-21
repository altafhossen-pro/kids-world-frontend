'use client';
import React, { useEffect, useState } from 'react';
import { topBrandAPI } from '@/services/api';

const TopBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await topBrandAPI.getAll(true); // true for active only
        if (response.success && response.data && response.data.length > 0) {
          setBrands(response.data);
        }
      } catch (error) {
        console.error('Error fetching top brands:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, []);

  if (loading) return null; // or a simple skeleton

  if (!brands || brands.length === 0) return null;

  // Duplicate the array once or twice to ensure a smooth continuous marquee effect 
  // without empty gaps if there are only a few brands.
  const displayBrands = [...brands, ...brands, ...brands];

  return (
    <section className="bg-white py-12 sm:py-16 mt-8 sm:mt-16 border-y border-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center">
            <h2 className="text-center text-base sm:text-xl font-bold text-gray-500 uppercase tracking-widest mb-6 sm:mb-10">Trusted By Top Brands</h2>
        </div>
      </div>
      
      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden group">
        <div className="animate-marquee group-hover:[animation-play-state:paused] flex whitespace-nowrap items-center">
          {displayBrands.map((brand, i) => (
            <div key={`${brand._id}-${i}`} className="mx-8 sm:mx-12 md:mx-16 flex items-center justify-center h-16 sm:h-20 w-32 sm:w-40 transition-all duration-300 cursor-pointer shrink-0">
              <img 
                src={brand.image} 
                alt={brand.name || 'Top Brand'} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
        
        {/* Duplicate for seamless infinite loop */}
        <div className="animate-marquee2 group-hover:[animation-play-state:paused] absolute top-0 flex whitespace-nowrap items-center">
          {displayBrands.map((brand, i) => (
            <div key={`dup-${brand._id}-${i}`} className="mx-8 sm:mx-12 md:mx-16 flex items-center justify-center h-16 sm:h-20 w-32 sm:w-40 transition-all duration-300 cursor-pointer shrink-0">
              <img 
                src={brand.image} 
                alt={brand.name || 'Top Brand'} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 60s linear infinite;
        }
        .group:hover .animate-marquee,
        .group:hover .animate-marquee2 {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  );
};

export default TopBrands;
