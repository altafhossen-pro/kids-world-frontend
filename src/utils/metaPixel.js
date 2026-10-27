import { metaPixelAPI } from '@/services/api';

// In-memory cached settings to minimize API calls
let cachedSettings = null;
let isInitializing = false;
let pixelInitialized = false;

// Generate unique event ID for Meta deduplication (Browser Pixel + Server CAPI)
export const generateEventId = (prefix = 'ev') => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// Fetch and cache tracking settings
export const getTrackingSettings = async (forceRefresh = false) => {
  if (cachedSettings && !forceRefresh) {
    return cachedSettings;
  }
  try {
    const res = await metaPixelAPI.getPublicSettings();
    if (res && res.success && res.data) {
      cachedSettings = res.data;
      return cachedSettings;
    }
  } catch (err) {
    console.error('[Meta Tracking] Failed to load settings:', err);
  }
  return { isEnabled: false, pixelId: '', trackedEvents: {} };
};

// Initialize Facebook Pixel script in document head
export const initMetaPixel = async () => {
  if (typeof window === 'undefined') return;
  if (pixelInitialized || isInitializing) return;

  isInitializing = true;
  try {
    const settings = await getTrackingSettings();
    if (!settings?.isEnabled || !settings?.pixelId) {
      isInitializing = false;
      return;
    }

    // Official Meta Pixel base snippet
    if (!window.fbq) {
      /* eslint-disable */
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
    }

    window.fbq('init', settings.pixelId);
    pixelInitialized = true;
    console.log(`[Meta Pixel] Initialized with Pixel ID: ${settings.pixelId}`);
  } catch (error) {
    console.error('[Meta Pixel] Initialization error:', error);
  } finally {
    isInitializing = false;
  }
};

// Helper to check if a specific event type is enabled in admin settings
const isEventEnabled = (settings, eventName) => {
  if (!settings?.isEnabled) return false;
  const map = {
    PageView: 'pageView',
    ViewCategory: 'viewCategory',
    ViewContent: 'viewContent',
    Search: 'search',
    AddToCart: 'addToCart',
    InitiateCheckout: 'initiateCheckout',
    CompleteRegistration: 'completeRegistration',
    Contact: 'contact',
    Purchase: 'purchase'
  };
  const key = map[eventName];
  if (!key) return true;
  return settings.trackedEvents?.[key] !== false;
};

// Master Hybrid Track function: sends to Browser Pixel & Server Conversions API
export const trackEvent = async (eventName, customData = {}, userData = {}) => {
  if (typeof window === 'undefined') return;

  try {
    const settings = await getTrackingSettings();
    if (!isEventEnabled(settings, eventName)) {
      return;
    }

    // Ensure pixel base code is ready
    if (!pixelInitialized && settings.pixelId) {
      await initMetaPixel();
    }

    const eventId = generateEventId(eventName.toLowerCase());

    // 1. Browser-side Tracking via fbq
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, customData, { eventID: eventId });
    }

    // 2. Server-side Tracking via CAPI (Conversions API)
    metaPixelAPI.trackServerEvent({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      customData,
      userData: {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName
      }
    }).catch(err => {
      console.warn(`[Meta CAPI] Event ${eventName} failed:`, err);
    });

    console.log(`[Meta Hybrid Track] ✓ Event: ${eventName}`, { eventId, customData, userData });
    return eventId;
  } catch (err) {
    console.error(`[Meta Track] Error tracking ${eventName}:`, err);
  }
};

// ── Specific Event Helpers ──────────────────────────────────────────────────

// 1. PageView
export const trackPageView = (url) => {
  return trackEvent('PageView', {
    page_path: url || (typeof window !== 'undefined' ? window.location.pathname : '')
  });
};

// 2. ViewCategory
export const trackViewCategory = (categoryName, totalProducts = 0) => {
  return trackEvent('ViewCategory', {
    content_name: categoryName,
    content_category: categoryName,
    num_items: totalProducts
  });
};

// 3. ViewContent
export const trackViewContent = (product, user = null) => {
  if (!product) return;
  const price = product.price || product.basePrice || product.variants?.[0]?.currentPrice || 0;
  return trackEvent('ViewContent', {
    content_name: product.title || product.name,
    content_category: product.category?.name || product.category || 'Product',
    content_ids: [String(product._id || product.id)],
    content_type: 'product',
    value: price,
    currency: 'BDT'
  }, {
    email: user?.email,
    phone: user?.phone,
    firstName: user?.name
  });
};

// 4. Search
export const trackSearch = (searchQuery, resultsCount = 0) => {
  if (!searchQuery) return;
  return trackEvent('Search', {
    search_string: searchQuery,
    num_items: resultsCount
  });
};

// 5. AddToCart
export const trackAddToCart = (product, quantity = 1, variant = null, user = null) => {
  if (!product) return;
  const unitPrice = variant?.currentPrice || product.basePrice || product.price || 0;
  const totalPrice = unitPrice * (quantity || 1);

  return trackEvent('AddToCart', {
    content_name: product.title || product.name,
    content_ids: [String(product._id || product.id)],
    content_type: 'product',
    value: totalPrice,
    currency: 'BDT',
    contents: [
      {
        id: String(product._id || product.id),
        quantity: quantity || 1,
        item_price: unitPrice
      }
    ]
  }, {
    email: user?.email,
    phone: user?.phone,
    firstName: user?.name
  });
};

// 6. InitiateCheckout
export const trackInitiateCheckout = (cartItems = [], totalValue = 0, user = null) => {
  let items = cartItems || [];
  let value = Number(totalValue) || 0;

  if (items.length === 0 && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) items = parsed;
      }
    } catch (e) {
      console.warn('[Meta Tracking] Failed to read cart from localStorage', e);
    }
  }

  if (!value && items.length > 0) {
    value = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  }

  const contents = items.map(item => ({
    id: String(item.productId || item._id || item.id || ''),
    name: item.name || item.title || '',
    quantity: item.quantity || 1,
    item_price: Number(item.price) || 0
  }));

  const contentIds = items.map(item => String(item.productId || item._id || item.id || ''));

  return trackEvent('InitiateCheckout', {
    content_ids: contentIds,
    contents,
    content_type: 'product',
    num_items: items.length,
    value: value,
    currency: 'BDT'
  }, {
    email: user?.email,
    phone: user?.phone,
    firstName: user?.name
  });
};

// 7. CompleteRegistration
export const trackCompleteRegistration = (userData = {}) => {
  return trackEvent('CompleteRegistration', {
    status: 'success',
    method: userData.method || 'email_phone'
  }, {
    email: userData.email,
    phone: userData.phone,
    firstName: userData.name
  });
};

// 8. Contact
export const trackContact = (type = 'Contact Form', contactData = {}) => {
  return trackEvent('Contact', {
    content_name: type,
    status: 'submitted'
  }, {
    email: contactData.email,
    phone: contactData.phone,
    firstName: contactData.name
  });
};

// 9. Purchase (Highest Value Event)
export const trackPurchase = (orderData = {}, user = null) => {
  const items = orderData.items || [];
  const contents = items.map(item => ({
    id: String(item.product?._id || item.product || item.productId),
    name: item.name,
    quantity: item.quantity,
    item_price: item.price
  }));

  const contentIds = items.map(item => String(item.product?._id || item.product || item.productId));

  const shipping = orderData.shippingAddress || {};
  const customerPhone = shipping.phone || orderData.guestInfo?.phone || user?.phone;
  const customerName = shipping.name || orderData.guestInfo?.name || user?.name;
  const customerEmail = shipping.email || user?.email;

  return trackEvent('Purchase', {
    content_ids: contentIds,
    contents,
    content_type: 'product',
    value: orderData.total || 0,
    currency: 'BDT',
    num_items: items.length,
    order_id: String(orderData.orderId || orderData._id || '')
  }, {
    email: customerEmail,
    phone: customerPhone,
    firstName: customerName
  });
};
