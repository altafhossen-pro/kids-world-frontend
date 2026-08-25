'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star, Heart, Minus, Plus, ShoppingCart, Share2,
  Shield, Truck, RefreshCcw, ChevronDown, ChevronUp,
  ZoomIn, CheckCircle2, Package
} from 'lucide-react';

// ── Static fake product data ────────────────────────────────────────────────
const FAKE_PRODUCT = {
  id: 'kw-demo-001',
  name: 'Kids Electric Ride On Car 12V with Remote Control',
  brand: 'Kids World',
  category: 'Ride On Cars',
  sku: 'KW-ROC-001',
  rating: 4.8,
  reviewCount: 128,
  price: 8990,
  originalPrice: 11000,
  discount: 18,
  stock: 15,
  description: `Experience the thrill of driving with the Kids World Electric Ride On Car! Designed for children aged 3–7, this premium battery-powered car features a 12V rechargeable battery, working headlights, a horn, and an MP3 music player. The parental remote control gives you peace of mind while your little one explores. Built with a robust ABS plastic body and non-slip rubber tyres, this car is as safe as it is stylish.`,
  highlights: [
    '12V rechargeable battery — up to 1.5 hrs ride time',
    'Parental remote control (2.4GHz)',
    'Working LED headlights & horn',
    'Built-in MP3 player with USB/TF card slot',
    'Forward & reverse with 2 speed settings (3 & 5 km/h)',
    'Non-slip rubber tyres & safety seat belt',
    'Max load: 30 kg | Age: 3–7 years',
  ],
  colors: [
    { label: 'Red', hex: '#EF4444' },
    { label: 'White', hex: '#F9FAFB' },
    { label: 'Black', hex: '#111827' },
    { label: 'Pink', hex: '#EC4899' },
  ],
  images: [
    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=800&q=80',
  ],
  reviews: [
    { name: 'Nadia Akter', date: 'May 20, 2024', rating: 5, comment: 'My son absolutely loves this car! Great build quality and the remote works perfectly. Highly recommended!' },
    { name: 'Rahim Hossain', date: 'May 15, 2024', rating: 5, comment: 'Excellent product. Delivery was fast and packaging was very secure. The car looks even better in person.' },
    { name: 'Sumaiya Islam', date: 'April 28, 2024', rating: 4, comment: 'Very nice product. The music system is a bonus! Assembly was easy. Took off one star as the manual was only in Chinese.' },
  ],
  relatedProducts: [
    { id: 'r1', name: 'Mercedes Benz G63 Kids Ride On', price: 12500, originalPrice: 15000, discount: 17, rating: 4.8, image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=400&q=80' },
    { id: 'r2', name: 'Kids Motorcycle 6V Electric', price: 5800, originalPrice: 7000, discount: 17, rating: 4.7, image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=400&q=80' },
    { id: 'r3', name: 'Classic Rocking Horse Brown', price: 4500, originalPrice: 5500, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?auto=format&fit=crop&w=400&q=80' },
    { id: 'r4', name: 'Kids Electric Jeep 4WD Black', price: 16500, originalPrice: 20000, discount: 18, rating: 4.9, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80' },
  ]
};

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

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-4 text-left text-sm font-bold text-gray-800 hover:text-blue-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="pb-4 text-sm text-gray-600 leading-relaxed">{children}</div>}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function NewProductDetails() {
  const p = FAKE_PRODUCT;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(p.colors[0].label);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
          <span>/</span>
          <Link href="/shop?category=ride-on-cars" className="hover:text-blue-600 transition-colors">Ride On Cars</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{p.name}</span>
        </nav>

        {/* ── Top Section ────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10 mb-14">

          {/* LEFT — Images */}
          <div className="w-full lg:w-[45%] space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-[#F0F7FF] rounded-2xl overflow-hidden border border-blue-50">
              <img
                src={p.images[selectedImage]}
                alt={p.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {p.discount > 0 && (
                <span className="absolute top-4 left-4 bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{p.discount}%
                </span>
              )}
              <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-100 hover:border-blue-300'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="w-full lg:w-[55%] space-y-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {p.category}
              </span>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> In Stock ({p.stock} left)
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug">{p.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRow rating={p.rating} size="md" />
              <span className="text-sm font-bold text-gray-700">{p.rating}</span>
              <span className="text-sm text-gray-400">({p.reviewCount} reviews)</span>
              <button className="text-sm text-blue-600 font-medium hover:underline ml-auto flex items-center gap-1">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 py-3 border-y border-gray-100">
              <span className="text-4xl font-black text-blue-600 leading-none">৳{p.price.toLocaleString()}</span>
              <span className="text-xl text-gray-400 line-through font-medium leading-none mb-1">৳{p.originalPrice.toLocaleString()}</span>
              <span className="bg-pink-100 text-pink-600 text-xs font-bold px-2 py-1 rounded-lg mb-0.5">Save ৳{(p.originalPrice - p.price).toLocaleString()}</span>
            </div>

            {/* Color Selection */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2.5">
                Color: <span className="text-blue-600">{selectedColor}</span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {p.colors.map(c => (
                  <button
                    key={c.label}
                    onClick={() => setSelectedColor(c.label)}
                    title={c.label}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.label ? 'border-blue-500 scale-110 shadow-md' : 'border-gray-200 hover:border-blue-300'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2.5">Quantity</p>
              <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-12">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="px-4 h-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-5 font-bold text-gray-800 text-lg min-w-[3rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(p.stock, q + 1))}
                  className="px-4 h-full text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons (Add to Cart + Buy Now + Wishlist) */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-12 flex items-center justify-center gap-2 font-bold rounded-xl transition-all ${addedToCart ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
              >
                {addedToCart ? <><CheckCircle2 className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
              </button>

              {/* Buy Now */}
              <Link href="/checkout" className="flex-1 flex items-center justify-center gap-2 h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-100">
                <Package className="w-5 h-5" /> Buy Now
              </Link>

              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(w => !w)}
                className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-all shrink-0 ${wishlisted ? 'bg-pink-50 border-pink-300 text-pink-500' : 'border-gray-200 text-gray-400 hover:border-pink-300 hover:text-pink-400'}`}
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
              <p><span className="font-semibold text-gray-600">SKU:</span> {p.sku}</p>
              <p><span className="font-semibold text-gray-600">Brand:</span> {p.brand}</p>
            </div>
          </div>
        </div>

        {/* ── Details Accordion ─────────────── */}
        <div className="mb-14 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <AccordionItem title="Product Description" defaultOpen>
            <p>{p.description}</p>
          </AccordionItem>
          <AccordionItem title="Key Highlights">
            <ul className="space-y-2">
              {p.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </AccordionItem>
          <AccordionItem title="Delivery & Returns">
            <ul className="space-y-2">
              <li>📦 Dhaka: 1–2 business days (Inside Dhaka)</li>
              <li>🚚 Nationwide: 3–5 business days</li>
              <li>↩️ 7-day easy return policy from delivery date</li>
              <li>💳 Cash on delivery available throughout Bangladesh</li>
            </ul>
          </AccordionItem>
        </div>

        {/* ── Customer Reviews ─────────────── */}
        <div className="mb-14">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:p-8">
            <h3 className="font-extrabold text-gray-900 mb-4">Customer Reviews</h3>
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="text-center">
                <p className="text-5xl font-black text-blue-600 leading-none">{p.rating}</p>
                <StarRow rating={p.rating} />
                <p className="text-xs text-gray-500 mt-1">{p.reviewCount} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{s}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full"
                        style={{ width: s === 5 ? '72%' : s === 4 ? '18%' : s === 3 ? '6%' : '2%' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {p.reviews.map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-gray-800">{r.name}</p>
                    <span className="text-[10px] text-gray-400">{r.date}</span>
                  </div>
                  <StarRow rating={r.rating} />
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Related Products ──────────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-3">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {p.relatedProducts.map(rp => (
              <Link href="/product/kids-electric-ride-on-car" key={rp.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                <div className="aspect-square bg-[#F0F7FF] overflow-hidden relative">
                  <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {rp.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">-{rp.discount}%</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{rp.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-blue-600">৳{rp.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">৳{rp.originalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
