'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Trash2, Minus, Plus, CreditCard, CheckCircle2 } from 'lucide-react';

// Fake cart items
const initialCart = [
  {
    id: 1,
    name: 'Kids Electric Ride On Car 12V',
    price: 8990,
    qty: 1,
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: '3-Wheel LED Scooter Pink',
    price: 2100,
    qty: 1,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=400&q=80',
  }
];

export default function NewCheckout() {
  const [cart, setCart] = useState(initialCart);
  const [deliveryType, setDeliveryType] = useState('inside');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const deliveryCharges = {
    'inside': 80,
    'sub': 120,
    'outside': 150,
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryCharge = deliveryCharges[deliveryType];
  const total = subtotal + deliveryCharge;

  const handleUpdateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-8 font-medium">Thank you for your order. We have received your request and will process it shortly.</p>
          <Link href="/shop" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 w-full">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-black text-gray-900 text-center mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
          
          {/* LEFT: Checkout Form */}
          <div className="flex-1 space-y-6">
            
            {/* Step 1: Info */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-600">01.</span> Fill in the following information:
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name / আপনার পুরো নাম: <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter your full name here" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number / মোবাইল নম্বর: <span className="text-red-500">*</span></label>
                  <input type="tel" placeholder="Enter your mobile number here" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Division / বিভাগ: <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                    <option value="">Select Division</option>
                    <option value="dhaka">Dhaka</option>
                    <option value="chittagong">Chittagong</option>
                    <option value="sylhet">Sylhet</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address / ডেলিভারি এড্রেস: <span className="text-red-500">*</span></label>
                  <textarea placeholder="Delivery Address" rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Order Notes / নোট লিখুন: (optional)</label>
                  <textarea placeholder="Enter notes here (optional)" rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Type */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-600">02.</span> Delivery Type <span className="text-red-500">*</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'inside', label: 'Inside Dhaka', price: 80 },
                  { id: 'sub', label: 'Sub Dhaka', price: 120 },
                  { id: 'outside', label: 'Outside Dhaka', price: 150 },
                ].map(type => (
                  <label 
                    key={type.id} 
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${deliveryType === type.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}
                  >
                    <input 
                      type="radio" 
                      name="deliveryType" 
                      checked={deliveryType === type.id} 
                      onChange={() => setDeliveryType(type.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{type.label}</p>
                      <p className="text-xs font-medium text-gray-500">{type.price} ৳</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-blue-600">03.</span> Payment Method <span className="text-red-500">*</span>
              </h2>
              <label className={`inline-flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <p className="font-bold text-gray-800 text-sm">Cash On Delivery</p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/shop" className="flex-1 flex items-center justify-center gap-2 h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all">
                <ArrowLeft className="w-4 h-4" /> Back to Shopping
              </Link>
              <button 
                onClick={() => setOrderConfirmed(true)}
                className="flex-[2] flex items-center justify-center gap-2 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200"
              >
                Confirm Order <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</p>
                          <p className="text-[10px] text-gray-500 font-medium">Price: {item.price} ৳</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {/* Qty Control */}
                          <div className="flex items-center bg-white border border-gray-200 rounded-md overflow-hidden h-7">
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="px-2 h-full text-gray-500 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                            <span className="px-2 font-bold text-gray-800 text-xs">{item.qty}</span>
                            <button onClick={() => handleUpdateQty(item.id, 1)} className="px-2 h-full text-gray-500 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                          </div>
                          {/* Item Total & Remove */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">{item.price * item.qty} ৳</span>
                            <button onClick={() => handleRemove(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Coupon */}
              <div className="mb-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Enter Your Coupon Code</p>
                <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded-lg border border-yellow-200 mb-3 flex items-start gap-2">
                  <span className="font-bold">⚠️</span>
                  <span>Coupon feature is available for registered users only</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="ENTER YOUR COUPON CODE" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all uppercase" />
                  <button className="px-6 bg-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-200 transition-colors text-sm">
                    Apply
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal</span>
                  <span>{subtotal} ৳</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Delivery Charge</span>
                  <span className="text-orange-500">{deliveryCharge} ৳</span>
                </div>
                <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                  <span>TOTAL COST:</span>
                  <span className="text-blue-600">{total} ৳</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
