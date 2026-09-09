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
  const stockQuantity = currentVariant ? currentVariant.stockQuantity : (isCombinationUnavailable ? 0 : product.stockQuantity);
  const isOutOfStock = stockQuantity <= 0 || isCombinationUnavailable;

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
    addToCart(getCartProduct(), getFormattedVariant(), quantity);
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
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
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === i ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-100 hover:border-blue-300'}`}
                  >
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info */}
          <div className="w-full lg:w-[55%] space-y-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {product.category.name}
                </span>
              )}
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100 flex items-center gap-1">
                  {isCombinationUnavailable ? 'Unavailable' : 'Out of Stock'}
                </span>
              ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> In Stock
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating - Dummy for now unless backend provides */}
            <div className="flex items-center gap-3">
              <StarRow rating={4.5} size="md" />
              <span className="text-sm font-bold text-gray-700">4.5</span>
              <span className="text-sm text-gray-400">(0 reviews)</span>
              <button className="text-sm text-blue-600 font-medium hover:underline ml-auto flex items-center gap-1">
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
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 cursor-pointer'}`}
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 h-12 font-bold rounded-xl transition-colors shadow-lg ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-100 cursor-pointer'}`}
              >
                <Package className="w-5 h-5" /> Buy Now
              </button>

              <button
                onClick={() => setWishlisted(w => !w)}
                className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-all shrink-0 cursor-pointer ${wishlisted ? 'bg-blue-50 border-blue-300 text-blue-500' : 'border-gray-200 text-gray-400 hover:border-blue-300 hover:text-blue-400'}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-pink-400' : ''}`} />
              </button>
            </div>

            {/* Trust Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, title: 'Secure Payment', sub: '100% Protected' },
                { icon: Truck, title: 'Fast Delivery', sub: 'Nationwide' },
                { icon: RefreshCcw, title: '7-Day Return', sub: 'Easy Returns' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-3 text-center">
                  <item.icon className="w-5 h-5 text-blue-600 mb-0.5" />
                  <span className="text-xs font-bold text-gray-800">{item.title}</span>
                  <span className="text-[10px] text-gray-500">{item.sub}</span>
                </div>
              ))}
            </div>

            {/* Meta info */}
            <div className="text-xs text-gray-400 space-y-1">
              <p><span className="font-semibold text-gray-600">SKU:</span> {currentVariant ? currentVariant.sku : product.slug}</p>
              {product.brand && <p><span className="font-semibold text-gray-600">Brand:</span> {product.brand}</p>}
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
              <div className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {product.description || product.shortDescription || 'No description available for this product.'}
              </div>
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
    </div>
  );
}
