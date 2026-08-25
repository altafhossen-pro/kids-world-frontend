import React from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <Link href="/product/kw-demo-001" className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col">
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {product.discount > 0 && (
          <span className="bg-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Quick Actions (Hover) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
        <button className="bg-white p-2 rounded-full text-gray-500 hover:text-pink-500 hover:bg-pink-50 shadow-sm border border-gray-100 transition-colors">
          <Heart className="w-4 h-4" />
        </button>
        <button className="bg-white p-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 shadow-sm border border-gray-100 transition-colors">
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative w-full aspect-square bg-[#F8FAFC] p-4 flex items-center justify-center border-b border-gray-50">
        <div className="w-full h-full relative overflow-hidden rounded-md flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 mix-blend-multiply"
            />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Rating */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[11px] font-bold text-gray-600">{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
          {product.name}
        </h3>

        {/* Price & Cart Button */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <span className="text-lg font-black text-blue-600 leading-none">৳{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-medium leading-none mb-0.5">৳{product.originalPrice}</span>
            )}
          </div>
          <button className="w-full bg-[#E8F3FD] hover:bg-blue-600 text-blue-600 hover:text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
