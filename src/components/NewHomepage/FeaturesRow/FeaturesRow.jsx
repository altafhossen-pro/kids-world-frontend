import React from 'react';
import { Truck, Shield, RotateCcw, HeadphonesIcon } from 'lucide-react';

const FeaturesRow = () => {
  const features = [
    { icon: Truck, title: "Free Delivery", sub: "On orders over ৳2,000", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Shield, title: "100% Secure Payment", sub: "Safe & Secure", color: "text-green-500", bg: "bg-green-50" },
    { icon: RotateCcw, title: "7 Days Easy Return", sub: "Hassle Free Return", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: HeadphonesIcon, title: "24/7 Support", sub: "We're here to help", color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 lg:mt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-6">
        {features.map((item, i) => (
          <div key={i} className="flex flex-col lg:flex-row items-center gap-2 lg:gap-5 bg-white p-2 sm:p-6 rounded-xl sm:rounded-3xl shadow-sm sm:border border-gray-100 hover:shadow-md transition-shadow text-center lg:text-left">
            <div className={`${item.bg} ${item.color} p-2 sm:p-4 rounded-xl sm:rounded-2xl`}>
              <item.icon className="w-5 h-5 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h4 className="text-[10px] sm:text-lg font-bold text-gray-800 leading-tight">{item.title}</h4>
              <p className="hidden sm:block text-sm text-gray-500 font-medium mt-1">{item.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesRow;
