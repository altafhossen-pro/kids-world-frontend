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
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl overflow-hidden shadow-xl flex flex-col md:flex-row items-center">

        {/* Left: Content */}
        <div className="w-full md:w-1/2 p-10 lg:p-16 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm mb-6 text-sm font-bold tracking-wider uppercase">
            <Clock className="w-4 h-4" /> Limited Time Offer
          </div>

          <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
            {deal.title}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-md">
            {deal.subtitle}
          </p>

          {/* Countdown */}
          <div className="flex gap-2 sm:gap-4 mb-10">
            {timeLeft.days > 0 && (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg">
                    {String(timeLeft.days).padStart(2, '0')}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold mt-2 text-blue-100 uppercase">Days</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3">:</div>
              </>
            )}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] sm:text-xs font-bold mt-2 text-blue-100 uppercase">Hours</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] sm:text-xs font-bold mt-2 text-blue-100 uppercase">Mins</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mt-2 sm:mt-3">:</div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] sm:text-xs font-bold mt-2 text-blue-100 uppercase">Secs</span>
            </div>
          </div>

          <a href={deal.buttonLink} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-black py-4 px-10 rounded-xl shadow-lg transition-all duration-300 inline-flex items-center gap-2">
            {deal.buttonText} <ArrowRight className="w-5 h-5" />
          </a>
        </div>

        {/* Right: Image */}
        <div className="w-full md:w-1/2 relative h-[400px] md:h-auto p-4">
          <div className="absolute inset-0 bg-blue-500/20 mix-blend-overlay z-10"></div>
          <img
            src={deal.image}
            alt={deal.title}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

      </div>
    </section>
  );
};

export default DealOfTheDay;
