'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { dealOfTheDayAPI } from '@/services/api';

const DealOfTheDay = () => {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        const response = await dealOfTheDayAPI.getActiveDeal();
        if (response.success && response.data) {
          setDeal(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch deal of the day:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeal();
  }, []);

  useEffect(() => {
    if (!deal || !deal.endTime) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(deal.endTime).getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deal]);

  if (loading) return null; // Don't show anything while loading
  if (!deal) return null; // If no active deal, hide the component

  // If time has passed, optionally we could hide the component or just show 00:00:00
  // For now, we will just show it with 0s if expired.

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16 relative">
      <div 
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl flex items-center aspect-[21/9] sm:aspect-auto sm:min-h-[400px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${deal.image})` }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        {/* Content */}
        <div className="w-full md:w-2/3 lg:w-1/2 p-4 sm:p-10 lg:p-16 text-white relative z-10">
          <div className="inline-flex items-center gap-1 sm:gap-2 bg-white/20 px-2 py-1 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm mb-2 sm:mb-6 text-[8px] sm:text-sm font-bold tracking-wider uppercase border border-white/30">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" /> Limited Time Offer
          </div>

          <h2 className="text-base sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-4 leading-tight">
            {deal.title}
          </h2>
          <p className="text-blue-100 text-xs sm:text-lg mb-3 sm:mb-8 max-w-md hidden sm:block">
            {deal.subtitle}
          </p>

          {/* Countdown */}
          <div className="flex gap-1.5 sm:gap-4 mb-2 sm:mb-10">
            {timeLeft.days > 0 && (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-sm sm:text-2xl font-black shadow-lg">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <span className="text-[8px] sm:text-xs font-bold mt-1 sm:mt-2 text-blue-100 uppercase">Days</span>
                </div>
                <div className="text-lg sm:text-3xl font-bold mt-1 sm:mt-3">:</div>
              </>
            )}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-sm sm:text-2xl font-black shadow-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[8px] sm:text-xs font-bold mt-1 sm:mt-2 text-blue-100 uppercase">Hours</span>
            </div>
            <div className="text-lg sm:text-3xl font-bold mt-1 sm:mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-sm sm:text-2xl font-black shadow-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[8px] sm:text-xs font-bold mt-1 sm:mt-2 text-blue-100 uppercase">Mins</span>
            </div>
            <div className="text-lg sm:text-3xl font-bold mt-1 sm:mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center text-sm sm:text-2xl font-black shadow-lg">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[8px] sm:text-xs font-bold mt-1 sm:mt-2 text-blue-100 uppercase">Secs</span>
            </div>
          </div>

          <a href={deal.buttonLink} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-1.5 px-4 text-[10px] sm:py-4 sm:px-10 sm:text-base rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 inline-flex items-center gap-1 sm:gap-2">
            {deal.buttonText} <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;
