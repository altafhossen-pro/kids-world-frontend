'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';

const DealOfTheDay = () => {
  // Simple countdown timer logic for UI purposes
  const [timeLeft, setTimeLeft] = useState({
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center">
        
        {/* Left: Content */}
        <div className="w-full md:w-1/2 p-10 lg:p-16 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm mb-6 text-sm font-bold tracking-wider uppercase">
            <Clock className="w-4 h-4" /> Limited Time Offer
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
            Deal of the Day!
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            Get the ultimate kids electric ride-on sports car at a massive discount. Don't miss out!
          </p>
          
          {/* Countdown */}
          <div className="flex gap-4 mb-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-xs font-bold mt-2 text-blue-100 uppercase">Hours</span>
            </div>
            <div className="text-3xl font-bold mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-xs font-bold mt-2 text-blue-100 uppercase">Mins</span>
            </div>
            <div className="text-3xl font-bold mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-xs font-bold mt-2 text-blue-100 uppercase">Secs</span>
            </div>
          </div>
          
          <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-4 px-10 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2">
            Shop Deal Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Right: Image */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-auto">
          <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80" 
            alt="Deal of the day" 
            className="w-full h-full object-cover"
          />
          {/* Price Tag */}
          <div className="absolute top-10 right-10 z-20 bg-pink-500 text-white p-4 rounded-full w-24 h-24 flex flex-col items-center justify-center shadow-2xl transform rotate-12 ring-4 ring-white">
            <span className="text-[10px] font-bold line-through">৳4500</span>
            <span className="text-xl font-black">৳3200</span>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default DealOfTheDay;
