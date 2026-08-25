'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, User, Lock, Eye, ArrowLeft, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState('email');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 z-10 relative">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#0B1E4A] mb-2 tracking-tight">Create Account</h2>
          <p className="text-gray-500 font-medium">Choose your preferred signup method</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
          <button 
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'email' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            <Mail className="w-4 h-4" /> Email
          </button>
          <button 
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'phone' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('phone')}
          >
            <Phone className="w-4 h-4" /> Phone
          </button>
          <button 
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'social' 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('social')}
          >
            <User className="w-4 h-4" /> Social
          </button>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[250px]">
          
          {/* Email Tab */}
          {activeTab === 'email' && (
            <form className="space-y-4 animate-in fade-in zoom-in-95 duration-200" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-11 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Create a password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer">
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors gap-2"
              >
                Sign up with Email <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Phone Tab */}
          {activeTab === 'phone' && (
            <form className="space-y-4 animate-in fade-in zoom-in-95 duration-200" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="01XXXXXXXXX (11 digits)"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Enter your 11-digit phone number starting with 01</p>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Send OTP
              </button>
            </form>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-200 py-6">
              <p className="text-gray-600 font-medium mb-6">Sign up with your social account</p>
              
              <button className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>
          )}

        </div>

        <div className="mt-8 pt-6 flex justify-center items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <p className="text-gray-600 text-sm font-medium">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign In
            </Link>
          </p>
        </div>

      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our <a href="#" className="text-gray-600 hover:underline">Terms of Service</a> and <a href="#" className="text-gray-600 hover:underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
