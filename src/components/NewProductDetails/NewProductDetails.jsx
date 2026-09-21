'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, Heart, Minus, Plus, ShoppingCart, Share2,
  Shield, Truck, RefreshCcw, ChevronDown, ChevronUp,
  ZoomIn, CheckCircle2, Package
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { productAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

// ── Helpers ──────────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 'sm' }) => {
  const s = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </div>
  );
};


// ── Main Component ────────────────────────────────────────────────────────────
export default function NewProductDetails({ productSlug }) {
  const { addToCart, setIsCartOpen, deliveryChargeSettings } = useAppContext();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Variant States
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Interaction States
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const [activeTab, setActiveTab] = useState('description');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProductBySlug(productSlug);
        if (res.success && res.data) {
          const p = res.data;
          setProduct(p);

          // Initialize variants based on first actual existing variant
          let initColor = null;
          let initSize = null;

          if (p.variants && p.variants.length > 0) {
            const firstAvailable = p.variants.find(v => v.stockQuantity > 0) || p.variants[0];
            initColor = firstAvailable.attributes.find(a => a.name.toLowerCase() === 'color')?.value || null;
            initSize = firstAvailable.attributes.find(a => a.name.toLowerCase() === 'size')?.value || null;
          } else {
            const colorAttr = p.availableAttributes?.find(a => a.name.toLowerCase() === 'color');
            const sizeAttr = p.availableAttributes?.find(a => a.name.toLowerCase() === 'size');
            if (colorAttr && colorAttr.values?.length > 0) initColor = colorAttr.values[0];
            if (sizeAttr && sizeAttr.values?.length > 0) initSize = sizeAttr.values[0];
          }

          setSelectedColor(initColor);
          setSelectedSize(initSize);

          // Fetch similar products
          try {
            const similarRes = await productAPI.getSimilarProducts(p._id, 4);
            if (similarRes.success) setRelatedProducts(similarRes.data);
          } catch (e) {
            console.log("Failed to fetch related", e);
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    if (productSlug) loadData();
  }, [productSlug]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${images[selectedImage]})`,
      backgroundSize: '250%' // Zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Formatting Product Data
  const images = product.gallery?.length > 0
    ? product.gallery.map(g => g.url)
    : [product.featuredImage];

  // Find current matching variant
  let currentVariant = null;
  if (product.variants?.length > 0) {
    currentVariant = product.variants.find(v => {
      const matchColor = selectedColor ? v.attributes.find(a => a.name.toLowerCase() === 'color' && a.value === selectedColor) : true;
      const matchSize = selectedSize ? v.attributes.find(a => a.name.toLowerCase() === 'size' && a.value === selectedSize) : true;
      return matchColor && matchSize;
    });
  }

  // If the combination doesn't exist, it means the specific size isn't available for this color
  const isCombinationUnavailable = !currentVariant;

  const displayPrice = currentVariant ? currentVariant.currentPrice : product.basePrice;
  const originalPrice = currentVariant && currentVariant.originalPrice ? currentVariant.originalPrice : (displayPrice * 1.2);
  const stockQuantity = currentVariant ? currentVariant.stockQuantity : (isCombinationUnavailable ? 0 : (product.stockQuantity || product.totalStock));
  const isOutOfStock = product.isForceOutOfStock || stockQuantity <= 0 || isCombinationUnavailable;

  const colorOptions = product.availableAttributes?.find(a => a.name.toLowerCase() === 'color')?.values || [];
  const sizeOptions = product.availableAttributes?.find(a => a.name.toLowerCase() === 'size')?.values || [];

  // Helper to check if a specific size exists for the currently selected color
  const hasSizeForColor = (size) => {
    return product.variants?.some(v =>
      v.attributes.find(a => a.name.toLowerCase() === 'color' && a.value === selectedColor) &&
      v.attributes.find(a => a.name.toLowerCase() === 'size' && a.value === size)
    );
  };

  // Helper to check if a specific color exists for the currently selected size
  const hasColorForSize = (color) => {
    return product.variants?.some(v =>
      v.attributes.find(a => a.name.toLowerCase() === 'size' && a.value === selectedSize) &&
      v.attributes.find(a => a.name.toLowerCase() === 'color' && a.value === color)
    );
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // If current size is not available for this new color, pick the first available size
    const availableSizesForNewColor = sizeOptions.filter(s =>
      product.variants?.some(v =>
        v.attributes.find(a => a.name.toLowerCase() === 'color' && a.value === color) &&
        v.attributes.find(a => a.name.toLowerCase() === 'size' && a.value === s)
      )
    );
    if (!availableSizesForNewColor.includes(selectedSize) && availableSizesForNewColor.length > 0) {
      setSelectedSize(availableSizesForNewColor[0]);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    // If current color is not available for this new size, pick the first available color
    const availableColorsForNewSize = colorOptions.filter(c =>
      product.variants?.some(v =>
        v.attributes.find(a => a.name.toLowerCase() === 'size' && a.value === size) &&
        v.attributes.find(a => a.name.toLowerCase() === 'color' && a.value === c)
      )
    );
    if (!availableColorsForNewSize.includes(selectedColor) && availableColorsForNewSize.length > 0) {
      setSelectedColor(availableColorsForNewSize[0]);
    }
  };

  const getCartProduct = () => ({
    _id: product._id || product.id,
    id: product._id || product.id,
    title: product.title || product.name,
    slug: product.slug,
    image: product.featuredImage || product.image,
    featuredImage: product.featuredImage || product.image,
    basePrice: product.basePrice || product.price,
    isForceOutOfStock: product.isForceOutOfStock || false,
  });

  const getFormattedVariant = () => {
    if (!currentVariant) return null;
    return {
      size: currentVariant.attributes?.find(a => a.name.toLowerCase() === 'size')?.value || null,
      color: currentVariant.attributes?.find(a => a.name.toLowerCase() === 'color')?.value || null,
      hexCode: currentVariant.attributes?.find(a => a.name.toLowerCase() === 'color')?.hexCode || null,
      currentPrice: currentVariant.currentPrice || displayPrice,
      originalPrice: currentVariant.originalPrice || originalPrice,
      sku: currentVariant.sku,
      stockQuantity: currentVariant.stockQuantity || 0,
      image: currentVariant.images?.[0]?.url || product.featuredImage || product.image
    };
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return toast.error('Out of stock');
    addToCart(getCartProduct(), getFormattedVariant(), quantity);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return toast.error('Out of stock');
    addToCart(getCartProduct(), getFormattedVariant(), quantity, false);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Top Section ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10 mb-14">

          {/* LEFT — Images */}
          <div className="w-full lg:w-[45%] space-y-4">
            {/* Main Image with Zoom */}
            <div
              className="relative aspect-square bg-[#F0F7FF] rounded-2xl overflow-hidden border border-blue-50 cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Zoom Lens Overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={zoomStyle}
              />

              {originalPrice > displayPrice && !isCombinationUnavailable && (
                <span className="absolute top-4 left-4 z-20 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="relative px-8 mt-4">
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    prevEl: '.thumb-prev',
                    nextEl: '.thumb-next',
                  }}
                  spaceBetween={12}
                  slidesPerView={4}
                  loop={true}
                  className="thumb-swiper"
                >
                  {images.map((img, i) => (
                    <SwiperSlide key={i}>
                      <button
                        onClick={() => setSelectedImage(i)}
                        className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer block ${selectedImage === i ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-100 hover:border-blue-300'}`}
                      >
                        <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button className="thumb-prev absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button className="thumb-next absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:text-blue-600 hover:border-blue-300 z-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="w-full lg:w-[55%] space-y-3">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
              {product.category && (
                <>
                  <span>/</span>
                  <span className="text-gray-800 font-medium">{product.category.name}</span>
                </>
              )}
            </nav>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.title}
            </h1>
            
            {/* Short Description */}
            {product.shortDescription && (
              <div 
                className="text-sm text-gray-600 leading-relaxed [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5 [&>li]:mb-1 [&>p]:mb-2"
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
            )}
            {/* Meta info */}
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="font-semibold text-gray-600">SKU:</span> {currentVariant ? currentVariant.sku : product.slug}</p>
              {product.brand && <p><span className="font-semibold text-gray-600">Brand:</span> {product.brand}</p>}
              {product.category && <p><span className="font-semibold text-gray-600">Category:</span> {product.category.name}</p>}
              <p>
                <span className="font-semibold text-gray-600">Availability:</span>{' '}
                {isOutOfStock ? (
                  <span className="text-red-500 font-medium">{isCombinationUnavailable ? 'Unavailable' : 'Out of Stock'}</span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )}
              </p>
            </div>

            {/* Rating - Dummy for now unless backend provides */}
            <div className="flex items-center gap-3">
              <StarRow rating={4.5} size="md" />
              <span className="text-sm font-bold text-gray-700">4.5</span>
              <span className="text-sm text-gray-400">(0 reviews)</span>
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="text-sm text-blue-600 font-medium hover:underline ml-auto flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>


            {/* Price */}
            <div className="flex items-end gap-3 py-3 border-y border-gray-100">
              <span className="text-4xl font-black text-blue-600 leading-none">৳{displayPrice.toLocaleString()}</span>
              {originalPrice > displayPrice && !isCombinationUnavailable && (
                <>
                  <span className="text-xl text-gray-400 line-through font-medium leading-none mb-1">৳{originalPrice.toLocaleString()}</span>
                  <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-lg mb-0.5">
                    {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {colorOptions.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2.5">
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
                        className={`relative w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${selectedColor === c ? 'border-blue-500 scale-110 shadow-md z-10' : 'border-gray-200 hover:border-blue-300'
                          }`}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {sizeOptions.length > 0 && (
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2.5">
                  Size: <span className="text-blue-600">{selectedSize}</span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {sizeOptions
                    .filter(s => colorOptions.length === 0 || hasSizeForColor(s))
                    .map(s => {
                      return (
                        <button
                          key={s}
                          onClick={() => handleSizeSelect(s)}
                          className={`relative px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all overflow-hidden cursor-pointer ${selectedSize === s ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                            }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2.5">Quantity</p>
              <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-12">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 font-bold text-gray-800 text-lg min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => {
                    if (quantity >= stockQuantity) {
                      import('react-hot-toast').then(m => m.default.error(`Only ${stockQuantity} quantity available`));
                    } else {
                      setQuantity(q => q + 1);
                    }
                  }}
                  className={`px-4 h-full text-gray-500 transition-colors ${quantity >= stockQuantity ? 'opacity-50 bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-row gap-2 sm:gap-3 py-4">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 h-12 flex items-center justify-center gap-1 sm:gap-2 font-bold text-sm sm:text-base rounded-xl transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 cursor-pointer'}`}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 h-12 font-bold text-sm sm:text-base rounded-xl transition-colors shadow-lg ${isOutOfStock ? 'hidden' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100 cursor-pointer'}`}
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" /> Buy Now
              </button>
            </div>




          </div>
        </div>

        {/* ── Details Tabs ─────────────── */}
        <div className="mb-14">
          <div className="flex justify-center border-b border-gray-200 mb-6">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('description')}
                className={`pb-4 text-base font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('additional')}
                className={`pb-4 text-base font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'additional' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Additional information
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-base font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Reviews (0)
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`pb-4 text-base font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === 'delivery' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Shipping and Delivery
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
            {activeTab === 'description' && (
              <div 
                className="text-gray-700 leading-relaxed text-sm sm:text-base [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2 [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2"
                dangerouslySetInnerHTML={{ __html: product.description || product.shortDescription || 'No description available for this product.' }}
              />
            )}

            {activeTab === 'additional' && (
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.highlights && product.highlights.length > 0 ? (
                  <ul className="space-y-3">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{h}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No additional information available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg font-medium">There are no reviews yet.</p>
                <p className="text-gray-400 mt-2 text-sm">Be the first to review this product!</p>
              </div>
            )}

            {activeTab === 'delivery' && (
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-xl">📦</span>
                  <span>Inside Dhaka: {deliveryChargeSettings?.insideDhaka || 0} ৳ (1-2 business days)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-xl">🚚</span>
                  <span>Outside Dhaka: {deliveryChargeSettings?.outsideDhaka || 0} ৳ (3-5 business days)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-xl">💳</span>
                  <span>Cash on delivery available throughout Bangladesh</span>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* ── Related Products ──────────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-3">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(rp => (
                <Link href={`/product/${rp.slug}`} key={rp._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                  <div className="aspect-square bg-[#F0F7FF] overflow-hidden relative">
                    <img src={rp.featuredImage} alt={rp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{rp.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-blue-600">৳{rp.basePrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Share Product</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Spread the word about this product</p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Link Copy */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-2">Product Link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-300"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                      import('react-hot-toast').then(m => m.default.success('Link copied!'));
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0 min-w-[105px] justify-center"
                  >
                    {isCopied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {isCopied ? <span className="text-green-600">Copied!</span> : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <p className="text-sm font-bold text-gray-700 mb-3">Share on Social Media</p>
                <div className="flex items-center gap-3">
                  <a href={`https://wa.me/?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                  <a href={`fb-messenger://share/?link=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#0084FF] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654v4.235l4.086-2.242c1.09.301 2.246.464 3.445.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.963z"/>
                    </svg>
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                     </svg>
                  </a>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.704.064-1.248-.461-1.93-.908-1.067-.701-1.671-1.127-2.708-1.808-1.196-.788-.421-1.222.26-1.931.179-.187 3.284-3.013 3.344-3.272.008-.032.016-.151-.056-.22-.073-.067-.181-.044-.26-.025-.113.027-1.91 1.213-5.394 3.565-.511.352-.974.523-1.388.513-.454-.01-1.326-.256-1.975-.467-.803-.263-1.441-.403-1.385-.852.029-.234.348-.475.962-.72 3.766-1.642 6.275-2.721 7.528-3.238 3.578-1.478 4.321-1.737 4.808-1.745z"/>
                     </svg>
                  </a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md cursor-pointer">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                     </svg>
                  </a>
                </div>
              </div>

              {/* More Options Button */}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.title,
                      url: window.location.href,
                    }).catch(console.error);
                  } else {
                    import('react-hot-toast').then(m => m.default.error('Native sharing not supported on this device'));
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="tracking-widest mr-1 font-extrabold pb-1">...</span> More Options
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
