'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingCart, Users, Package, DollarSign,
    TrendingUp, ArrowRight, RotateCcw, Plus,
    Tag, Image, BarChart2, Settings
} from 'lucide-react';
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { getCookie } from 'cookies-next';
import { dashboardAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useAppContext } from '@/context/AppContext';

// ─── Fake Data (Initial empty state) ─────────────────────────────────────────────────────────────

const initialSalesChartData = [];
const initialCategoryData = [];
const initialRecentOrders = [];
const initialTopProducts = [];
const initialLowStockItems = [];

const quickActions = [
    { label: 'Add New Product', icon: Package, color: 'bg-blue-100 text-blue-600', href: '/admin/dashboard/products' },
    { label: 'Create Order', icon: ShoppingCart, color: 'bg-green-100 text-green-600', href: '/admin/dashboard/orders' },
    { label: 'Add Coupon', icon: Tag, color: 'bg-blue-100 text-blue-600', href: '/admin/dashboard/coupons' },
    { label: 'Add Banner', icon: Image, color: 'bg-orange-100 text-orange-600', href: '/admin/dashboard/banners' },
    { label: 'View Reports', icon: BarChart2, color: 'bg-purple-100 text-purple-600', href: '/admin/dashboard/reports' },
    { label: 'Manage Users', icon: Users, color: 'bg-indigo-100 text-indigo-600', href: '/admin/dashboard/users' },
    { label: 'Settings', icon: Settings, color: 'bg-gray-100 text-gray-600', href: '/admin/dashboard/settings' },
];

// ─── Helper Components ──────────────────────────────────────────────────────

const statusBadge = (status) => {
    const map = {
        Completed: 'bg-green-100 text-green-700',
        Processing: 'bg-blue-100 text-blue-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const StatCard = ({ title, value, change, color, icon: Icon, mini }) => (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 ${mini ? 'p-4' : ''}`}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1 leading-tight">{value}</p>
            </div>
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
        {change && (
            <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-bold text-green-600">{change}</span>
                <span className="text-xs text-gray-400">vs last 7 days</span>
            </div>
        )}
        {/* Tiny sparkline placeholder */}
        <div className="h-8 w-full relative overflow-hidden rounded-lg opacity-60">
            <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={color.includes('blue') ? 'text-blue-400' : color.includes('green') ? 'text-green-400' : color.includes('orange') ? 'text-orange-400' : 'text-purple-400'}
                    points="0,25 15,18 30,22 45,10 60,15 75,8 90,12 100,5"
                />
            </svg>
        </div>
    </div>
);

// ─── Custom Pie Label ───────────────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
            {(percent * 100).toFixed(0)}%
        </text>
    );
};

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function NewAdminDashboard() {
    const { user } = useAppContext();
    const [dateLabel, setDateLabel] = useState('Last 7 Days');
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: { totalSales: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0, salesChange: '0%' },
        salesChartData: initialSalesChartData,
        categoryData: initialCategoryData,
        recentOrders: initialRecentOrders,
        topProducts: initialTopProducts,
        lowStockItems: initialLowStockItems
    });

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = getCookie('token');
                const response = await dashboardAPI.getSummary(token);
                if (response.success) {
                    setDashboardData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const { stats, salesChartData, categoryData, recentOrders, topProducts, lowStockItems } = dashboardData;

    return (
        <div className="space-y-6 pb-8">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                        <span className="text-xl">👋</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name || 'Admin'}</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-700">
                    📅 {dateLabel}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title={<>Total Sales <span className="text-[9px] normal-case tracking-normal block -mt-1 opacity-75">(w/o shipping charge)</span></>} value={`৳${stats.totalSales.toLocaleString()}`} change={stats.salesChange} color="bg-blue-100 text-blue-600" icon={DollarSign} />
                <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} change={null} color="bg-green-100 text-green-600" icon={ShoppingCart} />
                <StatCard title="Total Customers" value={stats.totalCustomers.toLocaleString()} change={null} color="bg-orange-100 text-orange-500" icon={Users} />
                <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} change={null} color="bg-purple-100 text-purple-600" icon={Package} />
            </div>

            {/* Middle row: Sales Overview + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Sales Overview Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-gray-900">Sales Overview</h2>
                        <div className="flex items-center gap-2 text-xs font-bold bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 cursor-pointer">
                            This Week <span className="text-gray-400">▼</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <span className="w-6 h-0.5 bg-blue-500 inline-block rounded-full"></span> This Week
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                            <span className="w-6 h-0.5 border-t-2 border-dashed border-gray-300 inline-block"></span> Last Week
                        </div>
                    </div>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="thisWeekGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="lastWeekGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}K`} />
                                <Tooltip
                                    formatter={(value) => [`৳${value.toLocaleString()}`, '']}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: 12, fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="lastWeek" stroke="#D1D5DB" strokeDasharray="4 4" fill="url(#lastWeekGrad)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="thisWeek" stroke="#6366F1" fill="url(#thisWeekGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#6366F1' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-gray-900">Recent Orders</h2>
                        <Link href="/admin/dashboard/orders" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentOrders.map((order, idx) => (
                            <div key={order.id || `order-${idx}`} className="flex items-center gap-3">
                                <img src={order.img} alt={order.id} className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800">Order #{order.id}</p>
                                    <p className="text-[10px] text-gray-400 font-medium truncate">{order.time}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    {statusBadge(order.status)}
                                    <span className="text-xs font-bold text-gray-700">৳ {order.amount.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/dashboard/orders" className="mt-4 flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                        View All Orders <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>

            {/* Bottom row: Top Products + Sales by Category + Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-gray-900">Top Selling Products</h2>
                        <Link href="/admin/dashboard/products" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {topProducts.map((p, idx) => (
                            <div key={p.rank || `top-${idx}`} className="flex items-center gap-3">
                                <span className="text-xs font-black text-gray-300 w-4 text-center">{p.rank}</span>
                                <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                                            style={{ width: `${(p.sold / 320) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Sold {p.sold}</p>
                                </div>
                                <span className="text-sm font-black text-gray-800">৳{p.revenue.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales by Category (Donut) */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-gray-900">Sales by Category</h2>
                        <Link href="/admin/dashboard/reports" className="text-xs font-bold text-blue-600 hover:underline">View Report</Link>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="relative h-44 w-44">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={80}
                                        dataKey="value"
                                        paddingAngle={2}
                                        labelLine={false}
                                        label={renderCustomLabel}
                                    >
                                        {categoryData.map((entry, i) => (
                                            <Cell key={`cell-${entry.name || i}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-extrabold text-gray-800">Top 5</span>
                                <span className="text-[10px] text-gray-400 font-medium">Categories</span>
                            </div>
                        </div>
                        <div className="mt-3 w-full space-y-1.5">
                            {categoryData.map((c, i) => (
                                <div key={c.name || `cat-${i}`} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                        <span className="text-xs text-gray-600 font-medium">{c.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-gray-700">৳{c.value.toLocaleString()} · {c.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-extrabold text-gray-900">Low Stock Alert</h2>
                        <Link href="/admin/dashboard/inventory" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {lowStockItems.map((item, idx) => (
                            <div key={item.id || item.name || `low-${idx}`} className="flex items-center gap-3">
                                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                    <p className="text-xs text-red-500 font-bold mt-0.5">Stock: {item.stock}</p>
                                </div>
                                <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
                                    <RotateCcw className="w-3 h-3" /> Restock
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-base font-extrabold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    {quickActions.map((action, idx) => (
                        <Link
                            key={action.label || `action-${idx}`}
                            href={action.href}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] text-gray-600 font-semibold text-center leading-tight max-w-[64px]">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}