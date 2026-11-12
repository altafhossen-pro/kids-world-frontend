'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getCookie } from 'cookies-next';
import { steadfastAPI } from '@/services/steadfastApi';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Phone,
  HelpCircle,
  Truck,
  Clock,
  Calculator,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CustomerSteadfastStats({ phone, customerName }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null); // { cached: boolean, cachedAt: Date, expiresInHours: number }
  const [error, setError] = useState(null);

  // Math Captcha Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mathProblem, setMathProblem] = useState({ num1: 254, num2: 387, answer: 641 });
  const [userAnswer, setUserAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (phone) {
      fetchCustomerStats(false);
    }
  }, [phone]);

  const generateMathCaptcha = () => {
    // Generate 3-digit random numbers for a non-trivial math addition
    const num1 = Math.floor(Math.random() * 700) + 145; // e.g., 145 to 844
    const num2 = Math.floor(Math.random() * 700) + 112; // e.g., 112 to 811
    return { num1, num2, answer: num1 + num2 };
  };

  const handleOpenRefreshModal = () => {
    const newProblem = generateMathCaptcha();
    setMathProblem(newProblem);
    setUserAnswer('');
    setCaptchaError('');
    setShowConfirmModal(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSecretAutofill = () => {
    setUserAnswer(String(mathProblem.answer));
    setCaptchaError('');
  };

  const handleConfirmRefresh = () => {
    const parsed = parseInt(userAnswer.trim(), 10);
    if (isNaN(parsed) || parsed !== mathProblem.answer) {
      setCaptchaError('Incorrect sum. Please calculate again or try a new one.');
      return;
    }

    // Solved correctly!
    setShowConfirmModal(false);
    fetchCustomerStats(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmRefresh();
    } else if (e.key === 'Escape') {
      setShowConfirmModal(false);
    }
  };

  const fetchCustomerStats = async (forceRefresh = false) => {
    if (!phone) return;
    setLoading(true);
    setError(null);

    try {
      const token = getCookie('token');
      const res = await steadfastAPI.getFraudScore(phone, token, forceRefresh);

      if (res.success && res.data) {
        setStats(res.data);
        setCacheInfo({
          cached: res.cached,
          cachedAt: res.cachedAt ? new Date(res.cachedAt) : new Date(),
          expiresInHours: res.expiresInHours,
          isFallback: res.isFallback
        });

        if (forceRefresh) {
          toast.success('Customer stats refreshed live from Steadfast!');
        }
      } else {
        setError(res.message || 'Courier stats not available');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load courier stats');
    } finally {
      setLoading(false);
    }
  };

  if (!phone) return null;

  // Calculate Trust Status
  const getTrustBadge = () => {
    if (!stats) return null;

    const deliveryRatio = stats.delivery_ratio;
    const cancelRatio = stats.cancellation_ratio;
    const reports = stats.total_reports || 0;

    if (reports > 0 || (cancelRatio !== null && cancelRatio >= 30)) {
      return {
        label: 'High Return Risk',
        color: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: ShieldAlert,
        description: 'Customer has high cancellation rate or reports from other merchants. Recommended to verify before dispatch or request advanced delivery charge.'
      };
    }

    if (cancelRatio !== null && cancelRatio >= 15) {
      return {
        label: 'Moderate Risk',
        color: 'bg-amber-100 text-amber-800 border-amber-300',
        icon: AlertTriangle,
        description: 'Moderate parcel cancellation history across courier network.'
      };
    }

    if (deliveryRatio !== null && deliveryRatio >= 75) {
      return {
        label: 'Trusted Customer',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        icon: ShieldCheck,
        description: 'Strong delivery record with minimal returns.'
      };
    }

    return {
      label: 'New Customer',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: HelpCircle,
      description: 'No prior completed courier history recorded with this phone number.'
    };
  };

  const trust = getTrustBadge();
  const TrustIcon = trust?.icon;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Courier History & Fraud Check</h3>
                {cacheInfo && (
                  <span 
                    title={cacheInfo.cached ? 'Saved in MongoDB 24h TTL cache' : 'Live from Steadfast'}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                      cacheInfo.cached 
                        ? 'bg-slate-100 text-slate-600 border border-slate-200' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {cacheInfo.cached ? 'Cached (24h)' : 'Live'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" />
                <span>{phone}</span>
                {cacheInfo?.cachedAt && (
                  <span className="text-[10px] text-slate-400">
                    • {cacheInfo.cachedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenRefreshModal}
            disabled={loading}
            title="Refresh customer courier score"
            className="p-1.5 rounded-lg text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1 text-xs font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
            <span className="text-xs font-medium">Checking courier database...</span>
          </div>
        ) : error ? (
          <div className="py-3 px-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={handleOpenRefreshModal} 
              className="text-orange-600 font-semibold hover:underline cursor-pointer ml-2"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="space-y-3.5">
            {/* Trust Status Badge */}
            {trust && (
              <div className={`p-3 rounded-xl border text-xs ${trust.color}`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {TrustIcon && <TrustIcon className="h-4 w-4" />}
                  <span>{trust.label}</span>
                  {stats.volume_range && (
                    <span className="ml-auto text-[11px] font-normal opacity-90">
                      Volume: {stats.volume_range} parcels
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">{trust.description}</p>
              </div>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Delivery Ratio */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Delivered
                  </span>
                  <span className="font-bold text-slate-800">
                    {stats.delivery_ratio !== null ? `${stats.delivery_ratio}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.delivery_ratio || 0}%` }}
                  />
                </div>
                {stats.delivered_count !== null && (
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">{stats.delivered_count} parcels completed</p>
                )}
              </div>

              {/* Cancel Ratio */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-rose-600" />
                    Cancelled
                  </span>
                  <span className="font-bold text-slate-800">
                    {stats.cancellation_ratio !== null ? `${stats.cancellation_ratio}%` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stats.cancellation_ratio || 0}%` }}
                  />
                </div>
                {stats.cancelled_count !== null && (
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">{stats.cancelled_count} parcels returned</p>
                )}
              </div>
            </div>

            {/* Reports Banner */}
            {stats.total_reports > 0 ? (
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-xs text-rose-800">
                <div className="font-semibold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{stats.total_reports} Negative Report(s) by Merchants</span>
                </div>
                {stats.fraud_categories && typeof stats.fraud_categories === 'object' && Object.keys(stats.fraud_categories).length > 0 && (
                  <p className="text-[11px] text-rose-600 mt-0.5">
                    Reasons: {Object.entries(stats.fraud_categories).map(([key, val]) => `${key} (${val})`).join(', ')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 text-center font-medium">
                ✓ No merchant complaints recorded
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={handleOpenRefreshModal}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Check Customer Courier Record
          </button>
        )}
      </div>

      {/* Confirmation & Complex Math Captcha Modal */}
      {showConfirmModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowConfirmModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Live Stats Refresh</h3>
                  <p className="text-xs text-slate-500">Rate Limit Protection Verification</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning Message with Secret Word for Autofill */}
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <p>
                Steadfast API has strict daily rate{' '}
                <span 
                  onClick={handleSecretAutofill}
                  className="cursor-default select-none"
                >
                  limits
                </span>{' '}
                per merchant. Avoid frequent live requests to prevent account API lockouts. Are you sure you want to bypass the 24-hour cache?
              </p>
            </div>

            {/* Math Addition Challenge */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Solve this math addition to proceed:
              </label>

              <div className="flex items-center justify-center py-3.5 px-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-800 tracking-wider">
                  {mathProblem.num1} + {mathProblem.num2} = ?
                </span>
              </div>

              <div>
                <input
                  ref={inputRef}
                  type="number"
                  value={userAnswer}
                  onChange={(e) => {
                    setUserAnswer(e.target.value);
                    if (captchaError) setCaptchaError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter calculation result"
                  className={`w-full px-4 py-2.5 text-center font-mono text-base border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                    captchaError ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300 bg-white'
                  }`}
                />
                {captchaError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{captchaError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRefresh}
                disabled={!userAnswer.trim()}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Verify & Refresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
