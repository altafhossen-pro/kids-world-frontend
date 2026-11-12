'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { settingsAPI } from '@/services/api';
import { steadfastAPI } from '@/services/steadfastApi';
import { 
  ArrowLeft,
  Truck,
  Save,
  Key,
  Lock,
  Wallet,
  CheckCircle,
  XCircle,
  RefreshCw,
  Bell,
  Copy,
  ShieldAlert,
  FileText,
  Trash2,
  Download,
  Search,
  RotateCcw,
  AlertTriangle,
  Terminal,
  Clock,
  HardDrive
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

export default function SteadfastSettingsPage() {
  const router = useRouter();
  const { hasPermission, contextLoading } = useAppContext();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'logs'

  // Settings State
  const [settings, setSettings] = useState({
    apiKey: '',
    apiSecret: '',
    webhookToken: '',
    notifyTelegramOnError: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [hasReadPermission, setHasReadPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);

  // Connection & Balance states
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'connected' | 'error' | null
  const [balance, setBalance] = useState(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [balanceUpdatedAt, setBalanceUpdatedAt] = useState(null);

  // Logs State
  const [logContent, setLogContent] = useState('');
  const [originalLogContent, setOriginalLogContent] = useState('');
  const [logStats, setLogStats] = useState({ size: 0, lines: 0, lastModified: null });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingLogs, setSavingLogs] = useState(false);
  const [clearingLogs, setClearingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (contextLoading) return;
    const canRead = hasPermission('settings', 'read');
    const canUpdate = hasPermission('settings', 'update');
    setHasReadPermission(canRead);
    setHasUpdatePermission(!!canUpdate);
    setCheckingPermission(false);
    if (canRead) {
      fetchSettings();
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [contextLoading]);

  const fetchSettings = async () => {
    try {
      const token = getCookie('token');
      const response = await settingsAPI.getSteadfastSettings(token);
      if (response.success) {
        setSettings({
          apiKey: response.data?.apiKey || '',
          apiSecret: response.data?.apiSecret || '',
          webhookToken: response.data?.webhookToken || '',
          notifyTelegramOnError: response.data?.notifyTelegramOnError !== false
        });

        // If credentials exist, quietly fetch balance
        if (response.data?.apiKey && response.data?.apiSecret) {
          fetchLiveBalance(token);
        }
      } else {
        toast.error(response.message || 'Failed to load Steadfast settings');
      }
    } catch (error) {
      toast.error('Failed to load Steadfast settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveBalance = async (token) => {
    setFetchingBalance(true);
    try {
      const authToken = token || getCookie('token');
      const res = await steadfastAPI.getBalance(authToken);
      if (res.success && res.data?.status === 200) {
        setBalance(res.data.current_balance ?? 0);
        setBalanceUpdatedAt(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (err) {
      console.warn('Balance check failed:', err.message);
      setConnectionStatus('error');
    } finally {
      setFetchingBalance(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.apiKey || !settings.apiSecret) {
      toast.error('Please enter API Key and Secret Key first');
      return;
    }

    setTestingConnection(true);
    try {
      const token = getCookie('token');
      const res = await steadfastAPI.checkConnection(token);
      if (res.success) {
        setConnectionStatus('connected');
        if (res.data?.balance?.current_balance !== undefined) {
          setBalance(res.data.balance.current_balance);
          setBalanceUpdatedAt(new Date());
        }
        toast.success('Steadfast API connected successfully!');
      } else {
        setConnectionStatus('error');
        toast.error(res.message || 'Steadfast connection failed. Check credentials.');
      }
    } catch (err) {
      setConnectionStatus('error');
      toast.error(err?.response?.data?.message || 'Connection test failed');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleChange = (field, value) => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to update settings");
      return;
    }
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to update settings");
      return;
    }

    if (!settings.apiKey || !settings.apiSecret) {
      toast.error('Please provide both API Key and API Secret');
      return;
    }

    setSaving(true);
    try {
      const token = getCookie('token');
      const response = await settingsAPI.updateSteadfastSettings(settings, token);
      
      if (response.success) {
        toast.success('Steadfast settings saved successfully');
        setSettings(prev => ({
          ...prev,
          ...response.data
        }));
        fetchLiveBalance(token);
      } else {
        toast.error(response.message || 'Failed to update settings');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ERROR LOGS HANDLERS
  // ==========================================
  const fetchLogs = async (silent = false) => {
    if (!silent) setLoadingLogs(true);
    try {
      const token = getCookie('token');
      const res = await steadfastAPI.getLogs(token);
      if (res.success && res.data) {
        const text = res.data.content || '';
        setLogContent(text);
        setOriginalLogContent(text);
        setLogStats({
          size: res.data.size || 0,
          lines: res.data.lines || 0,
          lastModified: res.data.lastModified ? new Date(res.data.lastModified) : null
        });
        if (silent) toast.success('Error logs refreshed');
      } else {
        if (!silent) toast.error(res.message || 'Failed to fetch error logs');
      }
    } catch (err) {
      if (!silent) toast.error('Error reading logs from server');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSaveLogs = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to edit logs");
      return;
    }

    setSavingLogs(true);
    try {
      const token = getCookie('token');
      const res = await steadfastAPI.updateLogs(logContent, token);
      if (res.success) {
        toast.success('Steadfast error log file updated successfully');
        setOriginalLogContent(logContent);
        if (res.data) {
          setLogStats(prev => ({
            ...prev,
            size: res.data.size,
            lines: res.data.lines,
            lastModified: res.data.lastModified ? new Date(res.data.lastModified) : new Date()
          }));
        }
      } else {
        toast.error(res.message || 'Failed to save log changes');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save log changes');
    } finally {
      setSavingLogs(false);
    }
  };

  const handleClearLogs = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to clear logs");
      return;
    }

    setClearingLogs(true);
    try {
      const token = getCookie('token');
      const res = await steadfastAPI.clearLogs(token);
      if (res.success) {
        toast.success('Steadfast error log file cleared');
        setLogContent('');
        setOriginalLogContent('');
        setLogStats({ size: 0, lines: 0, lastModified: new Date() });
        setShowClearConfirm(false);
      } else {
        toast.error(res.message || 'Failed to clear logs');
      }
    } catch (err) {
      toast.error('Failed to clear error logs');
    } finally {
      setClearingLogs(false);
    }
  };

  const handleDownloadLogs = () => {
    if (!logContent) {
      toast('Log file is empty', { icon: 'ℹ️' });
      return;
    }
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `steadfast_error_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Log file downloaded');
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLogDirty = logContent !== originalLogContent;

  if (checkingPermission || contextLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!hasReadPermission || permissionError) {
    return (
      <PermissionDenied
        title="Access Denied"
        message={permissionError || "You don't have permission to access Steadfast settings"}
        action="Contact your administrator for access"
        showBackButton={true}
      />
    );
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/steadfast/webhook`;

  // Filtered log display
  const displayLog = logFilter.trim() 
    ? logContent.split('\n').filter(line => line.toLowerCase().includes(logFilter.toLowerCase())).join('\n')
    : logContent;

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-full space-y-6">
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
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600 shadow-sm">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Steadfast Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">API configuration, live merchant balance, and production error logs</p>
            </div>
          </div>

          {activeTab === 'config' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testingConnection || !settings.apiKey || !settings.apiSecret}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : connectionStatus === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-orange-600" />
                    <span>Testing Connection...</span>
                  </>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Connected (Active)</span>
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <XCircle className="h-4 w-4 text-rose-600" />
                    <span>Connection Error</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 text-slate-500" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'config'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="h-4 w-4" />
          <span>Steadfast Configuration</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('logs');
            fetchLogs();
          }}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Error Logs</span>
          {logStats.lines > 0 && (
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeTab === 'logs' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {logStats.lines}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: STEADFAST CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="space-y-6 animate-fade-in">
          {/* Live Balance Banner Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                  <Wallet className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Steadfast Live Merchant Balance</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold tracking-tight">
                      {balance !== null ? `৳ ${Number(balance).toLocaleString('en-BD')}` : '৳ 0'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Ready for Payout</span>
                  </div>
                  {balanceUpdatedAt && (
                    <p className="text-slate-400 text-xs mt-1">
                      Updated: {balanceUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => fetchLiveBalance()}
                disabled={fetchingBalance || !settings.apiKey || !settings.apiSecret}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer border border-white/10"
              >
                <RefreshCw className={`h-4 w-4 ${fetchingBalance ? 'animate-spin' : ''}`} />
                <span>{fetchingBalance ? 'Checking...' : 'Refresh Balance'}</span>
              </button>
            </div>
            <p className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
              💡 Balance represents confirmed delivered COD revenue, minus Steadfast delivery charges and 1% COD fee.
            </p>
          </div>

          {/* API Credentials Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">API Credentials</h2>
              <p className="text-slate-500 text-sm">Obtained from your Steadfast Merchant Portal (Settings &gt; API Credentials)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Key className="h-4 w-4 text-orange-600" />
                    API Key <span className="text-rose-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={settings.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  disabled={!hasUpdatePermission || saving}
                  placeholder="e.g. inp63fzhp0akstp9npmq1io3d2kgvcar"
                  className={`w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                    !hasUpdatePermission ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/50'
                  }`}
                />
                <p className="mt-1.5 text-xs text-slate-400">Steadfast public API identifier</p>
              </div>

              {/* API Secret */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-4 w-4 text-orange-600" />
                    API Secret <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showApiSecret ? 'text' : 'password'}
                    value={settings.apiSecret}
                    onChange={(e) => handleChange('apiSecret', e.target.value)}
                    disabled={!hasUpdatePermission || saving}
                    placeholder="Enter secret key"
                    className={`w-full px-4 py-2.5 pr-12 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all ${
                      !hasUpdatePermission ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showApiSecret ? (
                      <span className="text-xs font-semibold">Hide</span>
                    ) : (
                      <span className="text-xs font-semibold">Show</span>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Keep this secret safe and never share it publicly</p>
              </div>
            </div>
          </div>

          {/* Webhook Configuration Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Webhook & Callback Configuration</h2>
              <p className="text-slate-500 text-sm">
                Configure these in Steadfast portal to receive automated delivery, return, and payment callback status
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Callback / Webhook URL</label>
                <div className="flex rounded-xl shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-l-xl bg-slate-50 text-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(callbackUrl, 'Callback URL')}
                    className="px-4 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl text-slate-700 hover:bg-slate-200 text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Webhook Bearer Token</label>
                <div className="flex rounded-xl shadow-sm">
                  <input
                    type="text"
                    readOnly
                    value={settings.webhookToken || 'Generating token...'}
                    className="w-full px-4 py-2.5 text-sm font-mono border border-slate-300 rounded-l-xl bg-slate-50 text-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.webhookToken, 'Bearer Token')}
                    className="px-4 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl text-slate-700 hover:bg-slate-200 text-sm font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Controls & Error Alert Toggles */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">Automation & Error Alert Controls</h2>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">Manage notifications and safe error handling behavior</p>
            </div>

            <div className="space-y-4">
              {/* Telegram Error Alert Toggle */}
              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-slate-900 text-sm">Send Telegram Alert on Steadfast Errors</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    When an API booking fails, webhook verification fails, or connection drops, instantly dispatch an alert to the admin Telegram bot without crashing the system.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={settings.notifyTelegramOnError}
                    onChange={(e) => handleChange('notifyTelegramOnError', e.target.checked)}
                    disabled={!hasUpdatePermission || saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>

              {/* Logging File Info */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1 flex items-center justify-between">
                <div>
                  <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                    <Save className="h-3.5 w-3.5" />
                    Isolated Safe Error Logging
                  </p>
                  <p className="mt-0.5">
                    Successful requests are not logged to disk. All errors are isolated safely in <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">logs/steadfast_error.log</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs transition-colors cursor-pointer flex-shrink-0 ml-4"
                >
                  View Error Logs &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {hasUpdatePermission && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !settings.apiKey || !settings.apiSecret}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving Configuration...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Steadfast Settings</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ERROR LOGS VIEWER & EDITOR */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          {/* Logs Top Bar & Stats Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                  <Terminal className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Steadfast Production Error Log</h2>
                    {isLogDirty ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                        ● Unsaved Changes
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                        Synced
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ecommerce-backend/logs/steadfast_error.log
                  </p>
                </div>
              </div>

              {/* Status Metadata Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                  <span>Size: <strong>{formatFileSize(logStats.size)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Total Lines: <strong>{logStats.lines}</strong></span>
                </div>
                {logStats.lastModified && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Modified: <strong>{logStats.lastModified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search / Filter input */}
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  placeholder="Filter error lines by keyword or invoice..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
                {logFilter && (
                  <button
                    onClick={() => setLogFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchLogs(true)}
                  disabled={loadingLogs}
                  title="Refresh logs from server"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLogs}
                  disabled={!logContent}
                  title="Download log file"
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                {isLogDirty && (
                  <button
                    type="button"
                    onClick={() => setLogContent(originalLogContent)}
                    title="Discard unsaved edits"
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Discard</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={!logContent || clearingLogs}
                  title="Empty log file"
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear File</span>
                </button>

                {hasUpdatePermission && (
                  <button
                    type="button"
                    onClick={handleSaveLogs}
                    disabled={savingLogs || !isLogDirty}
                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {savingLogs ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Log Editor Container */}
          <div className="bg-slate-950 rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-mono text-[11px] text-slate-400">
                  {logFilter ? `Filtered View (${displayLog ? displayLog.split('\n').filter(Boolean).length : 0} matching lines)` : 'Direct File Editor (Editable)'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                UTF-8 • Log format: [TIMESTAMP] [LEVEL] [ACTION] MESSAGE
              </span>
            </div>

            {loadingLogs ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                <span className="text-xs font-mono">Reading log file from backend...</span>
              </div>
            ) : logContent ? (
              <div className="relative">
                <textarea
                  value={displayLog}
                  onChange={(e) => {
                    if (logFilter) {
                      toast.error('Clear filter search before editing full file content');
                      return;
                    }
                    setLogContent(e.target.value);
                  }}
                  readOnly={!hasUpdatePermission || Boolean(logFilter)}
                  rows={20}
                  spellCheck={false}
                  placeholder="Steadfast error log content..."
                  className={`w-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border-none focus:outline-none focus:ring-0 resize-y min-h-[460px] ${
                    logFilter ? 'bg-slate-900/40 text-emerald-400' : ''
                  }`}
                />
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <CheckCircle className="h-10 w-10 text-emerald-500/60" />
                <p className="text-sm font-semibold text-slate-300">Clean Sheet - No Errors Logged!</p>
                <p className="text-xs text-slate-500 max-w-sm text-center">
                  All Steadfast API bookings and webhook callbacks have been operating with zero logged errors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clear Logs Confirmation Modal */}
      {showClearConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowClearConfirm(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Clear Error Log File?</h3>
                <p className="text-xs text-slate-500">This action will empty steadfast_error.log</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete all logged error records? This action cannot be undone. You may download a copy before clearing.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearingLogs}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {clearingLogs ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm & Clear</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
