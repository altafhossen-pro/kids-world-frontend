'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/context/AppContext'
import { io } from 'socket.io-client'
import { orderAPI, userAPI, dashboardAPI } from '@/services/api'
import { getCookie } from 'cookies-next'
import {
    Search,
    Bell,
    Menu,
    X,
    ChevronDown,
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
    Truck
} from 'lucide-react'

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

export default function AdminHeader({ onMobileMenuToggle }) {
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState({ products: [], orders: [], customers: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [searchActiveTab, setSearchActiveTab] = useState('all')
    const searchDropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [loadingNotifications, setLoadingNotifications] = useState(false)
    const [liveVisitors, setLiveVisitors] = useState(null)
    const [todayTotal, setTodayTotal] = useState(null)

    const { user, logout } = useAppContext()
    const router = useRouter()
    const profileDropdownRef = useRef(null)
    const notificationDropdownRef = useRef(null)

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

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

            // Re-calculate unread count based on the updated notifications array
            // Since we can't reliably know if it was ALREADY read in this context's state before the event,
            // we safely decrement it, but ensure it doesn't go below 0. 
            // We only decrement if we find it in our current state as unread.
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

    // Socket.io integration
    useEffect(() => {
        const socketUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api/v1', '');
        const visitorId = getCookie('visitor_id');
        const socket = io(socketUrl, {
            transports: ['websocket'],
            auth: {
                visitorId: visitorId
            }
        });

        socket.on('connect', () => {
            console.log('Connected to socket server for notifications');
        });

        socket.on('new-order', (orderData) => {
            // New socket events are unread by default
            orderData.isReadByAdmin = false;
            setNotifications(prev => [orderData, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('unique_visitors_count', (count) => {
            setLiveVisitors(count);
        });

        socket.on('today_total_visitors', (count) => {
            setTodayTotal(count);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false)
            }
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
            if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
                setIsSearchFocused(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

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
            // Only API call if it's currently unread
            if (!order.isReadByAdmin) {
                const token = getCookie('token');
                await orderAPI.markNotificationRead(order._id, token);

                // Update local state to mark as read without removing
                setNotifications(prev => prev.map(o =>
                    o._id === order._id ? { ...o, isReadByAdmin: true } : o
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setIsNotificationsOpen(false);
            // Navigate to order details
            router.push(`/admin/dashboard/orders/${order._id}`);
        } catch (err) {
            console.error('Failed to mark order as read', err);
            router.push(`/admin/dashboard/orders/${order._id}`);
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-6">
                {/* Left Side - Mobile Menu + Search */}
                <div className="flex items-center flex-1">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        onClick={onMobileMenuToggle}
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-2 sm:mx-4 w-full">
                        <div className="relative" ref={searchDropdownRef}>
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                {isSearching ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                ) : (
                                    <Search className={`h-4 w-4 transition-colors ${isSearchFocused ? 'text-blue-600' : 'text-slate-400'}`} />
                                )}
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                className={`block w-full pl-10 pr-16 py-2 border rounded-xl text-sm placeholder-slate-400 transition-all duration-200 ${isSearchFocused
                                    ? 'border-blue-400 ring-4 ring-blue-100/70 bg-white shadow-xs'
                                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/70'
                                    } focus:outline-none focus:bg-white`}
                                placeholder="Search products, SKU, order ID, CID, phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onClick={() => setIsSearchFocused(true)}
                            />

                            {/* Right Action inside Input (Clear X or Shortcut badge) */}
                            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setSearchResults({ products: [], orders: [], customers: [] });
                                            searchInputRef.current?.focus();
                                        }}
                                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
                                        Ctrl K
                                    </kbd>
                                )}
                            </div>

                            {/* Search Dropdown */}
                            {isSearchFocused && searchQuery.trim().length >= 2 && (
                                <div className="absolute left-0 sm:-left-4 md:-left-8 right-0 sm:-right-4 md:-right-8 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[120] max-h-[520px] overflow-hidden flex flex-col">
                                    {/* Tabs Header */}
                                    <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs shrink-0 overflow-x-auto">
                                        <button
                                            type="button"
                                            onClick={() => setSearchActiveTab('all')}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'all'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            All ({searchResults.products.length + searchResults.orders.length + searchResults.customers.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSearchActiveTab('products')}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'products'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            Products ({searchResults.products.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSearchActiveTab('orders')}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'orders'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            Orders ({searchResults.orders.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSearchActiveTab('customers')}
                                            className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer shrink-0 ${searchActiveTab === 'customers'
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            Customers ({searchResults.customers.length})
                                        </button>
                                    </div>

                                    {/* Dropdown Content */}
                                    <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                                        {isSearching ? (
                                            <div className="py-10 px-4 text-center">
                                                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                                                <p className="text-xs font-semibold text-slate-500">Searching products, orders &amp; customers...</p>
                                            </div>
                                        ) : (searchResults.products.length === 0 && searchResults.orders.length === 0 && searchResults.customers.length === 0) ? (
                                            <div className="py-10 px-6 text-center">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-800">No matching results for &ldquo;{searchQuery}&rdquo;</p>
                                                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                                    Try searching with product name, product SKU, 6-digit Order ID, Steadfast consignment ID, or customer phone number.
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* PRODUCTS SECTION */}
                                                {(searchActiveTab === 'all' || searchActiveTab === 'products') && searchResults.products.length > 0 && (
                                                    <div className="py-2">
                                                        <div className="px-4 py-1.5 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
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
                                                        <div className="divide-y divide-slate-50">
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
                                                                            className="w-11 h-11 object-cover rounded-xl border border-slate-200 bg-slate-100 shrink-0"
                                                                            onError={(e) => { e.currentTarget.src = '/images/placeholder.png'; }}
                                                                        />
                                                                        <div className="min-w-0">
                                                                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 truncate">
                                                                                {p.name}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                                                {p.sku && (
                                                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                                                                                        SKU: {p.sku}
                                                                                    </span>
                                                                                )}
                                                                                {p.variantLabel && (
                                                                                    <span className="text-[11px] text-slate-500 font-medium truncate">
                                                                                        {p.variantLabel}
                                                                                    </span>
                                                                                )}
                                                                                {p.brand && (
                                                                                    <span className="text-[11px] text-slate-400">
                                                                                        • {p.brand}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right shrink-0 ml-3">
                                                                        <span className="text-sm font-bold text-slate-900">
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
                                                        <div className="px-4 py-1.5 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
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
                                                        <div className="divide-y divide-slate-50">
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
                                                                                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                                                                                    Order #{o.orderId}
                                                                                </p>
                                                                                {o.status && (
                                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${getOrderStatusBadgeClass(o.status)}`}>
                                                                                        {o.status}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                                                                <span className="font-medium text-slate-700">{o.customerName}</span>
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
                                                                        <span className="text-sm font-bold text-slate-900">
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
                                                        <div className="px-4 py-1.5 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
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
                                                        <div className="divide-y divide-slate-50">
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
                                                                                <p className="text-sm font-bold text-slate-900 group-hover:text-purple-700 truncate">
                                                                                    {c.name}
                                                                                </p>
                                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 capitalize">
                                                                                    {c.role || 'Customer'}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                                                {c.phone && (
                                                                                    <span className="flex items-center gap-1 text-slate-700 font-mono font-medium">
                                                                                        <Phone className="w-3 h-3 text-slate-400" />
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
                                                                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors shadow-xs"
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
                    </div>
                </div>

                {/* Right Side - Notifications + Profile */}
                <div className="flex items-center space-x-4">
                    {/* Realtime Visitors Badge */}
                    <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-xs font-semibold mr-1">Realtime:</span>
                        <RollingNumber value={liveVisitors} />
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notificationDropdownRef}>
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative cursor-pointer"
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                        >
                            <Bell className="h-6 w-6" />
                            {/* Notification Badge */}
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{unreadCount} New</span>
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
                                                        className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors relative ${order.isReadByAdmin ? 'hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-100'}`}
                                                    >
                                                        {!order.isReadByAdmin && (
                                                            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                                                        )}
                                                        <div className="flex items-start gap-3">
                                                            <div className={`p-2 rounded-full ${order.isReadByAdmin ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                                                <Package className="h-4 w-4" />
                                                            </div>
                                                            <div className="flex-1 pr-4">
                                                                <p className={`text-sm font-medium ${order.isReadByAdmin ? 'text-gray-600' : 'text-gray-800'}`}>New Order #{order.orderId}</p>
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
                                                )
                                            })}

                                            {hasMore && (
                                                <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                                                    <button
                                                        onClick={() => fetchNotifications(page + 1)}
                                                        disabled={loadingNotifications}
                                                        className="text-xs text-blue-600 font-medium hover:text-blue-800 disabled:opacity-50"
                                                    >
                                                        {loadingNotifications ? 'Loading...' : 'Load More'}
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                            No notifications found
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                        <button
                            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                </span>
                            </div>
                            <span className="hidden md:block text-sm font-medium text-gray-700">
                                {user?.name || 'Admin User'}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''
                                }`} />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                                <a
                                    href="#"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="h-4 w-4 mr-2" />
                                    Profile
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </a>
                                <hr className="my-1" />
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
            </div>

        </header>
    )
}