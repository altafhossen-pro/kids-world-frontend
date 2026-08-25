import React from 'react';
import { Heart, Truck, MapPin, Instagram, Facebook, Music2 } from 'lucide-react'; // Music2 acts as a placeholder for TikTok

const TopBar = () => {
  return (
    <div className="bg-[#1877F2] text-white text-xs md:text-sm py-2.5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-300" />
          <span>Welcome to <span className="font-bold text-yellow-300 tracking-wide">Kids World</span></span>
        </div>
        
        {/* Center */}
        <div className="hidden md:flex items-center gap-2 font-medium">
          <Truck className="w-4 h-4" />
          <span>Free Delivery on orders over ৳2,000</span>
        </div>
        
        {/* Right */}
        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-1.5 cursor-pointer hover:text-blue-200 transition-colors font-medium">
            <MapPin className="w-4 h-4" />
            <span>Track Center</span>
          </div>
          <div className="flex items-center gap-3.5 border-l border-white/20 pl-5">
            <Instagram className="w-4 h-4 cursor-pointer hover:text-blue-200 transition-colors" />
            <Facebook className="w-4 h-4 cursor-pointer hover:text-blue-200 transition-colors" />
            <Music2 className="w-4 h-4 cursor-pointer hover:text-blue-200 transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
