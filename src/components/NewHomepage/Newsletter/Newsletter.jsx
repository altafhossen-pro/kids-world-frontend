import React from 'react';
import { Send } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 mb-20">
      <div className="bg-[#1877F2] rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-xl shadow-blue-200">

        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500 opacity-20 rounded-full transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="w-full md:w-1/2 relative z-10 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Join Our Kids World Family!
          </h2>
          <p className="text-blue-100 text-lg">
            Subscribe to our newsletter to get updates on our latest offers, new arrivals and get <span className="font-bold text-yellow-300">10% OFF</span> your first order!
          </p>
        </div>

        <div className="w-full md:w-5/12 relative z-10">
          <form className="flex w-full bg-white p-2 rounded-full shadow-lg">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 outline-none text-gray-700 bg-transparent"
              required
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-colors">
              Subscribe <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-blue-200 mt-4 text-center md:text-left">
            We promise not to spam your inbox. Unsubscribe anytime.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Newsletter;
