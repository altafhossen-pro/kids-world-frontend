'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function NewAdminHeader({ onMenuToggle }) {
    const { user, logout } = useAppContext();
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <header className="h-[64px] bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
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
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                </button>

                {/* Messages */}
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-white"></span>
                </button>

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
