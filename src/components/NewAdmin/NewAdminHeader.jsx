'use client';
import React, { useState } from 'react';
import { Search, Bell, MessageSquare, ChevronDown, Menu } from 'lucide-react';

export default function NewAdminHeader({ onMenuToggle }) {
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
                <div className="flex items-center gap-2.5 cursor-pointer group pl-1">
                    <img
                        src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=80&q=80"
                        alt="Admin"
                        className="w-9 h-9 rounded-xl object-cover border-2 border-gray-100 flex-shrink-0"
                    />
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-gray-800 leading-tight">Nirob Rahman</p>
                        <p className="text-xs text-gray-500 font-medium">Administrator</p>
                    </div>
                    <ChevronDown className="hidden md:block w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                </div>
            </div>
        </header>
    );
}
