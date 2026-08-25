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

// ─── Fake Data ─────────────────────────────────────────────────────────────

const salesChartData = [
    { date: 'May 15', thisWeek: 42000, lastWeek: 30000 },
    { date: 'May 16', thisWeek: 35000, lastWeek: 28000 },
    { date: 'May 17', thisWeek: 48000, lastWeek: 38000 },
    { date: 'May 18', thisWeek: 68540, lastWeek: 50000 },
    { date: 'May 19', thisWeek: 55000, lastWeek: 42000 },
    { date: 'May 20', thisWeek: 62000, lastWeek: 48000 },
    { date: 'May 21', thisWeek: 70000, lastWeek: 55000 },
];

const categoryData = [
    { name: 'Ride On Cars', value: 128450, color: '#6366F1', pct: '37.5%' },
    { name: 'Scooters', value: 67890, color: '#EC4899', pct: '19.8%' },
    { name: 'Bicycles', value: 58640, color: '#F59E0B', pct: '17.1%' },
    { name: 'Toys & Games', value: 45230, color: '#10B981', pct: '13.2%' },
    { name: 'Others', value: 42240, color: '#3B82F6', pct: '12.4%' },
];

const recentOrders = [
    { id: 'KW1248', time: 'May 21, 2024 · 10:30 AM', status: 'Completed', amount: 8990, img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=48&q=80' },
    { id: 'KW1247', time: 'May 21, 2024 · 09:15 AM', status: 'Processing', amount: 2490, img: 'https://images.unsplash.com/photo-1520114002364-e4c1fcda0e05?w=48&q=80' },
    { id: 'KW1246', time: 'May 20, 2024 · 08:45 PM', status: 'Pending', amount: 1490, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=48&q=80' },
    { id: 'KW1245', time: 'May 20, 2024 · 07:30 PM', status: 'Completed', amount: 1090, img: 'https://images.unsplash.com/photo-1587654780228-6a454f9a0e69?w=48&q=80' },
    { id: 'KW1244', time: 'May 20, 2024 · 06:20 PM', status: 'Processing', amount: 6490, img: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=48&q=80' },
];

const topProducts = [
    { rank: 1, name: 'Kids Electric Ride On Car', sold: 320, revenue: 8890, img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=48&q=80' },
    { rank: 2, name: 'Kids Scooter', sold: 295, revenue: 2490, img: 'https://images.unsplash.com/photo-1520114002364-e4c1fcda0e05?w=48&q=80' },
    { rank: 3, name: 'Kids Bicycle 16 Inch', sold: 210, revenue: 6490, img: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=48&q=80' },
    { rank: 4, name: 'Kids Smart Watch', sold: 185, revenue: 1490, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=48&q=80' },
];

const lowStockItems = [
    { name: 'Kids Scooter (Pink)', stock: 5, img: 'https://images.unsplash.com/photo-1520114002364-e4c1fcda0e05?w=48&q=80' },
    { name: 'Kids Smart Watch (Blue)', stock: 7, img: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=48&q=80' },
    { name: 'Kids Bicycle 16 Inch', stock: 3, img: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=48&q=80' },
];

const quickActions = [
    { label: 'Add New Product', icon: Package, color: 'bg-blue-100 text-blue-600', href: '/admin/dashboard/products' },
    { label: 'Create Order', icon: ShoppingCart, color: 'bg-green-100 text-green-600', href: '/admin/dashboard/orders' },
    { label: 'Add Coupon', icon: Tag, color: 'bg-pink-100 text-pink-600', href: '/admin/dashboard/coupons' },
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
    const [dateLabel] = useState('May 15, 2024 – May 21, 2024');

    return (
        <div className="space-y-6 pb-8">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                        <span className="text-xl">👋</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">Welcome back, Nirob Rahman Hridoy</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm cursor-pointer hover:bg-gray-50 text-sm font-semibold text-gray-700">
                    📅 {dateLabel}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Sales" value="৳ 3,42,450" change="+18.5%" color="bg-blue-100 text-blue-600" icon={DollarSign} />
                <StatCard title="Total Orders" value="1,248" change="+22.5%" color="bg-green-100 text-green-600" icon={ShoppingCart} />
                <StatCard title="Total Customers" value="892" change="+15.3%" color="bg-orange-100 text-orange-500" icon={Users} />
                <StatCard title="Total Products" value="156" change="+8.2%" color="bg-purple-100 text-purple-600" icon={Package} />
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
                        {recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center gap-3">
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
                        {topProducts.map((p) => (
                            <div key={p.rank} className="flex items-center gap-3">
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
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-sm font-extrabold text-gray-800">৳3,42,450</span>
                                <span className="text-[10px] text-gray-400 font-medium">Total Sales</span>
                            </div>
                        </div>
                        <div className="mt-3 w-full space-y-1.5">
                            {categoryData.map((c) => (
                                <div key={c.name} className="flex items-center justify-between">
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
                        {lowStockItems.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <img src={item.img} alt={item.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                    <p className="text-xs text-red-500 font-bold mt-0.5">Stock: {item.stock}</p>
                                </div>
                                <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
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
                    {quickActions.map((action) => (
                        <Link
                            key={action.label}
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