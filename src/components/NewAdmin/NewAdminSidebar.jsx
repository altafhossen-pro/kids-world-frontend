'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { settingsAPI } from '@/services/api';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Store,
    Tag,
    Truck,
    Heart,
    MessageSquare,
    Star,
    Image,
    Grid3X3,
    Megaphone,
    Ticket,
    PlusCircle,
    Link2,
    ChevronDown,
    ChevronRight,
    Home,
    Gift,
    FileText,
    CreditCard,
    Shield,
    Palette,
    TrendingUp,
    Database,
    Bell,
    KeyRound,
    Printer,
    Presentation,
    Rocket,
    X,
    Clock
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
        type: 'single'
    },
    {
        name: 'Products',
        icon: Package,
        type: 'group',
        children: [
            { name: 'All Products', href: '/admin/dashboard/products', icon: Package },
            { name: 'Create Product', href: '/admin/dashboard/products/create', icon: PlusCircle },
        ]
    },
    {
        name: 'Orders',
        icon: ShoppingCart,
        type: 'group',
        children: [
            { name: 'All Orders', href: '/admin/dashboard/orders', icon: ShoppingCart },
            { name: 'Manual Orders', href: '/admin/dashboard/manual-orders', icon: PlusCircle },
        ]
    },
    {
        name: 'Categories',
        icon: Tag,
        type: 'group',
        children: [
            { name: 'All Categories', href: '/admin/dashboard/categories', icon: Tag },
            { name: 'Add Category', href: '/admin/dashboard/categories/create', icon: PlusCircle },
        ]
    },
    {
        name: 'Users',
        icon: Users,
        type: 'group',
        children: [
            { name: 'All Customers', href: '/admin/dashboard/customers', icon: Users },
            { name: 'All Staff', href: '/admin/dashboard/staff', icon: Shield },
        ]
    },
    {
        name: 'Homepage',
        icon: Home,
        type: 'group',
        children: [
            { name: 'Deal of the Day', href: '/admin/dashboard/deal-of-the-day', icon: Clock },
            { name: 'Hero Banners', href: '/admin/dashboard/hero-banner', icon: Image },
            { name: 'Testimonials', href: '/admin/dashboard/testimonials', icon: Star },
            { name: 'Top Brands', href: '/admin/dashboard/top-brands', icon: Star },
        ]
    },
    {
        name: 'Offers',
        icon: Gift,
        type: 'group',
        children: [
            { name: 'Coupons', href: '/admin/dashboard/coupons', icon: Ticket },
            { name: 'Category Discount', href: '/admin/dashboard/category-discount', icon: Tag },
        ]
    },
    {
        name: 'Inventory',
        icon: Database,
        type: 'group',
        children: [
            { name: 'List Purchase', href: '/admin/dashboard/inventory', icon: ShoppingCart },
            { name: 'Stock Adjustment', href: '/admin/dashboard/inventory/stock-adjustment', icon: TrendingUp },
        ]
    },
    {
        name: 'Contact MSG',
        href: '/admin/dashboard/contact-messages',
        icon: MessageSquare,
        type: 'single'
    },
    {
        name: 'Settings',
        icon: Settings,
        type: 'group',
        children: [
            { name: 'General Settings', href: '/admin/dashboard/settings', icon: Settings },
            { name: 'Role Based Access Control', href: '/admin/dashboard/settings/roles', icon: KeyRound },
            { name: 'Label Print', href: '/admin/dashboard/settings/label-print', icon: Printer },
        ]
    },
];

export default function NewAdminSidebar({ onClose }) {
    const pathname = usePathname();

    const isChildActive = (child) => {
        if (child.href === '/admin/dashboard/products') {
            return pathname === '/admin/dashboard/products' || pathname === '/admin/dashboard/products/';
        }
        if (child.href === '/admin/dashboard/products/create') {
            return pathname === '/admin/dashboard/products/create';
        }
        if (child.href === '/admin/dashboard/orders') {
            return pathname === '/admin/dashboard/orders' || pathname === '/admin/dashboard/orders/';
        }
        if (child.href === '/admin/dashboard/customers') {
            return pathname === '/admin/dashboard/customers' || pathname === '/admin/dashboard/customers/';
        }
        if (child.href === '/admin/dashboard/staff') {
            return pathname === '/admin/dashboard/staff' || pathname === '/admin/dashboard/staff/';
        }
        if (child.href === '/admin/dashboard/categories') {
            return pathname === '/admin/dashboard/categories' || pathname === '/admin/dashboard/categories/';
        }
        if (child.href === '/admin/dashboard/settings') {
            return pathname === '/admin/dashboard/settings' || pathname.startsWith('/admin/dashboard/settings/');
        }
        if (child.href === '/admin/dashboard/settings/roles') {
            return pathname === '/admin/dashboard/settings/roles' || pathname.startsWith('/admin/dashboard/settings/roles/');
        }
        if (child.href === '/admin/dashboard/settings/label-print') {
            return pathname === '/admin/dashboard/settings/label-print' || pathname.startsWith('/admin/dashboard/settings/label-print/');
        }
        if (child.href === '/admin/dashboard/own-ads') {
            return pathname === '/admin/dashboard/own-ads' || pathname.startsWith('/admin/dashboard/own-ads/');
        }
        if (child.href === '/admin/dashboard/inventory') {
            return pathname === '/admin/dashboard/inventory' || pathname === '/admin/dashboard/inventory/';
        }
        if (child.href === '/admin/dashboard/inventory/stock-adjustment') {
            return pathname === '/admin/dashboard/inventory/stock-adjustment' || pathname.startsWith('/admin/dashboard/inventory/stock-adjustment/');
        }
        if (child.href === '/admin/dashboard/top-brands') {
            return pathname === '/admin/dashboard/top-brands' || pathname.startsWith('/admin/dashboard/top-brands/');
        }
        return pathname === child.href || pathname.startsWith(child.href + '/');
    };

    const [expandedItems, setExpandedItems] = useState({});
    const [logoUrl, setLogoUrl] = useState('/images/logo.webp');

    useEffect(() => {
        settingsAPI.getSiteSettings().then(res => {
            if (res?.data?.logoUrl) {
                setLogoUrl(res.data.logoUrl);
            }
        }).catch(err => console.error("Failed to load logo", err));
    }, []);

    useEffect(() => {
        const initialExpanded = {};
        navigation.forEach(item => {
            if (item.type === 'group' && item.children) {
                const hasActiveChild = item.children.some(child => isChildActive(child));
                if (hasActiveChild) {
                    initialExpanded[item.name] = true;
                }
            }
        });
        setExpandedItems(initialExpanded);
    }, [pathname]);

    const toggleExpanded = (itemName) => {
        setExpandedItems(prev => {
            if (prev[itemName]) {
                return { ...prev, [itemName]: false };
            } else {
                const newExpanded = {};
                newExpanded[itemName] = true;
                return newExpanded;
            }
        });
    };

    const isItemActive = (item) => {
        if (item.type === 'single') {
            return pathname === item.href;
        } else if (item.type === 'group') {
            return item.children?.some(child => isChildActive(child));
        }
        return false;
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 select-none">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <Link href="/admin/dashboard" className="flex items-center gap-3">
                    <img src={logoUrl} alt="Kids World" className="h-8 w-auto object-contain" />
                    <span className="text-base font-bold text-blue-600 tracking-tight">KIDS<span className="text-blue-600 ms-1">WORLD</span></span>
                </Link>
                {onClose && (
                    <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {navigation.map((item) => {
                    const isActive = isItemActive(item);
                    const isExpanded = expandedItems[item.name];

                    if (item.type === 'single') {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => {
                                    if (Object.keys(expandedItems).length > 0) setExpandedItems({});
                                    onClose?.();
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.name}
                            </Link>
                        );
                    } else if (item.type === 'group') {
                        return (
                            <div key={item.name} className="space-y-1">
                                <button
                                    onClick={() => toggleExpanded(item.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${isActive && !isExpanded
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-4 h-4 flex-shrink-0 ${(isActive && !isExpanded) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        {item.name}
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>

                                {isExpanded && (
                                    <div className="ml-7 pl-3 border-l-2 border-gray-100 space-y-1 my-1">
                                        {item.children?.map((child) => {
                                            const childIsActive = isChildActive(child);
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => onClose?.()}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group ${childIsActive
                                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                                        }`}
                                                >
                                                    <child.icon className={`w-3.5 h-3.5 flex-shrink-0 ${childIsActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    {child.name}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }
                })}
            </nav>

            {/* Promo banner */}
            <div className="m-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 text-white relative overflow-hidden flex-shrink-0">
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
