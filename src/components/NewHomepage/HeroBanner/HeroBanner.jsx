'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Tag, Truck, Smile } from 'lucide-react';

const slides = [
  {
    id: 1,
    badge: 'NEW COLLECTION',
    heading1: 'Discover Fun.',
    heading2: 'Explore More!',
    description: 'Safe, stylish & high quality toys for your little ones. Ride on cars, scooters, bicycles & more.',
    cta: 'Shop Now',
    ctaHref: '/shop',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=700&q=80',
    bg: '#E8F3FD',
  },
  {
    id: 2,
    badge: 'BEST SELLERS',
    heading1: 'Ride On Cars',
    heading2: 'Kids Love!',
    description: 'Premium electric ride on cars for every age group. Safe, durable & loads of fun.',
    cta: 'View Ride Ons',
    ctaHref: '/shop?category=ride-on-cars',
    image: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?auto=format&fit=crop&w=700&q=80',
    bg: '#EEF4FF',
  },
  {
    id: 3,
    badge: 'UP TO 30% OFF',
    heading1: 'Scooters &',
    heading2: 'Bicycles!',
    description: 'Build confidence and motor skills with our range of kids scooters and bicycles.',
    cta: 'Shop Scooters',
    ctaHref: '/shop?category=scooters',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=80',
    bg: '#F0FDF4',
  },
];

const trustBadges = [
  { icon: ShieldCheck, title: '100% Safe', sub: 'For Kids', color: 'text-blue-600' },
  { icon: Tag, title: 'Best Prices', sub: 'Everyday', color: 'text-pink-500' },
  { icon: Truck, title: 'Fast Delivery', sub: 'Nationwide', color: 'text-green-500' },
  { icon: Smile, title: 'Trusted by', sub: 'Parents', color: 'text-orange-500' },
];

const INTERVAL_MS = 5000;

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  // Fade-transition helper — fade out → swap slide → fade in
  const goTo = (index) => {
    if (index === current) return;
    setVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setVisible(true);
    }, 300); // matches CSS transition duration
  };

  const next = () => goTo((current + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, current]);

  const slide = slides[current];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      <div
        className="relative rounded-xl overflow-hidden flex flex-col lg:flex-row items-stretch min-h-[460px] shadow-sm"
        style={{
          backgroundColor: slide.bg,
          transition: 'background-color 0.4s ease',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Fading inner wrapper — everything fades together */}
        <div
          className="flex flex-col lg:flex-row w-full"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}
        >
          {/* ── Left Content ─────────────────────────────── */}
          <div className="relative z-10 w-full lg:w-[55%] p-8 lg:p-14 lg:pr-6 flex flex-col justify-between">
            <div>
              {/* Pill badge */}
              <div className="inline-flex items-center px-4 py-1.5 bg-white text-blue-600 font-extrabold text-[11px] rounded-full border border-blue-100 mb-7 tracking-widest shadow-sm">
                {slide.badge}
              </div>

              {/* Headlines */}
              <h1 className="text-4xl lg:text-[3.75rem] font-extrabold leading-[1.1] text-gray-900 tracking-tight mb-1">
                {slide.heading1}
              </h1>
              <h1 className="text-4xl lg:text-[3.75rem] font-extrabold leading-[1.1] text-blue-600 tracking-tight mb-6">
                {slide.heading2}
              </h1>

              {/* Description */}
              <p className="text-base lg:text-lg text-gray-600 mb-8 max-w-sm font-medium leading-relaxed">
                {slide.description}
              </p>

              {/* CTA */}
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 w-max"
              >
                {slide.cta} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 lg:gap-8 mt-10 lg:mt-14">
              {trustBadges.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <item.icon className={`w-7 h-7 ${item.color} stroke-[1.5]`} />
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-extrabold text-gray-800">{item.title}</span>
                    <span className="text-xs text-gray-500 font-medium">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Image ───────────────────────────────── */}
          <div className="relative w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-10">
            <img
              src={slide.image}
              alt={slide.heading1}
              className="w-full max-h-[380px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* ── Dot Indicators — centered at bottom ──────── */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === current
                  ? 'w-6 h-2.5 bg-blue-600'
                  : 'w-2.5 h-2.5 bg-gray-400/50 hover:bg-blue-400'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
