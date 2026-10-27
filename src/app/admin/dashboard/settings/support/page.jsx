'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, 
  Phone, 
  MessageCircle, 
  Save, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  X,
  ExternalLink,
  ShieldCheck,
  Send
} from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import Link from 'next/link';

// Official WhatsApp Icon SVG
const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Messenger Icon SVG
const MessengerIcon = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.085.3 2.241.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.888-3.259-6.559 6.963z"/>
  </svg>
);

export default function SupportSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);

  const [formData, setFormData] = useState({
    isEnabled: true,
    call: {
      isEnabled: true,
      phoneNumber: '+8801519181818',
      label: 'Call Us'
    },
    whatsapp: {
      isEnabled: true,
      phoneNumber: '+8801519181818',
      message: 'Hello! I need help with my order.'
    },
    messenger: {
      isEnabled: true,
      url: 'https://m.me/kidsworldbd'
    }
  });

  useEffect(() => {
    fetchSupportSettings();
  }, []);

  const fetchSupportSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsAPI.getSupportSettings();
      if (res.success && res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error('Failed to load support settings:', error);
      toast.error('Failed to load support settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const token = getCookie('token');
      const res = await settingsAPI.updateSupportSettings(formData, token);
      if (res.success) {
        toast.success('Support settings updated successfully!');
      } else {
        toast.error(res.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating support settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Headphones className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Floating Support Widget
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage the bottom-right floating button on your website (Call, WhatsApp & Messenger)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>View Website</span>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Master Enable Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-lg">Master Widget Status</span>
                {formData.isEnabled ? (
                  <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full">
                    Disabled
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, the floating support button will appear in the bottom-right corner of all storefront pages.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.isEnabled}
                onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* 1. Direct Phone Call */}
          <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 transition-opacity ${!formData.isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Direct Phone Call</h3>
                  <p className="text-xs text-gray-500">Tap to call on mobile or desktop dialer</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.call?.isEnabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    call: { ...formData.call, isEnabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.call?.phoneNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    call: { ...formData.call, phoneNumber: e.target.value }
                  })}
                  placeholder="+8801519181818"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Button Label
                </label>
                <input
                  type="text"
                  value={formData.call?.label || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    call: { ...formData.call, label: e.target.value }
                  })}
                  placeholder="Call Us Now"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* 2. WhatsApp Chat */}
          <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 transition-opacity ${!formData.isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                  <WhatsAppIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">WhatsApp Chat</h3>
                  <p className="text-xs text-gray-500">Opens WhatsApp app or web directly</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.whatsapp?.isEnabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, isEnabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  WhatsApp Number (with or without country code)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp?.phoneNumber || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, phoneNumber: e.target.value }
                  })}
                  placeholder="01519181818 or +8801519181818"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Default Pre-filled Message (Optional)
                </label>
                <input
                  type="text"
                  value={formData.whatsapp?.message || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, message: e.target.value }
                  })}
                  placeholder="Hello! I need help with my order."
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* 3. Facebook Messenger Chat */}
          <div className={`bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5 transition-opacity ${!formData.isEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0084FF] text-white flex items-center justify-center shadow-sm">
                  <MessengerIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Facebook Messenger</h3>
                  <p className="text-xs text-gray-500">Opens Facebook Messenger chat with your page</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.messenger?.isEnabled}
                  onChange={(e) => setFormData({
                    ...formData,
                    messenger: { ...formData.messenger, isEnabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0084FF]"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Messenger URL or Page Username
              </label>
              <input
                type="text"
                value={formData.messenger?.url || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  messenger: { ...formData.messenger, url: e.target.value }
                })}
                placeholder="https://m.me/kidsworldbd or kidsworldbd"
                className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0084FF] focus:bg-white transition"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Tip: Enter your full link like <code className="text-gray-600">https://m.me/yourpage</code> or just your Facebook page username.
              </p>
            </div>
          </div>

        </div>

        {/* Right Col: Live Interactive Widget Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-gray-900 text-sm">Interactive Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(!previewOpen)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                {previewOpen ? 'Click to Close' : 'Click to Open'}
              </button>
            </div>

            <div className="relative h-72 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 overflow-hidden flex flex-col justify-end p-6 items-end">
              
              {!formData.isEnabled ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-gray-100/90 backdrop-blur-sm">
                  <Eye className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs font-bold text-gray-600">Widget is Disabled</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Toggle Master Status to enable preview</p>
                </div>
              ) : (
                <div className="flex flex-col items-end gap-3 z-10">
                  {/* Expanded Items */}
                  {previewOpen && (
                    <div className="flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
                      
                      {/* Messenger */}
                      {formData.messenger?.isEnabled && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-md shadow-sm">
                            Messenger
                          </span>
                          <div className="w-12 h-12 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-lg hover:scale-105 transition">
                            <MessengerIcon className="w-6 h-6" />
                          </div>
                        </div>
                      )}

                      {/* WhatsApp */}
                      {formData.whatsapp?.isEnabled && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-md shadow-sm">
                            WhatsApp
                          </span>
                          <div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 transition">
                            <WhatsAppIcon className="w-6 h-6" />
                          </div>
                        </div>
                      )}

                      {/* Call */}
                      {formData.call?.isEnabled && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-gray-900 text-white px-2 py-0.5 rounded-md shadow-sm">
                            Call
                          </span>
                          <div className="w-12 h-12 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shadow-lg hover:scale-105 transition">
                            <Phone className="w-5 h-5" />
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* Main Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="w-14 h-14 rounded-full bg-[#1e232a] text-white flex items-center justify-center shadow-xl hover:scale-105 transition border border-gray-700 cursor-pointer"
                  >
                    {previewOpen ? (
                      <X className="w-6 h-6 text-white" />
                    ) : (
                      <Headphones className="w-7 h-7 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
              <p className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Integrated with Meta Pixel Contact Tracking
              </p>
              <p>Mobile friendly with smooth expansion animation.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
