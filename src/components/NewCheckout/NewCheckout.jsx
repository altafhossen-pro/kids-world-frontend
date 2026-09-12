'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Trash2, Minus, Plus, CreditCard, Loader2 } from 'lucide-react';
import { addressAPI, orderAPI, couponAPI } from '@/services/api';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';

export default function NewCheckout() {
  const router = useRouter();
  const { user, token, cart = [], cartTotal, updateCartItem, removeFromCart, cartLoading, clearCart } = useAppContext();

  const [deliveryType, setDeliveryType] = useState('inside');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockOutError, setStockOutError] = useState(null);

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

  useEffect(() => {
    fetchDivisions();
  }, []);

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
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      return toast.error('Please fill in all required fields (Name, Phone, Delivery Address)');
    }

    setIsSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
        variantSku: item.sku || null,
        variant: item.variantData || null
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          phone: formData.phone,
          address: formData.address,
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

      // Add guest info if user is not logged in
      if (!user) {
        orderData.guestInfo = {
          name: formData.fullName,
          phone: formData.phone
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
        toast.success('Order placed successfully!');
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
        // Check if the error is an out of stock error
        if (response.message && response.message.includes('currently out of stock')) {
          setStockOutError(response.message);
        } else {
          toast.error(response.message || 'Failed to place order');
        }
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      if (error?.response?.data?.message?.includes('currently out of stock')) {
         setStockOutError(error.response.data.message);
      } else {
         toast.error('An error occurred while placing the order. Please try again.');
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
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name here" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number / মোবাইল নম্বর: <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter your mobile number here" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
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

            {/* Action Buttons (Desktop) */}
            <div className="hidden lg:flex flex-row gap-4 pt-4 lg:pb-0 lg:mb-0">
              <Link href="/shop" className="flex-1 flex items-center justify-center gap-2 h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl py-2 transition-all disabled:opacity-50 pointer-events-auto text-base" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                <ArrowLeft className="w-4 h-4 shrink-0" /> <span>Back to Shop</span>
              </Link>
              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="flex-[2] flex items-center justify-center gap-2 py-2 h-16 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:bg-blue-400 disabled:shadow-none text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>Confirm Order <ArrowRight className="w-4 h-4" /></>
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

              {/* Action Buttons (Mobile) */}
              <div className="flex lg:hidden flex-row gap-2 pt-8 pb-20">
                <Link href="/shop" className="flex-1 flex items-center justify-center gap-1 h-14 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-bold rounded-xl transition-all disabled:opacity-50 pointer-events-auto text-xs" style={{ pointerEvents: isSubmitting ? 'none' : 'auto' }}>
                  <ArrowLeft className="w-3 h-3 shrink-0" /> <span className="truncate">Back to Shop</span>
                </Link>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1 h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-200 disabled:bg-blue-400 disabled:shadow-none text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Wait...
                    </>
                  ) : (
                    <>Confirm Order <ArrowRight className="w-3 h-3" /></>
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
