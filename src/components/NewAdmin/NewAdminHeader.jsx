'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
    Search, 
    Bell, 
    MessageSquare, 
    ChevronDown, 
    Menu, 
    LogOut, 
    User, 
    Settings, 
    Package, 
    ShoppingBag, 
    Users, 
    Phone, 
    ArrowRight, 
    ExternalLink, 
    Loader2, 
    Tag, 
    Truck, 
    X 
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';
import { orderAPI, dashboardAPI } from '@/services/api';

export const RollingNumber = ({ value }) => {
    if (value === null || value === undefined) {
        return <span className="h-[1em] leading-[1em] font-bold">-</span>;
    }
    const numStr = value.toString();
    return (
        <div className="flex overflow-hidden h-[1em] leading-[1em] font-bold font-inherit text-inherit">
            {numStr.split('').map((char, i) => {
                const num = parseInt(char);
                if (isNaN(num)) return <span key={i} className="h-[1em] flex items-center">{char}</span>;
                return (
                    <div
                        key={i}
                        className="flex flex-col transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateY(-${num * 100}%)` }}
                    >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <span key={n} className="h-[1em] flex items-center justify-center">
                                {n}
                            </span>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default function NewAdminHeader({ onMenuToggle }) {
    const { user, logout } = useAppContext();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef(null);
    const [liveVisitors, setLiveVisitors] = useState(null);

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const notificationDropdownRef = useRef(null);

    // Global Unified Search States
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [searchActiveTab, setSearchActiveTab] = useState('all');
    const searchDropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Fetch initial notifications
    const fetchNotifications = async (pageNumber = 1) => {
        try {
            setLoadingNotifications(true);
            const token = getCookie('token');
            const data = await orderAPI.getAdminNotifications(pageNumber, 10, token);
            if (data.success) {
                if (pageNumber === 1) {
                    setNotifications(data.data.notifications);
                } else {
                    setNotifications(prev => [...prev, ...data.data.notifications]);
                }
                setUnreadCount(data.data.unreadCount);
                setHasMore(data.data.hasMore);
                setPage(pageNumber);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications(1);
    }, []);

    // Listen for custom read events from other components (like orders table)
    useEffect(() => {
        const handleNotificationRead = (event) => {
            const orderId = event.detail;
            setNotifications(currentNotifications => {
                const isPresentAndUnread = currentNotifications.some(n => n._id === orderId && !n.isReadByAdmin);
                if (isPresentAndUnread) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    return currentNotifications.map(o => o._id === orderId ? { ...o, isReadByAdmin: true } : o);
                }
                return currentNotifications;
            });
        };

        window.addEventListener('notificationRead', handleNotificationRead);
        return () => window.removeEventListener('notificationRead', handleNotificationRead);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Socket.io integration for realtime visitors
    useEffect(() => {
        const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api/v1', '');
        const visitorId = getCookie('visitor_id');
        const socket = io(socketUrl, {
            transports: ['websocket'],
            auth: {
                visitorId: visitorId
            }
        });

        socket.on('unique_visitors_count', (count) => {
            setLiveVisitors(count);
        });

        socket.on('new-order', (orderData) => {
            orderData.isReadByAdmin = false;
            setNotifications(prev => [orderData, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Keyboard shortcut (Ctrl+K or Cmd+K to focus search, Escape to close)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
                setIsSearchFocused(true);
            } else if (e.key === 'Escape') {
                setIsSearchFocused(false);
                searchInputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Global Unified Search debounced logic
    useEffect(() => {
        const fetchSearchResults = async () => {
            const q = searchQuery.trim();
            if (!q || q.length < 2) {
                setSearchResults({ products: [], orders: [], customers: [] });
                return;
            }

            try {
                setIsSearching(true);
                const token = getCookie('token') || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
                const res = await dashboardAPI.adminSearch(q, token);

                if (res?.success && res.data) {
                    setSearchResults({
                        products: Array.isArray(res.data.products) ? res.data.products : [],
                        orders: Array.isArray(res.data.orders) ? res.data.orders : [],
                        customers: Array.isArray(res.data.customers) ? res.data.customers : []
                    });
                }
            } catch (err) {
                console.error('Unified Admin Search failed:', err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchSearchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Order status badge helper
    const getOrderStatusBadgeClass = (status) => {
        const s = String(status || '').toLowerCase();
        switch (s) {
            case 'delivered':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'confirmed':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'processing':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'shipped':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'cancelled':
            case 'returned':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'pending':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    const handleNotificationClick = async (order) => {
        try {
            if (!order.isReadByAdmin) {
                const token = getCookie('token');
                await orderAPI.markNotificationRead(order._id, token);

                setNotifications(prev => prev.map(o =>
                    o._id === order._id ? { ...o, isReadByAdmin: true } : o
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setIsNotificationsOpen(false);
            router.push(`/admin/dashboard/orders/${order._id}`);
        } catch (err) {
            console.error('Failed to mark order as read', err);
            router.push(`/admin/dashboard/orders/${order._id}`);
        }
    };

    return (
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 flex-shrink-0 print:hidden">
            {/* Mobile menu toggle */}
            <button
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                onClick={onMenuToggle}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Search — Global Unified Search */}
            <div className="relative flex-1 min-w-0 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl" ref={searchDropdownRef}>
                <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        {isSearching ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                            <Search className={`w-4 h-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products, SKU, order ID, CID, phone, customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onClick={() => setIsSearchFocused(true)}
                        className={`block w-full pl-10 pr-14 sm:pr-16 py-2 rounded-xl text-sm transition-all duration-200 outline-none ${
                            isSearchFocused
                                ? 'bg-white border border-blue-400 ring-4 ring-blue-100/70 text-gray-800 shadow-xs'
                                : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 placeholder-gray-400'
                        }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                        {searchQuery ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSearchResults({ products: [], orders: [], customers: [] });
                                    searchInputRef.current?.focus();
                                }}
                                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Clear search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-200/70 border border-gray-200 rounded font-mono">
                                Ctrl+K
                            </kbd>
                        )}
                    </div>
                </div>

                {/* Search Dropdown */}
                {isSearchFocused && searchQuery.trim().length >= 2 && (
                    <div className="absolute left-0 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[580px] lg:w-[640px] max-w-[92vw] mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[120] max-h-[520px] overflow-hidden flex flex-col">
                        {/* Tabs Header */}
                        <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs shrink-0 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setSearchActiveTab('all')}
                                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'all'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                All ({searchResults.products.length + searchResults.orders.length + searchResults.customers.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchActiveTab('products')}
                                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'products'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Products ({searchResults.products.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchActiveTab('orders')}
                                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'orders'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Orders ({searchResults.orders.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchActiveTab('customers')}
                                className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'customers'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                                Customers ({searchResults.customers.length})
                            </button>
                        </div>

                        {/* Dropdown Content */}
                        <div className="overflow-y-auto divide-y divide-gray-100 flex-1">
                            {isSearching ? (
                                <div className="py-10 px-4 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                                    <p className="text-xs font-semibold text-gray-500">Searching products, orders &amp; customers...</p>
                                </div>
                            ) : (searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.customers.length === 0) ? (
                                <div className="py-10 px-6 text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                        <Search className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">No matching results for &ldquo;{searchQuery}&rdquo;</p>
                                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                        Try searching with product name, product SKU, 6-digit Order ID, Steadfast consignment ID, or customer phone number.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* PRODUCTS SECTION */}
                                    {(searchActiveTab === 'all' || searchActiveTab === 'products') && searchResults.products.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1.5 bg-gray-50/70 text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Package className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Products ({searchResults.products.length})</span>
                                                </span>
                                                <Link
                                                    href="/admin/dashboard/products"
                                                    onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                                                    className="text-blue-600 hover:underline normal-case font-semibold text-[11px]"
                                                >
                                                    View all
                                                </Link>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {searchResults.products.map(p => (
                                                    <Link
                                                        key={`prod-${p._id}`}
                                                        href={p.url || `/admin/dashboard/products/${p._id}/edit`}
                                                        onClick={() => {
                                                            setIsSearchFocused(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/70 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={p.image || '/images/placeholder.png'}
                                                                alt={p.name}
                                                                className="w-11 h-11 object-cover rounded-xl border border-gray-200 bg-gray-100 shrink-0"
                                                                onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                                                                    {p.name}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                    {p.sku && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] font-bold border border-gray-200">
                                                                            SKU: {p.sku}
                                                                        </span>
                                                                    )}
                                                                    {p.variantLabel && (
                                                                        <span className="text-[11px] text-gray-500 font-medium truncate">
                                                                            {p.variantLabel}
                                                                        </span>
                                                                    )}
                                                                    {p.brand && (
                                                                        <span className="text-[11px] text-gray-400">
                                                                            • {p.brand}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-3">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                ৳{Number(p.price).toLocaleString()}
                                                            </span>
                                                            <div className="text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                                                                <span>Edit Product</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ORDERS SECTION */}
                                    {(searchActiveTab === 'all' || searchActiveTab === 'orders') && searchResults.orders.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1.5 bg-gray-50/70 text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Orders ({searchResults.orders.length})</span>
                                                </span>
                                                <Link
                                                    href="/admin/dashboard/orders"
                                                    onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                                                    className="text-blue-600 hover:underline normal-case font-semibold text-[11px]"
                                                >
                                                    View all
                                                </Link>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {searchResults.orders.map(o => (
                                                    <Link
                                                        key={`order-${o._id}`}
                                                        href={o.url || `/admin/dashboard/orders/${o._id}`}
                                                        onClick={() => {
                                                            setIsSearchFocused(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/70 transition-colors group cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                                                                <ShoppingBag className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
                                                                        Order #{o.orderId}
                                                                    </p>
                                                                    {o.status && (
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${getOrderStatusBadgeClass(o.status)}`}>
                                                                            {o.status}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                                                                    <span className="font-medium text-gray-700">{o.customerName}</span>
                                                                    {o.customerPhone && <span>• {o.customerPhone}</span>}
                                                                    {o.steadfastConsignmentId && (
                                                                        <span className="px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 font-mono text-[10px] font-bold border border-pink-200">
                                                                            CID: #{o.steadfastConsignmentId}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-3">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                ৳{Number(o.total).toLocaleString()}
                                                            </span>
                                                            <div className="text-[10px] text-blue-600 font-semibold group-hover:underline flex items-center justify-end gap-0.5 mt-0.5">
                                                                <span>Order Details</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CUSTOMERS SECTION */}
                                    {(searchActiveTab === 'all' || searchActiveTab === 'customers') && searchResults.customers.length > 0 && (
                                        <div className="py-2">
                                            <div className="px-4 py-1.5 bg-gray-50/70 text-[11px] font-bold text-gray-600 uppercase tracking-wider flex items-center justify-between">
                                                <span className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5 text-blue-600" />
                                                    <span>Customers ({searchResults.customers.length})</span>
                                                </span>
                                                <Link
                                                    href="/admin/dashboard/customers"
                                                    onClick={() => { setIsSearchFocused(false); setSearchQuery(''); }}
                                                    className="text-blue-600 hover:underline normal-case font-semibold text-[11px]"
                                                >
                                                    View all
                                                </Link>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {searchResults.customers.map(c => (
                                                    <div
                                                        key={`cust-${c._id}`}
                                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-purple-50/60 transition-colors group cursor-pointer"
                                                        onClick={() => {
                                                            setIsSearchFocused(false);
                                                            setSearchQuery('');
                                                            router.push(c.url);
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200">
                                                                {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 truncate">
                                                                        {c.name}
                                                                    </p>
                                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                                                                        {c.role || 'Customer'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                                    {c.phone && (
                                                                        <span className="flex items-center gap-1 text-gray-700 font-mono font-medium">
                                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                                            {c.phone}
                                                                        </span>
                                                                    )}
                                                                    {c.email && (
                                                                        <span className="truncate">• {c.email}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-3 flex items-center gap-2">
                                                            {c.phone && (
                                                                <Link
                                                                    href={`/admin/dashboard/order-history/${c.phone}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setIsSearchFocused(false);
                                                                        setSearchQuery('');
                                                                    }}
                                                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors shadow-xs"
                                                                    title="View Customer Order History"
                                                                >
                                                                    Order History
                                                                </Link>
                                                            )}
                                                            <div className="text-[10px] text-purple-600 font-semibold group-hover:underline flex items-center gap-0.5">
                                                                <span>Details</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Spacer — pushes right section all the way to the right */}
            <div className="flex-1" />

            {/* Right actions — always at the far right */}
            <div className="flex items-center gap-2">
                {/* Realtime Visitors Badge */}
                <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 mr-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-xs font-semibold mr-1">Realtime:</span>
                    <RollingNumber value={liveVisitors} />
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationDropdownRef}>
                    <button
                        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {isNotificationsOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <>
                                        {notifications.map((order) => {
                                            const totalWithShipping = order.total ? order.total : 0;
                                            const customerPhone = order.phone || (order.user?.phone || order.guestInfo?.phone || '');
                                            return (
                                                <div
                                                    key={order._id}
                                                    onClick={() => handleNotificationClick(order)}
                                                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors relative ${order.isReadByAdmin ? 'hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
                                                >
                                                    {!order.isReadByAdmin && (
                                                        <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-xl ${order.isReadByAdmin ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 pr-4">
                                                            <p className={`text-sm font-medium ${order.isReadByAdmin ? 'text-gray-600' : 'text-gray-900'}`}>
                                                                New Order #{order.orderId}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                                From: {order.customerName || (order.user?.name || order.guestInfo?.name || 'Customer')}
                                                            </p>
                                                            {customerPhone && (
                                                                <p className="text-xs text-gray-400 mt-0.5">{customerPhone}</p>
                                                            )}
                                                            <p className={`text-xs font-semibold mt-1 ${order.isReadByAdmin ? 'text-gray-500' : 'text-blue-600'}`}>
                                                                ৳{totalWithShipping}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {hasMore && (
                                            <div className="p-3 text-center border-t border-gray-50 bg-gray-50/50">
                                                <button
                                                    onClick={() => fetchNotifications(page + 1)}
                                                    disabled={loadingNotifications}
                                                    className="text-xs text-blue-600 font-semibold hover:text-blue-700 disabled:opacity-50"
                                                >
                                                    {loadingNotifications ? 'Loading...' : 'Load More'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                                        <Bell className="h-8 w-8 text-gray-300 mb-2" />
                                        <p className="text-gray-500 text-sm">No notifications yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>



                {/* Divider */}
                <div className="w-px h-6 bg-gray-200 mx-1" />

                {/* User */}
                <div className="relative" ref={profileDropdownRef}>
                    <div 
                        className="flex items-center gap-2.5 cursor-pointer group pl-1 hover:bg-gray-50 p-1.5 rounded-xl transition-colors"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Admin"
                                className="w-9 h-9 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                            />
                        ) : (
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm font-bold">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            </div>
                        )}
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-800 leading-tight truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
                            <p className="text-xs text-gray-500 font-medium capitalize">{user?.role || 'Admin'}</p>
                        </div>
                        <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Profile Dropdown Menu */}
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                            <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                                <p className="text-sm font-bold text-gray-800">{user?.name || 'Administrator'}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Admin'}</p>
                            </div>
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <User className="h-4 w-4 mr-2 text-gray-400" />
                                Profile
                            </button>
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Settings className="h-4 w-4 mr-2 text-gray-400" />
                                Settings
                            </button>
                            <hr className="my-1 border-gray-100" />
                            <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
