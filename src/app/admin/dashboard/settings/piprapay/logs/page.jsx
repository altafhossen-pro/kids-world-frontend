'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { paymentAPI } from '@/services/api';
import {
  ArrowLeft,
  Terminal,
  RefreshCw,
  Trash2,
  Save,
  Download,
  Search,
  HardDrive,
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

export default function PiprapayLogsPage() {
  const router = useRouter();
  const { hasPermission, contextLoading, token: contextToken } = useAppContext();

  // State
  const [logContent, setLogContent] = useState('');
  const [originalLogContent, setOriginalLogContent] = useState('');
  const [logStats, setLogStats] = useState({ size: 0, lines: 0, lastModified: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [logFilter, setLogFilter] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const [checkingPermission, setCheckingPermission] = useState(true);
  const [hasReadPermission, setHasReadPermission] = useState(false);
  const [hasUpdatePermission, setHasUpdatePermission] = useState(false);

  useEffect(() => {
    if (contextLoading) return;
    const canRead = hasPermission('settings', 'read');
    const canUpdate = hasPermission('settings', 'update');
    setHasReadPermission(canRead);
    setHasUpdatePermission(!!canUpdate);
    setCheckingPermission(false);
    if (canRead) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [contextLoading, hasPermission]);

  const fetchLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = getCookie('token') || contextToken;
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await paymentAPI.getLogs(token);
      if (res.success && res.data) {
        const text = res.data.content || '';
        setLogContent(text);
        setOriginalLogContent(text);
        setLogStats({
          size: res.data.size || 0,
          lines: res.data.lines || 0,
          lastModified: res.data.lastModified ? new Date(res.data.lastModified) : null,
        });
        if (silent) toast.success('Error logs refreshed');
      } else {
        if (!silent) toast.error(res.message || 'Failed to fetch PipraPay error logs');
      }
    } catch (err) {
      console.error('Fetch PipraPay logs error:', err);
      if (!silent) toast.error('Error reading logs from server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogs = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to edit logs");
      return;
    }

    setSaving(true);
    try {
      const token = getCookie('token') || contextToken;
      const res = await paymentAPI.updateLogs(logContent, token);
      if (res.success) {
        toast.success('PipraPay error log file updated successfully');
        setOriginalLogContent(logContent);
        if (res.data) {
          setLogStats((prev) => ({
            ...prev,
            size: res.data.size,
            lines: res.data.lines,
            lastModified: res.data.lastModified ? new Date(res.data.lastModified) : new Date(),
          }));
        }
      } else {
        toast.error(res.message || 'Failed to save log changes');
      }
    } catch (err) {
      console.error('Update logs error:', err);
      toast.error('Failed to save log changes');
    } finally {
      setSaving(false);
    }
  };

  const handleClearLogs = async () => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to clear logs");
      return;
    }

    setClearing(true);
    try {
      const token = getCookie('token') || contextToken;
      const res = await paymentAPI.clearLogs(token);
      if (res.success) {
        toast.success('PipraPay error log file cleared');
        setLogContent('');
        setOriginalLogContent('');
        setLogStats({ size: 0, lines: 0, lastModified: new Date() });
        setShowClearConfirm(false);
      } else {
        toast.error(res.message || 'Failed to clear logs');
      }
    } catch (err) {
      console.error('Clear logs error:', err);
      toast.error('Failed to clear error logs');
    } finally {
      setClearing(false);
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
    link.download = `piprapay_error_${new Date().toISOString().slice(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Log file downloaded');
  };

  const handleCopyLogs = () => {
    if (!logContent) return;
    navigator.clipboard.writeText(logContent);
    setCopied(true);
    toast.success('Log content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLogDirty = logContent !== originalLogContent;

  const getFilteredContent = () => {
    if (!logFilter.trim()) return logContent;
    const filter = logFilter.toLowerCase();
    const lines = logContent.split('\n');
    return lines.filter((line) => line.toLowerCase().includes(filter)).join('\n');
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
        message="You don't have permission to access PipraPay Error Logs"
        action="Contact your administrator for access"
        showBackButton={true}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <button
          onClick={() => router.push('/admin/dashboard/settings/piprapay')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 cursor-pointer text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to PipraPay Settings</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shadow-sm">
              <AlertOctagon className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">PipraPay Error Logs</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {logStats.lines} {logStats.lines === 1 ? 'Error' : 'Errors'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                Safe file logger for PipraPay callbacks, webhooks, and payment charges (<code>logs/piprapay_error.log</code>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => fetchLogs(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleDownloadLogs}
              disabled={!logContent}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-sm disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Download .log</span>
            </button>

            {hasUpdatePermission && (
              <button
                onClick={handleSaveLogs}
                disabled={saving || !isLogDirty}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-md ${
                  isLogDirty
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            )}

            {hasUpdatePermission && logContent && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={clearing}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-all cursor-pointer text-sm shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Log</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Log Editor Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
                <Terminal className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">PipraPay Production Error Log</h2>
                  {isLogDirty ? (
                    <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                      ● Unsaved Changes
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-medium">
                      Synced with Disk
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ecommerce-backend/logs/piprapay_error.log
                </p>
              </div>
            </div>

            {/* Status Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                <span>Size: <strong>{formatFileSize(logStats.size)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Total Lines: <strong>{logStats.lines}</strong></span>
              </div>
              {logStats.lastModified && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Modified: <strong>{logStats.lastModified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Search / Filter Toolbar */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                placeholder="Filter error lines by keyword, Order ID, or PP ID..."
                className="w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
              />
              {logFilter && (
                <button
                  onClick={() => setLogFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLogs}
                disabled={!logContent}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Body */}
        <div className="relative">
          {logFilter ? (
            <div>
              <div className="p-2 bg-slate-900 border-b border-slate-800 text-[11px] text-amber-400 flex items-center justify-between px-4">
                <span>Filter active: Showing matches for "{logFilter}" (Read-only view)</span>
                <button
                  onClick={() => setLogFilter('')}
                  className="text-white hover:underline cursor-pointer"
                >
                  Reset Filter to Edit
                </button>
              </div>
              <textarea
                readOnly
                value={getFilteredContent() || 'No lines matched your filter query.'}
                className="w-full p-4 bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed border-none focus:outline-none resize-y min-h-[460px]"
              />
            </div>
          ) : (
            <textarea
              value={logContent}
              onChange={(e) => setLogContent(e.target.value)}
              disabled={!hasUpdatePermission || saving}
              placeholder="PipraPay error log content..."
              className="w-full p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed border-none focus:outline-none resize-y min-h-[460px] selection:bg-rose-900 selection:text-white"
            />
          )}

          {/* Empty State Overlay */}
          {!logContent && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-center p-6 space-y-3 pointer-events-none">
              <div className="w-14 h-14 bg-emerald-950/60 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-800/40">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Errors Logged</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                All PipraPay charge creations, checkout redirects, and callbacks have been operating cleanly with zero errors written to disk.
              </p>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="p-3.5 bg-slate-900 text-slate-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Safe File Logging: Only failed requests are logged. Successful orders are not logged to disk to preserve storage.
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {logContent.length} chars
          </span>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Clear PipraPay Error Log?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This action will completely empty the <code>logs/piprapay_error.log</code> file on the server.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                disabled={clearing}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear File'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
