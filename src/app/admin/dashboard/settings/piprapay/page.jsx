'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { settingsAPI } from '@/services/api';
import {
  ArrowLeft,
  CreditCard,
  Save,
  Key,
  Globe,
  ShieldCheck,
  RefreshCw,
  Info,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

export default function PiprapaySettingsPage() {
  const router = useRouter();
  const { hasPermission, contextLoading, token: contextToken } = useAppContext();

  // Settings state
  const [settings, setSettings] = useState({
    isEnabled: false,
    showOnCheckout: false,
    displayName: 'Online Payment (bKash / Nagad / Rocket / Cards)',
    baseUrl: 'https://piprapay.com/api',
    apiKey: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [hasReadPermission, setHasReadPermission] = useState(false);
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (contextLoading) return;
    const canRead = hasPermission('settings', 'read');
    const canUpdate = hasPermission('settings', 'update');
    setHasReadPermission(canRead);
    setHasUpdatePermission(!!canUpdate);
    setCheckingPermission(false);
    if (canRead) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [contextLoading]);

  const fetchSettings = async () => {
    try {
      const token = getCookie('token') || contextToken;
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await settingsAPI.getPiprapaySettings(token);
      if (response.success && response.data) {
        setSettings({
          isEnabled: Boolean(response.data.isEnabled),
          showOnCheckout: Boolean(response.data.showOnCheckout),
          displayName: response.data.displayName || 'Online Payment (bKash / Nagad / Rocket / Cards)',
          baseUrl: response.data.baseUrl || 'https://piprapay.com/api',
          apiKey: response.data.apiKey || '',
        });
      } else {
        toast.error(response.message || 'Failed to load PipraPay settings');
      }
    } catch (error) {
      console.error('Failed to load PipraPay settings:', error);
      toast.error('Failed to load PipraPay settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to update settings");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to update settings");
      return;
    }

    if (settings.isEnabled && !settings.apiKey.trim()) {
      toast.error('API Key is required to enable PipraPay Gateway');
      return;
    }

    setSaving(true);
    try {
      const token = getCookie('token') || contextToken;
      if (!token) {
        toast.error('Session expired. Please log in again to save settings.');
        setSaving(false);
        return;
      }
      const response = await settingsAPI.updatePiprapaySettings(settings, token);

      if (response.success) {
        toast.success('PipraPay settings saved successfully!');
        if (response.data) {
          setSettings((prev) => ({
            ...prev,
            ...response.data,
          }));
        }
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (checkingPermission || contextLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      </div>
    );
  }

  if (!hasReadPermission) {
    return (
      <PermissionDenied
        title="Access Denied"
        message="You don't have permission to access PipraPay settings"
        action="Contact your administrator for access"
        showBackButton={true}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 cursor-pointer text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Settings</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shadow-sm">
              <CreditCard className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">PipraPay Payment Gateway</h1>
                {settings.isEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                Accept online payments via bKash, Nagad, Rocket, Upay, Visa, and Mastercard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard/settings/piprapay/logs')}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-sm"
            >
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              <span>Error Logs</span>
            </button>

            {hasUpdatePermission && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Controls & API Config (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gateway Status & Checkout Visibility Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Gateway Controls</h2>
              <p className="text-slate-500 text-xs">Manage active status and visibility on customer checkout</p>
            </div>

            <div className="space-y-4">
              {/* On/Off Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-rose-600" />
                    <span className="font-semibold text-slate-900 text-sm">PipraPay Gateway Enabled</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle the PipraPay payment processing system ON or OFF for the entire store
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={(e) => handleChange('isEnabled', e.target.checked)}
                    disabled={!hasUpdatePermission || saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>

              {/* Show on Checkout Switch */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-slate-900 text-sm">Show on Checkout Page</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Display PipraPay as a payment method in Step 03 of checkout after Cash on Delivery
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.showOnCheckout}
                    onChange={(e) => handleChange('showOnCheckout', e.target.checked)}
                    disabled={!hasUpdatePermission || saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Checkout Display Name Customization */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Checkout Gateway Name (Dynamic)</h2>
                <p className="text-slate-500 text-xs">Customer will see this title on the checkout page</p>
              </div>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Option Display Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={settings.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                disabled={!hasUpdatePermission || saving}
                placeholder="e.g. Online Payment (bKash / Nagad / Rocket / Cards)"
                className="w-full px-4 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Preview: <strong>{settings.displayName || 'Online Payment'}</strong></span>
                <button
                  type="button"
                  onClick={() => handleChange('displayName', 'Online Payment (bKash / Nagad / Rocket / Cards)')}
                  className="text-rose-600 hover:text-rose-700 font-medium cursor-pointer underline text-[11px]"
                >
                  Reset Default
                </button>
              </div>
            </div>
          </div>

          {/* API Credentials Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">API Credentials & Endpoints</h2>
              <p className="text-slate-500 text-xs">Connect your store with your PipraPay Merchant Account</p>
            </div>

            <div className="space-y-4">
              {/* Base URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-slate-500" />
                    Base API URL <span className="text-rose-500">*</span>
                  </label>
                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChange('baseUrl', 'https://piprapay.com/api')}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        settings.baseUrl === 'https://piprapay.com/api'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Live (piprapay.com)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange('baseUrl', 'https://sandbox.piprapay.com/api')}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        settings.baseUrl === 'https://sandbox.piprapay.com/api'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Sandbox (Test)
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={settings.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  disabled={!hasUpdatePermission || saving}
                  placeholder="https://piprapay.com/api"
                  className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-rose-600" />
                    Merchant API Key <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.apiKey}
                    onChange={(e) => handleChange('apiKey', e.target.value)}
                    disabled={!hasUpdatePermission || saving}
                    placeholder="e.g. MHS-PIPRAPAY-XXXXXXX or Your PipraPay API Key"
                    className="w-full px-4 py-2.5 pr-12 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  PipraPay Merchant Portal &gt; API Settings থেকে পাওয়া যাবে
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Setup Guide & Features */}
        <div className="space-y-6">
          {/* Quick Guide */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700/80 space-y-4">
            <h3 className="font-bold text-sm text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>How to Setup</span>
            </h3>
            <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-white">PipraPay Merchant Dashboard</strong>-এ লগইন করুন।
              </li>
              <li>
                Dashboard-এর <strong className="text-rose-300">Domains</strong> মেনুতে গিয়ে আপনার স্টোরের ডোমেইনটি (যেমন: <code>localhost</code> বা লাইভ ডোমেন) Whitelist করুন।
              </li>
              <li>
                <strong className="text-white">API Settings</strong> থেকে আপনার <strong className="text-rose-300">API Key</strong> কপি করে বামের ইনপুট বক্সে পেস্ট করুন।
              </li>
              <li>
                <strong className="text-white">Gateway Enabled</strong> এবং <strong className="text-white">Show on Checkout</strong> অন রেখে <strong className="text-rose-400">Save Settings</strong>-এ ক্লিক করুন।
              </li>
            </ol>
          </div>

          {/* Supported Methods & Auto-Verification */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Automated Verification</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              কাস্টমার Checkout-এ এই মেথড সিলেক্ট করে <strong>Proceed to Pay</strong> বাটনে ক্লিক করলে স্বয়ংক্রিয়ভাবে PipraPay গেটওয়েতে রিডাইরেক্ট হবে।
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
              <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                পেমেন্ট সম্পন্ন হওয়ার সাথে সাথে সিস্টেমের ব্যাকএন্ড কলব্যাক এপিআই পেমেন্ট ভেরিফাই করে অর্ডারটি <strong>Paid</strong> হিসেবে চিহ্নিত করে কনফার্মেশন স্ক্রিন দেখাবে।
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
