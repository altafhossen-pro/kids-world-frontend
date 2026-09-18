'use client';
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, User, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import { userAPI, otpAPI } from '@/services/api';

const LoginPage = () => {
  const { login } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // States for OTP login
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    phone: '',
    otp: ''
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      const limitedValue = numericValue.slice(0, 11);
      
      setLoginForm(prev => ({
        ...prev,
        [name]: limitedValue
      }));
      
      validatePhone(limitedValue);
    } else {
      setLoginForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validatePhone = (phone) => {
    if (!phone) {
      setPhoneError('');
      return false;
    }
    if (phone.length !== 11) {
      setPhoneError('Phone number must be 11 digits');
      return false;
    }
    if (!phone.startsWith('01')) {
      setPhoneError('Phone number must start with 01');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const isValidPhone = () => {
    return loginForm.phone.length === 11 && loginForm.phone.startsWith('01') && !phoneError;
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `${minutes} min ${remainingSeconds} sec`;
  };

  const formatRateLimitMessage = (message) => {
    const secondsMatch = message.match(/wait (\d+) seconds?/i);
    if (secondsMatch) {
      const seconds = parseInt(secondsMatch[1]);
      return message.replace(/\d+ seconds?/i, formatTimeRemaining(seconds));
    }
    return message;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if(!loginForm.email || !loginForm.password) return;
    
    setLoading(true);
    try {
      const data = await userAPI.login({
        emailOrPhone: loginForm.email,
        password: loginForm.password
      });

      if (data.success) {
        login(data.data.user, data.data.token);
        toast.success('Login successful!');
        if (data.data.user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push(redirectUrl || '/');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!loginForm.phone) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!validatePhone(loginForm.phone)) {
      toast.error('Please enter a valid phone number (11 digits starting with 01)');
      return;
    }

    setLoading(true);
    try {
      const data = await otpAPI.sendOTP(loginForm.phone, 'login');
      if (data.success) {
        setOtpSent(true);
        toast.success('OTP sent to your phone number');
      } else {
        toast.error(formatRateLimitMessage(data.message || 'Failed to send OTP'));
      }
    } catch (error) {
      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(formatRateLimitMessage(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!loginForm.otp) {
      toast.error('Please enter OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await otpAPI.verifyOTP(loginForm.phone, loginForm.otp);
      if (data.success) {
        setOtpVerified(true);
        toast.success('OTP verified successfully!');
        if (data.data && data.data.user && data.data.token) {
          login(data.data.user, data.data.token);
          if (data.data.user?.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push(redirectUrl || '/');
          }
        } else {
          toast.error('Login data not received. Please try again.');
        }
      } else {
        toast.error(data.message || 'Invalid OTP');
      }
    } catch (error) {
      let errorMessage = 'OTP verification failed. Please try again.';
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setLoginForm(prev => ({ ...prev, otp: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 md:p-10 z-10 relative">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#0B1E4A] mb-2 tracking-tight">Please Login</h2>
          <p className="text-gray-500 font-medium">Choose your preferred login method</p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8 border border-gray-100">
          <button 
            type="button"
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
            type="button"
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
            type="button"
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
            <form className="space-y-5 animate-in fade-in zoom-in-95 duration-200" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="block w-full pl-11 pr-11 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    placeholder="Enter your password"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input type="checkbox" id="remember" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <label htmlFor="remember" className="ml-2 block text-sm font-medium text-gray-600">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 mt-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors gap-2"
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <>Sign in with Email <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Phone Tab */}
          {activeTab === 'phone' && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {!otpSent ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        maxLength={11}
                        value={loginForm.phone}
                        onChange={handleLoginChange}
                        className={`block w-full pl-11 pr-4 py-3.5 bg-white border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-xl text-gray-900 focus:ring-2 focus:border-transparent transition-all outline-none`}
                        placeholder="01XXXXXXXXX (11 digits)"
                      />
                    </div>
                    {phoneError ? (
                      <p className="mt-2 text-xs text-red-500">{phoneError}</p>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">Enter your 11-digit phone number starting with 01</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !isValidPhone()}
                    className="w-full flex justify-center items-center py-4 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Send OTP'}
                  </button>
                </>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        name="otp"
                        type="text"
                        maxLength="6"
                        required
                        value={loginForm.otp}
                        onChange={handleLoginChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none tracking-widest text-center text-lg"
                        placeholder="000000"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      Enter the 6-digit code sent to {loginForm.phone}
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !loginForm.otp}
                    className="w-full flex justify-center items-center py-4 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Verify OTP'}
                  </button>
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-bold disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpVerified(false);
                        setPhoneError('');
                        setLoginForm(prev => ({ ...prev, otp: '', phone: '' }));
                      }}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 font-bold"
                    >
                      Change Number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="flex flex-col items-center justify-center h-full animate-in fade-in zoom-in-95 duration-200 py-6">
              <p className="text-gray-600 font-medium mb-6">Sign in with your social account</p>
              
              <button 
                onClick={() => toast.info('Google login coming soon!')}
                className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </button>
            </div>
          )}

        </div>

        <div className="mt-8 pt-6 flex justify-center items-center gap-2">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
          <p className="text-gray-600 text-sm font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Sign up
            </Link>
          </p>
        </div>

      </div>

      <div className="mt-8 text-center relative z-10">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our <Link href="/terms-conditions" className="text-gray-600 hover:underline">Terms of Service</Link> and <Link href="/privacy-policy" className="text-gray-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <LoginPage />
    </Suspense>
  );
}