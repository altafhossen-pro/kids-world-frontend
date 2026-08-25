'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, ShoppingCart, Package, LayoutGrid,
    Users, Star, Tag, Image, Mail, BarChart2,
    FileText, User, Settings, CreditCard, Truck,
    ChevronDown, Rocket, TrendingUp, X
} from 'lucide-react';

const menuSections = [
    {
        label: 'MANAGE',
        items: [
            { name: 'Orders', href: '/admin/dashboard/orders', icon: ShoppingCart, badge: 24 },
            { name: 'Products', href: '/admin/dashboard/products', icon: Package },
            { name: 'Categories', href: '/admin/dashboard/categories', icon: LayoutGrid },
            { name: 'Customers', href: '/admin/dashboard/customers', icon: Users },
            { name: 'Reviews', href: '/admin/dashboard/reviews', icon: Star },
        ]
    },
    {
        label: 'MARKETING',
        items: [
            { name: 'Coupons', href: '/admin/dashboard/coupons', icon: Tag },
            { name: 'Banners', href: '/admin/dashboard/banners', icon: Image },
            { name: 'Newsletters', href: '/admin/dashboard/newsletters', icon: Mail },
        ]
    },
    {
        label: 'SALES',
        items: [
            { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart2 },
            { name: 'Reports', href: '/admin/dashboard/reports', icon: FileText },
        ]
    },
    {
        label: 'SYSTEM',
        items: [
            { name: 'Users', href: '/admin/dashboard/users', icon: User },
            { name: 'Settings', href: '/admin/dashboard/settings', icon: Settings },
            { name: 'Payment Methods', href: '/admin/dashboard/payment-methods', icon: CreditCard },
            { name: 'Shipping Zones', href: '/admin/dashboard/shipping-zones', icon: Truck },
        ]
    }
];

export default function NewAdminSidebar({ onClose }) {
    const pathname = usePathname();
    const isDashboard = pathname === '/admin/dashboard';

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 select-none">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <img src="/images/logo.webp" alt="Kids World" className="h-8 w-auto" />
                </Link>
                {onClose && (
                    <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
                {/* Dashboard link */}
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isDashboard
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    Dashboard
                </Link>

                {menuSections.map((section) => (
                    <div key={section.label}>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                            {section.label}
                        </p>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                            {item.name}
                                        </div>
                                        {item.badge && (
                                            <span className="bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Promo banner */}
            <div className="m-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
                <Rocket className="w-6 h-6 mb-2 text-yellow-300" />
                <p className="text-xs font-bold mb-1">Grow Your Kids World</p>
                <p className="text-[10px] text-blue-100 mb-3">Explore new products and boost your sales!</p>
                <button className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-blue-50 transition-colors">
                    View Analytics <TrendingUp className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
