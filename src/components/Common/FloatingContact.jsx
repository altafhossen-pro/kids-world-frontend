'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, Headphones, X } from 'lucide-react';
import { settingsAPI } from '@/services/api';
import { trackContact } from '@/utils/metaPixel';

// Official WhatsApp Icon SVG
const WhatsAppIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Official Messenger Icon SVG
const MessengerIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.085.3 2.241.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.888-3.259-6.559 6.963z"/>
  </svg>
);

export default function FloatingContact() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const res = await settingsAPI.getSupportSettings();
        if (isMounted) {
          if (res?.success && res?.data) {
            setConfig(res.data);
          }
          setIsLoaded(true);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoaded(true);
        }
        console.error('Failed to load floating support settings', err);
      }
    };

    fetchConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  // Don't show in admin dashboard
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  // Do not render anything until settings data is completely loaded
  if (!isLoaded || !config || !config.isEnabled) {
    return null;
  }

  // Check if at least one channel is enabled
  const hasCall = config.call?.isEnabled && config.call?.phoneNumber;
  const hasWhatsapp = config.whatsapp?.isEnabled && config.whatsapp?.phoneNumber;
  const hasMessenger = config.messenger?.isEnabled && config.messenger?.url;

  if (!hasCall && !hasWhatsapp && !hasMessenger) {
    return null;
  }

  // Format WhatsApp Link
  const rawWaDigits = (config.whatsapp?.phoneNumber || '').replace(/[^0-9]/g, '');
  const cleanWaNumber = rawWaDigits.startsWith('01') ? `88${rawWaDigits}` : rawWaDigits;
  const waMessageParam = config.whatsapp?.message ? `?text=${encodeURIComponent(config.whatsapp.message)}` : '';
  const waUrl = `https://wa.me/${cleanWaNumber}${waMessageParam}`;

  // Format Messenger Link
  let messengerUrl = (config.messenger?.url || '').trim();
  if (messengerUrl && !messengerUrl.startsWith('http')) {
    messengerUrl = `https://m.me/${messengerUrl.replace(/^@/, '')}`;
  }

  // Format Call Link
  const callPhone = (config.call?.phoneNumber || '').trim();
  const callUrl = `tel:${callPhone}`;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-[90] flex flex-col items-end select-none">
      
      {/* Expanded Contact Channels */}
      {isOpen && (
        <div className="flex flex-col items-end gap-3 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Messenger Button */}
          {hasMessenger && (
            <div className="flex items-center gap-2 group">
              <span className="hidden sm:inline-block bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                Messenger Chat
              </span>
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContact('Messenger Support', { url: messengerUrl })}
                className="w-13 h-13 rounded-full bg-[#0084FF] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,132,255,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Chat on Messenger"
              >
                <MessengerIcon className="w-7 h-7" />
              </a>
            </div>
          )}

          {/* WhatsApp Button */}
          {hasWhatsapp && (
            <div className="flex items-center gap-2 group">
              <span className="hidden sm:inline-block bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                WhatsApp Support
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContact('WhatsApp Support', { phone: cleanWaNumber })}
                className="w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-7 h-7" />
              </a>
            </div>
          )}

          {/* Direct Phone Call Button */}
          {hasCall && (
            <div className="flex items-center gap-2 group">
              <span className="hidden sm:inline-block bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold py-1.5 px-3 rounded-xl shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                {config.call?.label || 'Call Support'}
              </span>
              <a
                href={callUrl}
                onClick={() => trackContact('Phone Call Support', { phone: callPhone })}
                className="w-13 h-13 rounded-full bg-[#FF6A00] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(255,106,0,0.45)] hover:scale-110 active:scale-95 transition-all duration-200"
                aria-label="Direct Phone Call"
              >
                <Phone className="w-6 h-6" />
              </a>
            </div>
          )}

        </div>
      )}

      {/* Main Trigger Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center text-white shadow-[0_6px_25px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer z-10 ${
          isOpen 
            ? 'bg-[#222831] rotate-90 ring-4 ring-black/10' 
            : 'bg-[#1e232a] hover:bg-[#15191e]'
        }`}
        aria-label={isOpen ? "Close support menu" : "Open support menu"}
      >
        {isOpen ? (
          <X className="w-7 h-7 text-white stroke-[2.5]" />
        ) : (
          <>
            <Headphones className="w-7 h-7 text-white stroke-[2.2]" />
            {/* Ambient pulse ring */}
            <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping pointer-events-none"></span>
          </>
        )}
      </button>

    </div>
  );
}
