'use client';

import React, { useState, useEffect } from 'react';
import {
  History, Zap, CheckCircle2, XCircle, Clock, Send,
  RefreshCw, X, User, Phone, Sparkles, ExternalLink, ArrowRight
} from 'lucide-react';
import visitorAPI from '@/services/visitorApi';

export default function OfferHistoryModal({
  isOpen,
  onClose,
  visitor,
  token,
  onOpenSendOffer
}) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const visitorId = visitor?.visitorId || visitor?.sessionId;

  const fetchHistory = async () => {
    if (!visitorId) return;
    setLoading(true);
    try {
      const res = await visitorAPI.getOffersHistory(token, { visitorId, limit: 100 });
      if (res && res.success && Array.isArray(res.data)) {
        setOffers(res.data);
      } else {
        setOffers([]);
      }
    } catch (err) {
      console.error('Failed to fetch offer history:', err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && visitorId) {
      fetchHistory();
    }
  }, [isOpen, visitorId]);

  if (!isOpen || !visitor) return null;

  const acceptedCount = offers.filter(o => o.status === 'clicked' || o.status === 'accepted').length;
  const dismissedCount = offers.filter(o => o.status === 'dismissed').length;
  const pendingCount = offers.filter(o => o.status === 'pending').length;

  const formatDateTime = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const dateStr = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Dhaka'
    });
    const timeStr = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
    });
    return `${dateStr}, ${timeStr} (BDT)`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
              <History className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Visitor Offer History
                </h3>
                {visitor.dailySerial && (
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    #{visitor.dailySerial}
                  </span>
                )}
                {visitor.customerName && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {visitor.customerName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5">
                <span>{visitor.visitorId}</span>
                {visitor.customerPhone && (
                  <>
                    <span>•</span>
                    <a href={`tel:${visitor.customerPhone}`} className="text-blue-600 font-semibold hover:underline">
                      {visitor.customerPhone}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fetchHistory}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white border border-slate-200/60 transition-colors shadow-2xs cursor-pointer"
              title="Refresh History"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">
              Total Offers: <strong className="text-slate-800">{offers.length}</strong>
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {acceptedCount} Accepted
            </span>
            <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {dismissedCount} Closed/Dismissed
            </span>
            {pendingCount > 0 && (
              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {pendingCount} Pending
              </span>
            )}
          </div>

          {onOpenSendOffer && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSendOffer(visitor);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Send New Offer</span>
            </button>
          )}
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">Loading offer history...</p>
            </div>
          ) : offers.length === 0 ? (
            <div className="py-12 text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Offers Dispatched Yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                You haven't dispatched any custom pop-up offers to this visitor yet.
              </p>
              {onOpenSendOffer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSendOffer(visitor);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send First Offer Now</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {offers.map((o) => {
                const isAccepted = o.status === 'clicked' || o.status === 'accepted';
                const isDismissed = o.status === 'dismissed';
                const isPending = o.status === 'pending';

                return (
                  <div
                    key={o._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isAccepted
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-xs'
                        : isDismissed
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-amber-50/40 border-amber-200 shadow-xs'
                    }`}
                  >
                    {/* Top Row: Title + Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>{o.title}</span>
                          {o.delaySeconds > 0 && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {o.delaySeconds}s delay
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">
                          {o.message}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <div className="flex-shrink-0">
                        {isAccepted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Accepted</span>
                          </span>
                        ) : isDismissed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-700 border border-slate-300">
                            <XCircle className="w-3.5 h-3.5 text-slate-500" />
                            <span>Dismissed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            <span>Pending on Screen</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Button and Timing Metadata */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-700">Button:</span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-medium text-slate-800">
                          {o.buttonText || 'অর্ডার সম্পন্ন করুন'} ({o.buttonUrl || '/checkout'})
                        </span>
                        {o.adminName && (
                          <span className="text-slate-400">
                            • Sent by <strong>{o.adminName}</strong>
                          </span>
                        )}
                      </div>

                      <div className="space-y-0.5 text-right font-mono">
                        <div>
                          Sent: <span className="font-semibold text-slate-700">{formatDateTime(o.createdAt)}</span>
                        </div>
                        {o.actionAt && (
                          <div className={isAccepted ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                            {isAccepted ? 'Accepted' : 'Closed'}: {formatDateTime(o.actionAt)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Total <strong>{offers.length}</strong> custom offers dispatched to this visitor
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
