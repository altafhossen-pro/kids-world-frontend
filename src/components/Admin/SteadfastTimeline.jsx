'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Printer, 
  MapPin, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { getCookie } from 'cookies-next';
import { steadfastAPI } from '@/services/steadfastApi';

export default function SteadfastTimeline({ order, onOpenPrintModal }) {
  const [loading, setLoading] = useState(false);
  const [liveSteps, setLiveSteps] = useState([]);
  const [webhookHistory, setWebhookHistory] = useState([]);
  const [payout, setPayout] = useState(null);
  const [liveData, setLiveData] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const invoice = order?.orderId || order?._id;
  const consignmentId = liveData?.consignmentId || order?.steadfastConsignmentId;
  const trackingCode = liveData?.trackingCode || order?.steadfastTrackingCode;

  const fetchTracking = useCallback(async (isSilent = false) => {
    if (!invoice && !order?.steadfastConsignmentId) return;
    if (!isSilent) setLoading(true);
    try {
      const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await steadfastAPI.getLiveTracking(invoice, token);
      if (res && res.success && res.data) {
        setLiveData(res.data);
        setLiveSteps(res.data.liveSteps || []);
        setWebhookHistory(res.data.webhookHistory || []);
        if (res.data.payout) {
          setPayout(res.data.payout);
        }
        setLastSynced(new Date());
      }
    } catch (err) {
      console.warn('Steadfast live tracking auto-load notice:', err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [invoice, order?.steadfastConsignmentId]);

  // Auto-fetch Steadfast live tracking and financial settlement on page load (No button click required!)
  useEffect(() => {
    if (order?.isAddedIntoSteadfast || order?.steadfastConsignmentId || order?.steadfastTrackingCode) {
      fetchTracking(false);
    }
  }, [invoice, order?.isAddedIntoSteadfast, order?.steadfastConsignmentId, order?.steadfastTrackingCode, fetchTracking]);

  if (!order?.isAddedIntoSteadfast && !order?.steadfastConsignmentId && !order?.steadfastTrackingCode) {
    return null;
  }

  // Format timestamp in Asia/Dhaka (BDT)
  const formatBDT = (timestamp) => {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return { dateStr: 'Recent', timeStr: '' };
      const dateStr = d.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = d.toLocaleTimeString('en-GB', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toLowerCase();
      return { dateStr, timeStr };
    } catch (e) {
      return { dateStr: 'Recent', timeStr: '' };
    }
  };

  // Status badge styling helper
  const courierStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase().replace(/[_-]+/g, '');
    if (s.includes('deliver') && !s.includes('out') && !s.includes('partial')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s.includes('partial')) {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (s.includes('outfordelivery') || s.includes('rider')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s.includes('transit') || s.includes('hub') || s.includes('warehouse')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    if (s.includes('cancel') || s.includes('return') || s.includes('fail')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (s.includes('review') || s.includes('pending') || s.includes('hold')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatStatusLabel = (status) => {
    if (!status) return 'In Review';
    return String(status)
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Combine and deduplicate events for chronological timeline (latest first)
  const allEvents = [];

  // 1. Add live steps from Steadfast API
  (liveSteps || []).forEach((step, idx) => {
    allEvents.push({
      id: `live_${idx}_${step.created_at || ''}`,
      text: step.text || step.message || 'Courier Activity',
      status: step.status || step.tracking_type || 'pending',
      timestamp: step.created_at || step.updated_at || new Date(),
      source: 'api_sync',
      receivable_amount: 0
    });
  });

  // 2. Add recorded webhook history
  (webhookHistory || []).forEach((wh, idx) => {
    const whTime = new Date(wh.updated_at_steadfast || wh.createdAt);
    const text = wh.tracking_message || (wh.status ? `Parcel status updated to ${wh.status}` : 'Update received');
    const isDuplicate = allEvents.some(
      (e) => e.text === text && Math.abs(new Date(e.timestamp).getTime() - whTime.getTime()) < 60000
    );
    if (!isDuplicate) {
      allEvents.push({
        id: wh._id || `wh_${idx}`,
        text,
        status: wh.status || 'update',
        timestamp: whTime,
        source: wh.source || 'webhook',
        receivable_amount: wh.net_amount || wh.receivable_amount || 0
      });
    }
  });

  // 3. Fallback initial dispatch step if order is booked but no milestone received yet
  if (allEvents.length === 0 && (order?.isAddedIntoSteadfast || consignmentId)) {
    allEvents.push({
      id: 'init_dispatch',
      text: 'Consignment created by Sender(API).',
      status: 'in_review',
      timestamp: new Date(order?.updatedAt || order?.createdAt || Date.now()),
      source: 'api_sync',
      receivable_amount: 0
    });
  }

  // Sort latest first
  const sortedEvents = allEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Financial breakdown metrics (matches Steadfast rules & Laravel formula)
  const rawCollected = payout?.cod_amount !== undefined 
    ? payout.cod_amount 
    : (order?.steadfastCollectedAmount > 0 
        ? order.steadfastCollectedAmount 
        : (order?.paymentStatus === 'paid' ? 0 : (order?.totalAmount || order?.total || 0)));

  const rawDelivery = payout?.delivery_charge !== undefined 
    ? payout.delivery_charge 
    : (order?.steadfastDeliveryCharge > 0 
        ? order.steadfastDeliveryCharge 
        : (order?.shippingCost > 0 ? order.shippingCost : 70));

  const rawCodFee = payout?.cod_charge !== undefined 
    ? payout.cod_charge 
    : (order?.steadfastCodCharge > 0 
        ? order.steadfastCodCharge 
        : Math.round(Math.max(0, rawCollected - rawDelivery) * 0.01));

  const rawReceivable = payout?.net_receivable !== undefined 
    ? payout.net_receivable 
    : (order?.steadfastReceivableAmount > 0 
        ? order.steadfastReceivableAmount 
        : Math.max(0, Math.round((rawCollected - rawDelivery) - rawCodFee)));

  const collectedAmount = Number(rawCollected) || 0;
  const deliveryCharge = Number(rawDelivery) || 0;
  const codCharge = Number(rawCodFee) || 0;
  const receivableAmount = Number(rawReceivable) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-base border border-pink-100 shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Courier Tracking Log
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 uppercase tracking-wider">
                Steadfast
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                {sortedEvents.length} Events
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Real-time parcel journey, rider updates &amp; financial settlement.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenPrintModal && (
            <button
              onClick={onOpenPrintModal}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Label</span>
            </button>
          )}

          {trackingCode ? (
            <a
              href={`https://steadfast.com.bd/t/${trackingCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>Steadfast</span>
            </a>
          ) : consignmentId ? (
            <a
              href={`https://steadfast.com.bd/user/consignment/${consignmentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>Steadfast</span>
            </a>
          ) : null}

          <button
            type="button"
            onClick={() => fetchTracking(false)}
            disabled={loading}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Tracking'}</span>
          </button>
        </div>
      </div>

      {/* Financial Settlement Breakdown (Available when booked) */}
      {(order.isAddedIntoSteadfast || consignmentId) && (collectedAmount > 0 || deliveryCharge > 0 || receivableAmount > 0) && (
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/90">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/70">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Financial Breakdown
              </h3>
            </div>
            {consignmentId && (
              <span className="text-[11px] font-mono text-slate-500 font-semibold">
                CID: #{consignmentId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Cash Collected */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
              <p className="text-slate-500 text-[11px] font-medium">Cash Collected</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                ৳{collectedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* Delivery Charge */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
              <p className="text-slate-500 text-[11px] font-medium">Delivery Charge</p>
              <p className="text-sm font-bold text-rose-600 mt-0.5">
                −৳{deliveryCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* COD Fee (1%) */}
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-xs">
              <p className="text-slate-500 text-[11px] font-medium">COD Fee (1%)</p>
              <p className="text-sm font-bold text-amber-600 mt-0.5">
                −৳{codCharge.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            {/* You Receive (Net Payout) */}
            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 shadow-xs">
              <p className="text-emerald-800 text-[11px] font-bold">You Receive</p>
              <p className="text-sm font-black text-emerald-700 mt-0.5">
                ৳{receivableAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Vertical Timeline (3-Column Layout: Date/Time -> Vertical Line & Node Dot -> Event Card) */}
      <div className="pt-2">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-10 px-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 mx-auto flex items-center justify-center text-xl mb-2.5 border border-pink-100">
              <MapPin className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No courier tracking events yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Tracking events from Steadfast will appear here automatically via webhook callback, or click &quot;Sync Tracking&quot; above to check live.
            </p>
          </div>
        ) : (
          <div className="space-y-0 relative">
            {sortedEvents.map((evt, index) => {
              const { dateStr, timeStr } = formatBDT(evt.timestamp);
              const isLast = index === sortedEvents.length - 1;
              const isLatest = index === 0;

              return (
                <div key={evt.id || index} className="flex items-start group">
                  {/* Left Column: Date & Time in BDT */}
                  <div className="w-28 sm:w-32 text-right shrink-0 pr-4 sm:pr-5 pt-1">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                      {dateStr}
                    </div>
                    <div className="text-[11px] sm:text-xs font-semibold text-pink-600 flex items-center justify-end gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-pink-500 shrink-0" />
                      <span>{timeStr}</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                      BDT
                    </div>
                  </div>

                  {/* Center Column: Connecting Vertical Line & Node Dot */}
                  <div className="relative flex flex-col items-center self-stretch shrink-0">
                    {/* Node Dot */}
                    <div 
                      className={`relative z-10 w-3.5 h-3.5 rounded-full shrink-0 my-1 transition-transform group-hover:scale-110 ${
                        isLatest 
                          ? 'bg-pink-600 ring-4 ring-pink-100 shadow-xs' 
                          : 'bg-pink-500 ring-2 ring-pink-100'
                      }`}
                    />
                    {/* Vertical Connecting Line */}
                    {!isLast && (
                      <div className="w-0.5 bg-pink-200 grow -mt-1" />
                    )}
                  </div>

                  {/* Right Column: Event Card */}
                  <div className="flex-1 pl-4 sm:pl-5 pb-5">
                    <div className="bg-slate-50/80 group-hover:bg-white border border-slate-200/80 group-hover:border-slate-300 rounded-2xl p-4 shadow-xs transition-all duration-200">
                      <div className="text-sm font-semibold text-slate-800 leading-relaxed">
                        {evt.text}
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/50">
                        {/* Status badge */}
                        {evt.status && evt.status !== 'undefined' && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${courierStatusBadgeClass(evt.status)}`}>
                            {formatStatusLabel(evt.status)}
                          </span>
                        )}

                        {/* Payout Tag (if available) */}
                        {evt.receivable_amount > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 font-mono">
                            • Payout: ৳{Number(evt.receivable_amount).toFixed(2)}
                          </span>
                        )}

                        {/* Source Tag */}
                        {evt.source && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium text-slate-400">
                            via {evt.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
