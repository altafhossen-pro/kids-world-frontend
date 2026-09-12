'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ShoppingCart, ShoppingBag, X } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { addProductToCart } from '@/utils/cartUtils';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const isRealProduct = !!product._id;
  const slug = product.slug || product.id;
  const name = product.title || product.name;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const hasMultipleVariants = product.variants && product.variants.length > 1;
  const hasAnyVariant = product.variants && product.variants.length > 0;
  
  const isOutOfStock = product.isForceOutOfStock || 
    (hasAnyVariant 
      ? !product.variants.some(v => (v.stockQuantity || 0) > 0) 
      : (product.totalStock || 0) <= 0);

  const price = hasAnyVariant && product.variants[0]?.currentPrice
    ? product.variants[0].currentPrice
    : (product.price || product.basePrice || product.calculatedPriceRange?.min || 0);

  const originalPrice = hasAnyVariant && product.variants[0]?.originalPrice
    ? product.variants[0].originalPrice
    : product.originalPrice;

  const discount = product.discount || (originalPrice > price ? (originalPrice - price) : 0);
  const discountPercentage = originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0;
  const rating = product.rating || product.averageRating || 5.0;
  const image = product.image || product.featuredImage || product.gallery?.[0]?.url || 'https://via.placeholder.com/400';
  const totalSold = product.displayTotalSold || product.totalSold || 0;

  const colorOptions = [...new Set(product.variants?.flatMap(v => v.attributes.filter(a => a.name.toLowerCase() === 'color').map(a => a.value)) || [])];
  const sizeOptions = [...new Set(product.variants?.flatMap(v => v.attributes.filter(a => a.name.toLowerCase() === 'size').map(a => a.value)) || [])];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    let v = product.variants.find(v =>
      v.attributes.some(a => a.name.toLowerCase() === 'color' && a.value === color) &&
      (!selectedSize || v.attributes.some(a => a.name.toLowerCase() === 'size' && a.value === selectedSize))
    );
    if (!v) {
      v = product.variants.find(v => v.attributes.some(a => a.name.toLowerCase() === 'color' && a.value === color));
      if (v) {
        setSelectedSize(v.attributes.find(a => a.name.toLowerCase() === 'size')?.value || null);
      }
    }
    if (v) setSelectedVariant(v);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    let v = product.variants.find(v =>
      v.attributes.some(a => a.name.toLowerCase() === 'size' && a.value === size) &&
      (!selectedColor || v.attributes.some(a => a.name.toLowerCase() === 'color' && a.value === selectedColor))
    );
    if (!v) {
      v = product.variants.find(v => v.attributes.some(a => a.name.toLowerCase() === 'size' && a.value === size));
      if (v) {
        setSelectedColor(v.attributes.find(a => a.name.toLowerCase() === 'color')?.value || null);
      }
    }
    if (v) setSelectedVariant(v);
  };

  const handleAction = (e, isBuyNow) => {
    e.preventDefault();
    if (hasMultipleVariants) {
      setShowModal(true);
      if (product.variants && product.variants.length > 0) {
        const initialVariant = product.variants[0];
        setSelectedVariant(initialVariant);
        setSelectedColor(initialVariant.attributes.find(a => a.name.toLowerCase() === 'color')?.value || null);
        setSelectedSize(initialVariant.attributes.find(a => a.name.toLowerCase() === 'size')?.value || null);
      }
    } else {
      addProductToCart(product, addToCart, 1, !isBuyNow);
      if (isBuyNow) {
        router.push('/checkout');
      }
    }
  };

  const handleModalAdd = (isBuyNow) => {
    if (!selectedVariant) return toast.error('Please select an item');
    // cartUtils addProductToCart usually auto-selects if we pass product, 
    // but since we want a specific variant, we can pass it directly to addToCart if we format it
    // Actually, addProductToCart handles variants if they are the only ones available, but here we just manually addToCart
    const formattedVariant = {
      size: selectedVariant.attributes?.find(a => a.name.toLowerCase() === 'size')?.value || null,
      color: selectedVariant.attributes?.find(a => a.name.toLowerCase() === 'color')?.value || null,
      hexCode: selectedVariant.attributes?.find(a => a.name.toLowerCase() === 'color')?.hexCode || null,
      currentPrice: selectedVariant.currentPrice || price,
      originalPrice: selectedVariant.originalPrice || originalPrice,
      sku: selectedVariant.sku,
      stockQuantity: selectedVariant.stockQuantity || 0,
      image: selectedVariant.images?.[0]?.url || image
    };

    const cartProduct = {
      _id: product._id || product.id,
      title: product.title || product.name,
      name: product.name || product.title,
      slug: product.slug,
      featuredImage: product.featuredImage || product.image,
      basePrice: product.price || price,
      isForceOutOfStock: product.isForceOutOfStock || false
    };

    addToCart(cartProduct, formattedVariant, 1, !isBuyNow);
    setShowModal(false);

    if (isBuyNow) {
      router.push('/checkout');
    }
  };

  return (
    <>
      <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative flex flex-col  pb-4">
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[#2ecc71] text-white text-[12px] font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          </div>
        )}

        <Link href={`/product/${slug}`} className="relative w-full aspect-square  overflow-hidden mb-3 block">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        <div className="flex flex-col flex-1 p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
              <span className="text-xs font-medium text-gray-500">({product.totalReviews || 0})</span>
            </div>
            <span className="text-xs font-medium text-gray-500">{totalSold} Sold</span>
          </div>

          <Link href={`/product/${slug}`}>
            <h3 className="font-medium text-gray-700 text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors leading-tight min-h-[36px]">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mb-4">
            {originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">৳ {originalPrice.toLocaleString()}</span>
            )}
            <span className="text-base font-bold text-gray-900">৳ {price.toLocaleString()}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <button
              onClick={(e) => !isOutOfStock && handleAction(e, false)}
              disabled={isOutOfStock}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer text-white'}`}
            >
              <ShoppingCart className="w-4 h-4" /> {isOutOfStock ? 'Out of Stock' : (hasMultipleVariants ? 'Select Items' : 'Add to Cart')}
            </button>
            <button
              onClick={(e) => !isOutOfStock && handleAction(e, true)}
              disabled={isOutOfStock}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed hidden' : 'bg-[#f4f5f6] hover:bg-[#e9ebec] text-gray-800 cursor-pointer'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {showModal && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Select Options</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <div className="flex gap-4 pb-6 mb-6 border-b border-gray-100">
                <img
                  src={selectedVariant?.images?.[0]?.url || image}
                  className="w-28 h-28 object-cover rounded-xl border border-gray-100"
                  alt={name}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">{name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-black text-[#ff5c00]">
                      ৳ {(selectedVariant?.currentPrice || price).toLocaleString()}
                    </span>
                    {(selectedVariant?.originalPrice || originalPrice) > (selectedVariant?.currentPrice || price) && (
                      <span className="text-sm text-gray-400 line-through">
                        ৳ {(selectedVariant?.originalPrice || originalPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                  {((selectedVariant?.stockQuantity) <= 0) && (
                    <p className="text-sm font-medium text-red-500">Out of stock</p>
                  )}
                </div>
              </div>

              {/* Variants Selection */}
              {colorOptions.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Color: <span className="text-blue-600">{selectedColor}</span>
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {colorOptions.map(c => {
                      const vInfo = product.variants?.find(v => v.attributes.find(a => a.value === c));
                      const hex = vInfo?.attributes.find(a => a.name.toLowerCase() === 'color')?.hexCode || '#ccc';
                      return (
                        <button
                          key={c}
                          onClick={() => handleColorSelect(c)}
                          title={c}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${selectedColor === c ? 'border-blue-500 scale-110 shadow-md z-10' : 'border-gray-200 hover:border-blue-300'
                            }`}
                          style={{ backgroundColor: hex }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {sizeOptions.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-700 mb-3">
                    Size: <span className="text-blue-600">{selectedSize}</span>
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {sizeOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => handleSizeSelect(s)}
                        className={`relative px-5 py-2.5 text-sm font-bold rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${selectedSize === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button
                onClick={() => handleModalAdd(false)}
                disabled={(selectedVariant?.stockQuantity || 0) <= 0}
                className={`flex-1 font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 cursor-pointer ${(selectedVariant?.stockQuantity || 0) <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  }`}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
              <button
                onClick={() => handleModalAdd(true)}
                disabled={(selectedVariant?.stockQuantity || 0) <= 0}
                className={`flex-1 font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 cursor-pointer ${(selectedVariant?.stockQuantity || 0) <= 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#ff5c00] hover:bg-[#e65300] text-white shadow-lg shadow-orange-200'
                  }`}
              >
                <ShoppingBag className="w-5 h-5" /> Buy Now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductCard;
