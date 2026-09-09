import React from 'react';

const brands = [
  "LEGO", "Fisher-Price", "Hot Wheels", "Barbie", "Nerf", "Hasbro", "Play-Doh", "Disney"
];

const TopBrands = () => {
  return (
    <section className="bg-[#F8FAFC] py-8 sm:py-16 mt-8 sm:mt-16 border-y border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-base sm:text-xl font-bold text-gray-500 uppercase tracking-widest mb-6 sm:mb-10">
          Trusted By Top Brands
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
          {brands.map((brand, i) => (
            <div key={i} className="text-2xl md:text-3xl font-black text-gray-400 hover:text-blue-500 transition-colors cursor-pointer grayscale hover:grayscale-0">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
