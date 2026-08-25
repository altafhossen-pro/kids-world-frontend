import React from 'react';
import { ArrowRight } from 'lucide-react';

const PromoBanners = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Banner 1 */}
        <div className="relative bg-[#F4F9FF] p-8 rounded-3xl overflow-hidden flex flex-col justify-center min-h-[280px] shadow-sm border border-blue-50 hover:shadow-md transition-shadow group">
            <div className="relative z-10 w-[60%]">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">Electric Ride On Cars</h3>
                <p className="text-blue-600 font-bold mb-6">Up to 20% Off</p>
                <button className="bg-white text-blue-600 text-sm font-bold py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 w-max hover:bg-blue-600 hover:text-white transition-colors border border-blue-100">
                    Shop Now <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80" alt="Ride on car" className="absolute -right-6 bottom-0 w-[55%] h-full object-cover rounded-l-full transform group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Banner 2 */}
        <div className="relative bg-[#F0FDF4] p-8 rounded-3xl overflow-hidden flex flex-col justify-center min-h-[280px] shadow-sm border border-green-50 hover:shadow-md transition-shadow group">
            <div className="relative z-10 w-[60%]">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">Scooters for Every Adventure</h3>
                <p className="text-green-600 font-bold mb-6">Up to 15% Off</p>
                <button className="bg-white text-green-600 text-sm font-bold py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 w-max hover:bg-green-600 hover:text-white transition-colors border border-green-100">
                    Shop Now <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <img src="https://images.unsplash.com/photo-1520114002364-e4c1fcda0e05?auto=format&fit=crop&w=400&q=80" alt="Scooter" className="absolute -right-6 bottom-0 w-[55%] h-full object-cover rounded-l-full transform group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Banner 3 */}
        <div className="relative bg-[#FFFBEB] p-8 rounded-3xl overflow-hidden flex flex-col justify-center min-h-[280px] shadow-sm border border-yellow-50 hover:shadow-md transition-shadow group">
            <div className="relative z-10 w-[60%]">
                <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-tight">Smart Watch For Smart Kids</h3>
                <p className="text-yellow-600 font-bold mb-6">Up to 25% Off</p>
                <button className="bg-white text-yellow-600 text-sm font-bold py-2.5 px-6 rounded-full shadow-sm flex items-center gap-2 w-max hover:bg-yellow-500 hover:text-white transition-colors border border-yellow-100">
                    Shop Now <ArrowRight className="w-4 h-4" />
                </button>
            </div>
            <img src="https://images.unsplash.com/photo-1509623237190-8e12d3db7b0a?auto=format&fit=crop&w=400&q=80" alt="Smart Watch" className="absolute -right-6 bottom-0 w-[55%] h-full object-cover rounded-l-full transform group-hover:scale-105 transition-transform duration-500" />
        </div>

      </div>
    </section>
  );
};

export default PromoBanners;
