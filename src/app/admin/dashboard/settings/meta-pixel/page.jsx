'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Key,
  Info,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Activity,
  Check,
  Save,
  Loader2,
  Code2,
  FlaskConical
} from 'lucide-react';

import { useAppContext } from '@/context/AppContext';
import { metaPixelAPI } from '@/services/api';

export default function MetaPixelSettingsPage() {
  const router = useRouter();
  const { token } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showToken, setShowToken] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    isEnabled: false,
    pixelCode: '',
    pixelId: '',
    conversionsApiToken: '',
    testEventCode: '',
    trackedEvents: {
      pageView: true,
      viewCategory: true,
      viewContent: true,
      search: true,
      addToCart: true,
      initiateCheckout: true,
      completeRegistration: true,
      contact: true,
      purchase: true
    }
  });

  const [autoDetectedId, setAutoDetectedId] = useState('');

  // Extract Pixel ID from full HTML/JS pixel snippet
  const extractPixelId = (code) => {
    if (!code) return '';
    // Look for fbq('init', '123456789')
    const match = code.match(/fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]\s*\)/);
    if (match && match[1]) {
      return match[1];
    }
    // Alternative match: id=123456789 in noscript img src
    const noscriptMatch = code.match(/id=(\d+)/);
    if (noscriptMatch && noscriptMatch[1]) {
      return noscriptMatch[1];
    }
    return '';
  };

  // Fetch initial settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await metaPixelAPI.getAdminSettings(token);
        if (res && res.success && res.data) {
          const d = res.data;
          setFormData({
            isEnabled: d.isEnabled ?? false,
            pixelCode: d.pixelCode || '',
            pixelId: d.pixelId || '',
            conversionsApiToken: d.conversionsApiToken || '',
            testEventCode: d.testEventCode || '',
            trackedEvents: {
              pageView: d.trackedEvents?.pageView ?? true,
              viewCategory: d.trackedEvents?.viewCategory ?? true,
              viewContent: d.trackedEvents?.viewContent ?? true,
              search: d.trackedEvents?.search ?? true,
              addToCart: d.trackedEvents?.addToCart ?? true,
              initiateCheckout: d.trackedEvents?.initiateCheckout ?? true,
              completeRegistration: d.trackedEvents?.completeRegistration ?? true,
              contact: d.trackedEvents?.contact ?? true,
              purchase: d.trackedEvents?.purchase ?? true
            }
          });

          if (d.pixelCode) {
            const detected = extractPixelId(d.pixelCode);
            if (detected) setAutoDetectedId(detected);
          } else if (d.pixelId) {
            setAutoDetectedId(d.pixelId);
          }
        }
      } catch (err) {
        console.error('Failed to load Meta Pixel settings:', err);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSettings();
    }
  }, [token]);

  // Handle Pixel code change and auto-extract ID
  const handlePixelCodeChange = (e) => {
    const code = e.target.value;
    const detected = extractPixelId(code);

    setFormData(prev => ({
      ...prev,
      pixelCode: code,
      pixelId: detected ? detected : prev.pixelId
    }));

    if (detected) {
      setAutoDetectedId(detected);
    }
  };

  // Handle direct Pixel ID change
  const handlePixelIdChange = (e) => {
    const val = e.target.value.trim();
    setFormData(prev => ({
      ...prev,
      pixelId: val
    }));
    setAutoDetectedId(val);
  };

  // Toggle specific tracked events
  const handleEventToggle = (eventName) => {
    setFormData(prev => ({
      ...prev,
      trackedEvents: {
        ...prev.trackedEvents,
        [eventName]: !prev.trackedEvents[eventName]
      }
    }));
  };

  // Save changes to backend
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (formData.isEnabled && !formData.pixelId) {
      toast.error('Please provide a valid Meta Pixel ID before enabling');
      return;
    }

    try {
      setSaving(true);
      const res = await metaPixelAPI.updateSettings(formData, token);
      if (res && res.success) {
        toast.success(res.message || 'Meta Pixel & CAPI settings saved!');
      } else {
        toast.error(res?.message || 'Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Send Test Event to Meta
  const handleSendTestEvent = async () => {
    if (!formData.pixelId) {
      toast.error('Please enter a Pixel ID first');
      return;
    }
    if (!formData.conversionsApiToken) {
      toast.error('Please enter a Conversions API Access Token');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const res = await metaPixelAPI.sendTestEvent(
        {
          pixelId: formData.pixelId,
          conversionsApiToken: formData.conversionsApiToken,
          testEventCode: formData.testEventCode
        },
        token
      );

      if (res && res.success) {
        setTestResult({
          type: 'success',
          message: 'Test event dispatched to Meta successfully!',
          data: res.data
        });
        toast.success('Test event sent! Check Meta Events Manager Test Events tab.');
      } else {
        setTestResult({
          type: 'error',
          message: res?.message || 'Meta rejected the test event',
          data: res?.data
        });
        toast.error(res?.message || 'Meta test event failed');
      }
    } catch (err) {
      console.error(err);
      setTestResult({
        type: 'error',
        message: 'Network or server error while sending test event',
        data: err
      });
      toast.error('Failed to send test event');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Loading Meta Pixel configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-16">
      {/* ── Top Bar Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin/dashboard/settings"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Settings
          </Link>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Meta Pixel & Conversions API (CAPI)
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 shadow-sm">
            <Info className="w-3.5 h-3.5 text-blue-600" /> Meta Graph v19.0
          </span>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#0064e0] via-[#1877f2] to-[#0052cc] text-white p-6 sm:p-8 rounded-2xl shadow-lg relative overflow-hidden mb-6">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Hybrid Browser + Server-Side Tracking
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Meta Pixel & Conversions API (CAPI)
            </h2>
            <p className="text-sm sm:text-base text-blue-50 font-normal leading-relaxed">
              Send purchases, carts, and user activity directly from your server to Facebook.
              Bypasses iOS 14.5+ ad blockers, boosts Event Match Quality (EMQ) to 8-9/10, and lowers Facebook Ad costs!
            </p>
          </div>

          <a
            href="https://business.facebook.com/events_manager2"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-50 transition-colors shrink-0"
          >
            Open Events Manager <ExternalLink className="w-4 h-4 text-gray-500" />
          </a>
        </div>
      </div>

      {/* ── Master Enable Switch ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
            Enable Meta Pixel & CAPI
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Toggle browser pixel and server-side event tracking across your storefront.
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isEnabled}
            onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* ── Two Columns Main Content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Column: Credentials (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <Key className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-extrabold text-gray-900">Meta Credentials</h3>
            </div>

            {/* Option A: Paste full code */}
            <div className="bg-blue-50/40 rounded-xl border border-blue-100 p-5 mb-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black tracking-wider text-blue-900 uppercase flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600" /> OPTION A: PASTE FULL META PIXEL CODE
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                  <Zap className="w-3 h-3 text-blue-500 fill-blue-500" /> Auto-detects Pixel ID
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Meta Events Manager থেকে পাওয়া সম্পূর্ণ কোডটি এখানে পেস্ট করলে সিস্টেম স্বয়ংক্রিয়ভাবে Pixel ID চিনে নিবে।
              </p>

              <textarea
                rows={4}
                value={formData.pixelCode}
                onChange={handlePixelCodeChange}
                placeholder={`<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\n...`}
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all custom-scrollbar leading-relaxed"
              ></textarea>

              {autoDetectedId && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg w-fit">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Auto-detected Pixel ID: <span className="font-mono">{autoDetectedId}</span></span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative text-center my-6 flex items-center before:content-[''] before:flex-1 before:border-b before:border-gray-200 after:content-[''] after:flex-1 after:border-b after:border-gray-200 gap-4">
              <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                OR ENTER DIRECTLY
              </span>
            </div>

            {/* Option B: Direct Pixel ID */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                OPTION B: META PIXEL ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pixelId}
                onChange={handlePixelIdChange}
                placeholder="e.g. 1119152204181056"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                If you pasted the full code above, this field fills automatically. You can also edit or type it directly.
              </p>
            </div>

            {/* Conversions API Access Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                  CONVERSIONS API ACCESS TOKEN <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  {showToken ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Hide Token
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Show Token
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={3}
                value={formData.conversionsApiToken}
                onChange={(e) => setFormData({ ...formData, conversionsApiToken: e.target.value })}
                placeholder="e.g. EAA..."
                style={{ WebkitTextSecurity: showToken ? 'none' : 'disc' }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all custom-scrollbar"
              ></textarea>
              <p className="text-xs text-gray-400 mt-1.5">
                Events Manager → Settings → Set up Conversions API → Generate access token.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Test Tool & Instructions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Test Events Tool */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-gray-900">Test Events Tool</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Verify server-side connectivity without affecting your live production stats.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Test Event Code (From Events Manager)
              </label>
              <input
                type="text"
                value={formData.testEventCode}
                onChange={(e) => setFormData({ ...formData, testEventCode: e.target.value })}
                placeholder="e.g. TEST12345"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Leave blank when running live production ads.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendTestEvent}
              disabled={testing}
              className="w-full py-3 px-4 bg-[#ff8a00] hover:bg-[#e67c00] text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending to Meta...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Test Event to Meta
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs ${
                  testResult.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {testResult.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.data?.events_received !== undefined && (
                  <p className="mt-1 font-mono text-[11px]">
                    Events received: {testResult.data.events_received} | fbtrace_id: {testResult.data.fbtrace_id}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* How to get credentials Guide */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-3">
              HOW TO GET YOUR CREDENTIALS:
            </h4>
            <ol className="space-y-3 text-xs text-gray-600 leading-relaxed list-decimal list-inside">
              <li>
                Go to <span className="font-bold text-gray-900">Meta Business Suite → Events Manager</span>.
              </li>
              <li>
                Click <span className="font-bold text-gray-900">Connect Data Sources → Web</span> and create your pixel.
              </li>
              <li>
                Copy your <span className="font-bold text-gray-900">Pixel ID</span> and paste above.
              </li>
              <li>
                Under the <span className="font-bold text-gray-900">Settings</span> tab, scroll to <em>Conversions API</em> and click <span className="font-bold text-gray-900">Generate access token</span>.
              </li>
              <li>
                Paste the token here, enable toggle, and click <span className="font-bold text-gray-900">Save Changes!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* ── Events To Track Section ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-extrabold text-gray-900">Events To Track</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* PageView */}
          <div
            onClick={() => handleEventToggle('pageView')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.pageView
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.pageView}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">PageView</h4>
              <p className="text-xs text-gray-500 mt-0.5">Every storefront page visit</p>
            </div>
          </div>

          {/* ViewCategory */}
          <div
            onClick={() => handleEventToggle('viewCategory')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.viewCategory
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.viewCategory}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">ViewCategory</h4>
              <p className="text-xs text-gray-500 mt-0.5">Category page browsing & filtering</p>
            </div>
          </div>

          {/* ViewContent */}
          <div
            onClick={() => handleEventToggle('viewContent')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.viewContent
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.viewContent}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">ViewContent</h4>
              <p className="text-xs text-gray-500 mt-0.5">Single product detail view</p>
            </div>
          </div>

          {/* Search */}
          <div
            onClick={() => handleEventToggle('search')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.search
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.search}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Search</h4>
              <p className="text-xs text-gray-500 mt-0.5">Keyword searches in the search bar</p>
            </div>
          </div>

          {/* AddToCart */}
          <div
            onClick={() => handleEventToggle('addToCart')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.addToCart
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.addToCart}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">AddToCart</h4>
              <p className="text-xs text-gray-500 mt-0.5">Items added to shopping bag</p>
            </div>
          </div>

          {/* InitiateCheckout */}
          <div
            onClick={() => handleEventToggle('initiateCheckout')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.initiateCheckout
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.initiateCheckout}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">InitiateCheckout</h4>
              <p className="text-xs text-gray-500 mt-0.5">Checkout form reached/started</p>
            </div>
          </div>

          {/* CompleteRegistration */}
          <div
            onClick={() => handleEventToggle('completeRegistration')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.completeRegistration
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.completeRegistration}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">CompleteRegistration</h4>
              <p className="text-xs text-gray-500 mt-0.5">User sign-up / account creation</p>
            </div>
          </div>

          {/* Contact */}
          <div
            onClick={() => handleEventToggle('contact')}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              formData.trackedEvents.contact
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-gray-50/60 border-gray-200 opacity-60'
            }`}
          >
            <input
              type="checkbox"
              checked={formData.trackedEvents.contact}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div>
              <h4 className="text-sm font-bold text-gray-900">Contact</h4>
              <p className="text-xs text-gray-500 mt-0.5">Contact form submitted / WhatsApp support</p>
            </div>
          </div>
        </div>

        {/* Purchase (Highest Value Event Highlight) */}
        <div
          onClick={() => handleEventToggle('purchase')}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
            formData.trackedEvents.purchase
              ? 'bg-emerald-50/60 border-emerald-300'
              : 'bg-gray-50/60 border-gray-200 opacity-60'
          }`}
        >
          <input
            type="checkbox"
            checked={formData.trackedEvents.purchase}
            onChange={() => {}}
            className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              Purchase <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full">(Highest Value Event)</span>
            </h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Order successfully completed. Hashes phone, email, and name for 8.5+ EMQ score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
