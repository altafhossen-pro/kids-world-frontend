import React from 'react';
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    name: "Sarah M.",
    role: "Mother of 2",
    text: "The quality of the toys is outstanding! My kids love the educational blocks, and I love how fast the delivery was. Kids World is now my go-to toy shop.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "David K.",
    role: "Father",
    text: "Bought a ride-on car for my son's birthday. The customer service helped me pick the right model. The car is 100% safe and my son won't stop driving it!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Ayesha R.",
    role: "Aunt",
    text: "Beautiful collection of stuffed toys. They are really soft and premium quality. Definitely worth the price. Will be buying more gifts from here.",
    rating: 4,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  }
];

const Testimonials = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-16">
      <div className="text-center mb-6 sm:mb-12">
        <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-0 sm:mb-4">Happy Parents, Happy Kids</h2>
        <p className="text-xs sm:text-base text-gray-500 font-medium">See what our customers have to say about us</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative">
            <Quote className="absolute top-6 right-6 w-12 h-12 text-blue-50" />
            
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, index) => (
                <Star 
                  key={index} 
                  className={`w-4 h-4 ${index < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} 
                />
              ))}
            </div>
            
            <p className="text-gray-700 italic mb-8 relative z-10 leading-relaxed">
              "{review.text}"
            </p>
            
            <div className="flex items-center gap-4 mt-auto">
              <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-gray-900">{review.name}</h4>
                <p className="text-xs text-gray-500 font-medium">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
