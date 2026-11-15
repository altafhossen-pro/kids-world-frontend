'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Trash2, Minus, Plus, CreditCard, Loader2, AlertCircle, X } from 'lucide-react';
import { addressAPI, orderAPI, couponAPI, settingsAPI } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import { trackInitiateCheckout, trackPurchase } from '@/utils/metaPixel';
import { identifyVisitorProfile } from '@/utils/visitorTracker';

// Sanitizes phone numbers by stripping +880, +88, 880 (from autofill/copy-paste), non-digits, and capping at 11 digits
export const sanitizePhoneNumber = (input = '') => {
  if (!input) return '';
  let val = String(input).trim();
  if (val.startsWith('+880')) {
    val = val.substring(3);
  } else if (val.startsWith('+88')) {
    val = val.substring(3);
  }
  val = val.replace(/\D/g, '');
  if (val.startsWith('880') && val.length > 11) {
    val = val.substring(2);
  }
  if (val.length > 11) {
    val = val.slice(0, 11);
  }
  return val;
};

export default function NewCheckout() {
  const router = useRouter();
  const { user, token, cart = [], cartTotal, updateCartItem, removeFromCart, cartLoading, clearCart } = useAppContext();

  const [deliveryType, setDeliveryType] = useState('inside');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [piprapayConfig, setPiprapayConfig] = useState({
    isEnabled: false,
    showOnCheckout: false,
    displayName: 'Online Payment (bKash / Nagad / Rocket / Cards)',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockOutError, setStockOutError] = useState(null);
  const [orderError, setOrderError] = useState(null);

  // Address State
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [dhakaAreas, setDhakaAreas] = useState([]);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    divisionId: '',
    divisionName: '',
    districtId: '',
    districtName: '',
    upazilaId: '',
    upazilaName: '',
    areaId: '',
    areaName: '',
    address: '',
    notes: '',
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const initiatedCheckoutRef = React.useRef(false);
  useEffect(() => {
    if (!initiatedCheckoutRef.current) {
      const hasStateCart = cart && cart.length > 0;
      let hasSavedCart = false;
      if (typeof window !== 'undefined') {
        try {
          const s = localStorage.getItem('cart');
          if (s && JSON.parse(s)?.length > 0) hasSavedCart = true;
        } catch (e) {}
      }

      if (hasStateCart || hasSavedCart) {
        initiatedCheckoutRef.current = true;
        trackInitiateCheckout(cart, cartTotal, user);
      }
    }
  }, [cart, cartTotal, user]);

  useEffect(() => {
    fetchDivisions();
    fetchPaymentSettings();
  }, []);

  const fetchPaymentSettings = async () => {
    try {
      const response = await settingsAPI.getPublicPaymentSettings();
      if (response.success && response.data?.piprapay) {
        setPiprapayConfig(response.data.piprapay);
      }
    } catch (error) {
      console.warn('Failed to fetch payment settings:', error);
    }
  };

  useEffect(() => {
    if (formData.districtId) {
      if (formData.districtId === '65') {
        setDeliveryType('inside');
      } else if (formData.districtId === '1') {
        setDeliveryType('sub');
      } else {
        setDeliveryType('outside');
      }
    }
  }, [formData.districtId]);

  const fetchDivisions = async () => {
    try {
      const response = await addressAPI.getDivisions();
      if (response.success) setDivisions(response.data);
    } catch (error) {
      console.error('Failed to fetch divisions', error);
    }
  };

  const fetchDistricts = async (divisionId) => {
    try {
      const response = await addressAPI.getDistrictsByDivision(divisionId);
      if (response.success) setDistricts(response.data);
    } catch (error) {
      console.error('Failed to fetch districts', error);
    }
  };

  const fetchUpazilas = async (districtId) => {
    try {
      const response = await addressAPI.getUpazilasByDistrict(districtId);
      if (response.success) setUpazilas(response.data);
    } catch (error) {
      console.error('Failed to fetch upazilas', error);
    }
  };

  const fetchDhakaAreas = async () => {
    try {
      const response = await addressAPI.getAllDhakaCityAreas();
      if (response.success) setDhakaAreas(response.data);
    } catch (error) {
      console.error('Failed to fetch Dhaka areas', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'divisionId') {
      const selected = divisions.find(d => d.id === value);
      setFormData(prev => ({
        ...prev,
        divisionId: value,
        divisionName: selected ? selected.name : '',
        districtId: '', districtName: '',
        upazilaId: '', upazilaName: '',
        areaId: '', areaName: ''
      }));
      if (value) {
        fetchDistricts(value);
      } else {
        setDistricts([]);
      }
    } else if (name === 'districtId') {
      const selected = districts.find(d => d.id === value);
      setFormData(prev => ({
        ...prev,
        districtId: value,
        districtName: selected ? selected.name : '',
        upazilaId: '', upazilaName: '',
        areaId: '', areaName: ''
      }));
      if (value === '65') {
        fetchDhakaAreas();
      } else if (value) {
        fetchUpazilas(value);
      }
    } else if (name === 'upazilaId') {
      const selected = upazilas.find(u => u.id === value);
      setFormData(prev => ({
        ...prev,
        upazilaId: value,
        upazilaName: selected ? selected.name : ''
      }));
    } else if (name === 'areaId') {
      const selected = dhakaAreas.find(a => a._id === value);
      setFormData(prev => ({
        ...prev,
        areaId: value,
        areaName: selected ? selected.name : ''
      }));
    } else if (name === 'phone') {
      const sanitized = sanitizePhoneNumber(value);
      setFormData(prev => ({ ...prev, phone: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const deliveryCharges = {
    'inside': 80,
    'sub': 120,
    'outside': 150,
  };

  const subtotal = cartTotal || 0;
  const deliveryCharge = deliveryCharges[deliveryType] || 0;
  const total = Math.max(0, subtotal + deliveryCharge - couponDiscount);

  // Real-time debounced tracking of visitor identity (captures 11-digit mobile numbers & debounced addresses)
  useEffect(() => {
    const cleanPhoneDigits = sanitizePhoneNumber(formData.phone);
    const isValid11DigitPhone = /^01[3-9]\d{8}$/.test(cleanPhoneDigits);
    const phone = isValid11DigitPhone ? cleanPhoneDigits : null;

    const name = formData.fullName?.trim() || '';
    const hasConsecutiveRepeat = /(.)\1{2,}/iu.test(name);
    const notes = formData.notes?.trim() || '';
    const addressParts = [
      formData.address,
      formData.areaName,
      formData.upazilaName,
      formData.districtName,
      formData.divisionName
    ].filter(Boolean);
    const fullAddr = addressParts.join(', ').trim();

    const hasValidName = name.length >= 2 && !hasConsecutiveRepeat;
    const hasValidAddr = fullAddr.length >= 6;

    // Strictly require either a complete 11-digit phone number OR a meaningful name/address
    if (isValid11DigitPhone || hasValidName || hasValidAddr) {
      const timer = setTimeout(() => {
        identifyVisitorProfile({
          phone: phone || null,
          fullName: hasValidName ? name : null,
          address: hasValidAddr ? fullAddr : null,
          notes: notes || null,
          customerNotes: notes || null,
          deliveryCharge: deliveryCharge || 0,
          cartTotal: total > 0 ? total : subtotal
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [
    formData.phone,
    formData.fullName,
    formData.address,
    formData.areaName,
    formData.upazilaName,
    formData.districtName,
    formData.divisionName,
    formData.notes,
    total,
    deliveryCharge,
    subtotal
  ]);

  const handleUpdateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      const newQty = Math.max(1, item.quantity + delta);
      updateCartItem(id, newQty);
    }
  };

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      return toast.error('Please enter a coupon code');
    }

    setIsApplyingCoupon(true);
    try {
      const response = await couponAPI.validateCoupon(couponCode, subtotal);
      if (response.success) {
        setAppliedCoupon(couponCode);
        setCouponDiscount(response.data.discountAmount || 0);
        toast.success(`Coupon applied! You saved ${response.data.discountAmount || 0} ৳`);
      } else {
        toast.error(response.message || 'Invalid coupon');
        setAppliedCoupon('');
        setCouponDiscount(0);
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
      setAppliedCoupon('');
      setCouponDiscount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon('');
    setCouponDiscount(0);
    toast.success('Coupon removed');
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      return toast.error('Your cart is empty');
    }

    const trimmedName = formData.fullName?.trim() || '';
    if (!trimmedName) {
      return toast.error('অনুগ্রহ করে আপনার পুরো নাম লিখুন (Please enter your full name)');
    }

    // Name validation: Reject if any character repeats 3 or more times consecutively
    if (/(.)\1{2,}/iu.test(trimmedName)) {
      return toast.error('আপনার অর্ডারটি এই মুহূর্তে নেওয়া যাচ্ছে না, দয়া করে আমাদের সাপোর্টে যোগাযোগ করুন।', { duration: 6000 });
    }

    if (trimmedName.length < 2) {
      return toast.error('অনুগ্রহ করে আপনার সঠিক নাম লিখুন');
    }

    // Phone validation: Must start with 01 and be exactly 11 digits
    const cleanPhone = sanitizePhoneNumber(formData.phone);
    if (!cleanPhone || !cleanPhone.startsWith('01') || cleanPhone.length !== 11) {
      return toast.error('১১ ডিজিটের সঠিক মোবাইল নম্বর দিন যা 01 দিয়ে শুরু (যেমন: 01XXXXXXXXX)');
    }

    if (!formData.address?.trim()) {
      return toast.error('অনুগ্রহ করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা দিন (Please enter delivery address)');
    }

    setOrderError(null);
    setIsSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        variantSku: item.sku || null,
        variant: item.variantData || null,
        image: item.image || null
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          name: trimmedName,
          phone: cleanPhone,
          street: formData.address.trim(),
          divisionId: formData.divisionId || undefined,
          districtId: formData.districtId || undefined,
          upazilaId: formData.upazilaId || undefined,
          areaId: formData.areaId || undefined,
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        shippingCost: deliveryCharge,
        subtotal: subtotal,
        total: total,
      };

      if (appliedCoupon) {
        orderData.coupon = appliedCoupon;
      }

      if (typeof window !== 'undefined') {
        const storedVisitorId = localStorage.getItem('kw_visitor_id');
        if (storedVisitorId) {
          orderData.visitorId = storedVisitorId;
        }
      }

      // Add guest info if user is not logged in
      if (!user) {
        orderData.guestInfo = {
          name: trimmedName,
          phone: cleanPhone
        };
      }

      // If notes exist
      if (formData.notes.trim()) {
        orderData.notes = formData.notes.trim();
      }

      let response;
      if (user) {
        response = await orderAPI.createOrder(orderData, token);
      } else {
        response = await orderAPI.createGuestOrder(orderData);
      }

      if (response.success) {
        // If online payment via PipraPay is selected, redirect directly to gateway without showing pending order confirmation
        if (paymentMethod === 'piprapay') {
          if (response.data?.paymentUrl) {
            clearCart();
            toast.success('Redirecting to PipraPay payment gateway...');
            window.location.href = response.data.paymentUrl;
            return;
          } else {
            const msg = response?.message || 'Payment gateway failed to initialize. Please try again.';
            setOrderError(msg);
            toast.error(msg, { duration: 6000 });
            setIsSubmitting(false);
            return;
          }
        }

        // Standard COD Order Confirmation:
        toast.success('Order placed successfully!');

        // Track Purchase for Meta Pixel & CAPI
        trackPurchase({
          ...orderData,
          orderId: response.data?.orderId || response.data?._id || '',
          total: response.data?.total || total
        }, user);

        clearCart();

        const orderId = response.data.orderId || response.data._id;
        const status = response.data.status || 'pending';
        const finalTotal = response.data.total;
        const createdAt = response.data.createdAt;
        const isGuestOrder = !user;

        let redirectUrl = `/order-confirmation?orderId=${orderId}&status=${status}&total=${finalTotal}&createdAt=${createdAt}&isGuestOrder=${isGuestOrder}`;

        if (couponDiscount > 0) {
          redirectUrl += `&couponDiscount=${couponDiscount}`;
        }
        if (appliedCoupon) {
          redirectUrl += `&coupon=${appliedCoupon}`;
        }

        router.push(redirectUrl);
      } else {
        // Check if the error is an out of stock error
        const errMsg = response?.message || 'Failed to place order';
        if (errMsg.includes('currently out of stock')) {
          setStockOutError(errMsg);
        } else {
          setOrderError(errMsg);
          toast.error(errMsg, { duration: 6000 });
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      const errMsg =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while placing the order. Please try again.';

      if (errMsg.includes('currently out of stock')) {
        setStockOutError(errMsg);
      } else {
        setOrderError(errMsg);
        toast.error(errMsg, { duration: 6000 });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-3 lg:py-8">
      <div className="container mx-auto px-4 sm:px-4 lg:px-6">

        <h1 className="text-3xl font-black text-gray-900 text-center mb-3 lg:mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-auto">

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
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name here"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      formData.fullName && /(.)\1{2,}/iu.test(formData.fullName)
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  {formData.fullName && /(.)\1{2,}/iu.test(formData.fullName) && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                      <span>⚠️</span>
                      <span>আপনার অর্ডারটি এই মুহূর্তে নেওয়া যাচ্ছে না, দয়া করে আমাদের সাপোর্টে যোগাযোগ করুন।</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number / মোবাইল নম্বর: <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="01XXXXXXXXX"
                    maxLength={16}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                      formData.phone && formData.phone.length >= 2 && !formData.phone.startsWith('01')
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/20'
                        : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  {formData.phone && formData.phone.length >= 2 && !formData.phone.startsWith('01') && (
                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
                      <span>⚠️</span>
                      <span>নম্বরটি অবশ্যই 01 দিয়ে শুরু হতে হবে</span>
                    </p>
                  )}
                  {formData.phone && formData.phone.startsWith('01') && formData.phone.length > 0 && formData.phone.length < 11 && (
                    <p className="text-xs text-slate-500 font-medium mt-1.5">
                      {11 - formData.phone.length} ডিজিট বাকি (মোট ১১ ডিজিট হতে হবে)
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Division / বিভাগ (Optional):</label>
                    <select name="divisionId" value={formData.divisionId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                      <option value="">Select Division</option>
                      {divisions.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.divisionId && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">District / জেলা (Optional):</label>
                      <select name="districtId" value={formData.districtId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                        <option value="">Select District</option>
                        {districts.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.districtId && (
                    <div>
                      {formData.districtId === '65' ? (
                        <>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Area / এরিয়া (Optional):</label>
                          <select name="areaId" value={formData.areaId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Select Area</option>
                            {dhakaAreas.map(a => (
                              <option key={a._id} value={a._id}>{a.name}</option>
                            ))}
                          </select>
                        </>
                      ) : (
                        <>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Upazila / উপজেলা (Optional):</label>
                          <select name="upazilaId" value={formData.upazilaId} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                            <option value="">Select Upazila</option>
                            {upazilas.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Address / ডেলিভারি এড্রেস: <span className="text-red-500">*</span></label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Road No, specific details" rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Order Notes / নোট লিখুন: (optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Enter notes here (optional)" rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"></textarea>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => {
                      setPaymentMethod('cod');
                      setOrderError(null);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      <CreditCard className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Cash On Delivery</p>
                      <p className="text-[11px] text-gray-500">Pay cash upon delivery</p>
                    </div>
                  </div>
                </label>

                {piprapayConfig?.isEnabled && piprapayConfig?.showOnCheckout && (
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'piprapay' ? 'border-rose-600 bg-rose-50/40' : 'border-gray-100 hover:border-rose-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'piprapay'}
                      onChange={() => {
                        setPaymentMethod('piprapay');
                        setOrderError(null);
                      }}
                      className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                        <CreditCard className="w-5 h-5 text-rose-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{piprapayConfig.displayName || 'Online Payment'}</p>
                        <p className="text-[11px] text-gray-500">bKash, Nagad, Rocket, Cards</p>
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Payment / Order Error Banner (Desktop) */}
            {orderError && (
              <div className="hidden lg:flex items-start gap-3 p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-900 shadow-sm animate-in fade-in duration-200">
                <div className="p-1.5 bg-rose-100 rounded-xl text-rose-600 shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-rose-900">Payment Error</h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed font-medium">{orderError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderError(null)}
                  className="text-rose-400 hover:text-rose-700 cursor-pointer p-1 rounded-lg hover:bg-rose-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Action Buttons (Desktop) */}
            <div className="hidden lg:flex flex-row gap-4 pt-4 lg:pb-0 lg:mb-0">
              <Link href="/shop" className="flex-1 flex items-center justify-center gap-2 h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl py-2 transition-all disabled:opacity-50 pointer-events-auto text-base" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                <ArrowLeft className="w-4 h-4 shrink-0" /> <span>Back to Shop</span>
              </Link>
              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className={`flex-[2] flex items-center justify-center gap-2 py-2 h-16 text-white font-bold rounded-xl transition-all text-base disabled:opacity-50 cursor-pointer ${
                  paymentMethod === 'piprapay'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> {paymentMethod === 'piprapay' ? 'Connecting to Gateway...' : 'Processing...'}
                  </>
                ) : paymentMethod === 'piprapay' ? (
                  <>Proceed to Pay <CreditCard className="w-5 h-5 ml-1" /></>
                ) : (
                  <>Confirm Order <ArrowRight className="w-4 h-4 ml-1" /></>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 animate-pulse">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 border border-gray-100"></div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="w-16 h-6 bg-gray-200 rounded-md"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-3 bg-gray-200 rounded"></div>
                            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : cart.length === 0 ? (
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
                            <button onClick={() => handleUpdateQty(item.id, -1)} disabled={isSubmitting} className="px-2 h-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"><Minus className="w-3 h-3" /></button>
                            <span className="px-2 font-bold text-gray-800 text-xs">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, 1)} disabled={isSubmitting} className="px-2 h-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"><Plus className="w-3 h-3" /></button>
                          </div>
                          {/* Item Total & Remove */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-900">{item.price * item.quantity} ৳</span>
                            <button onClick={() => handleRemove(item.id)} disabled={isSubmitting} className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
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
                {!user && (
                  <div className="bg-yellow-50 text-yellow-700 text-xs p-3 rounded-lg border border-yellow-200 mb-3 flex items-start gap-2">
                    <span className="font-bold">⚠️</span>
                    <span>Coupon feature is available for registered users only</span>
                  </div>
                )}

                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-green-700 uppercase">{appliedCoupon}</p>
                      <p className="text-[10px] text-green-600 font-medium">Coupon applied successfully</p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      disabled={isSubmitting}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="ENTER COUPON"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!user || isSubmitting}
                      className="flex-1 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all uppercase disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!user || isApplyingCoupon || isSubmitting || !couponCode.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-100 text-blue-600 font-bold rounded-xl hover:bg-blue-200 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
                    >
                      {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                )}
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
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{couponDiscount} ৳</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-gray-900 pt-3 border-t border-gray-100">
                  <span>TOTAL COST:</span>
                  <span className="text-blue-600">{total} ৳</span>
                </div>
              </div>

              {/* Payment / Order Error Banner (Mobile) */}
              {orderError && (
                <div className="flex lg:hidden items-start gap-2.5 p-3 mt-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 shadow-sm animate-in fade-in duration-200">
                  <div className="p-1 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-bold text-rose-900">Payment Error</h4>
                    <p className="text-rose-700 mt-0.5 leading-relaxed font-medium">{orderError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOrderError(null)}
                    className="text-rose-400 hover:text-rose-700 cursor-pointer p-0.5 rounded hover:bg-rose-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Action Buttons (Mobile) */}
              <div className="flex lg:hidden flex-row gap-2 pt-8 pb-20">
                <Link href="/shop" className="flex-1 flex items-center justify-center gap-1 h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50 pointer-events-auto text-xs" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                  <ArrowLeft className="w-3 h-3 shrink-0" /> <span className="truncate">Back to Shop</span>
                </Link>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-1 h-14 text-white font-bold rounded-xl transition-all text-xs disabled:opacity-50 cursor-pointer ${
                    paymentMethod === 'piprapay'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {paymentMethod === 'piprapay' ? 'Wait...' : 'Wait...'}
                    </>
                  ) : paymentMethod === 'piprapay' ? (
                    <>Proceed to Pay <CreditCard className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Confirm Order <ArrowRight className="w-3 h-3 ml-1" /></>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Stock Out Error Modal */}
      {stockOutError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Item Out of Stock</h3>
            <p className="text-gray-600 text-center mb-6">{stockOutError}<br/><br/>Please remove this item from your cart to continue with your checkout.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStockOutError(null)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Close & Check Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
