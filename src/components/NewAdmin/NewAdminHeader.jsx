'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Menu, LogOut, User, Settings, Package } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { getCookie } from 'cookies-next';
import { orderAPI } from '@/services/api';

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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

            {/* Search — takes remaining space, but capped */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 w-[280px] flex-shrink-0">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
                />
                <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono whitespace-nowrap">Ctrl+K</span>
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
