'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Layers, 
    ArrowUp, 
    ArrowDown, 
    Save, 
    Plus, 
    Trash2, 
    Search, 
    ExternalLink, 
    Eye, 
    EyeOff, 
    CheckCircle2, 
    AlertCircle, 
    Sparkles, 
    Package, 
    RefreshCw,
    GripVertical,
    Home
} from 'lucide-react';
import { categoryAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import Link from 'next/link';

export default function HomepageCategorySectionsPage() {
    const [allCategories, setAllCategories] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchAvailable, setSearchAvailable] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getCategories({ limit: 1000 });
            if (res.success && Array.isArray(res.data)) {
                setAllCategories(res.data);
                
                // Filter active sections and sort by homepageSectionOrder
                const activeSections = res.data
                    .filter(c => c.showHomepageAsSection)
                    .sort((a, b) => {
                        const orderA = typeof a.homepageSectionOrder === 'number' ? a.homepageSectionOrder : 999;
                        const orderB = typeof b.homepageSectionOrder === 'number' ? b.homepageSectionOrder : 999;
                        if (orderA !== orderB) return orderA - orderB;
                        return (a.sortOrder || 0) - (b.sortOrder || 0);
                    })
                    .map((item, index) => ({
                        ...item,
                        homepageSectionOrder: index
                    }));

                setSectionList(activeSections);
                setIsDirty(false);
            } else {
                toast.error(res.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    // Move section up
    const handleMoveUp = (index) => {
        if (index === 0) return;
        const updated = [...sectionList];
        const temp = updated[index - 1];
        updated[index - 1] = updated[index];
        updated[index] = temp;

        // Reassign indices
        const reindexed = updated.map((item, idx) => ({
            ...item,
            homepageSectionOrder: idx
        }));
        setSectionList(reindexed);
        setIsDirty(true);
    };

    // Move section down
    const handleMoveDown = (index) => {
        if (index === sectionList.length - 1) return;
        const updated = [...sectionList];
        const temp = updated[index + 1];
        updated[index + 1] = updated[index];
        updated[index] = temp;

        // Reassign indices
        const reindexed = updated.map((item, idx) => ({
            ...item,
            homepageSectionOrder: idx
        }));
        setSectionList(reindexed);
        setIsDirty(true);
    };

    // Add category to homepage sections
    const handleAddCategory = (category) => {
        if (sectionList.some(s => s._id === category._id)) {
            toast.error('Category is already added to sections');
            return;
        }

        const newSection = {
            ...category,
            showHomepageAsSection: true,
            homepageSectionOrder: sectionList.length
        };

        setSectionList([...sectionList, newSection]);
        setIsDirty(true);
        toast.success(`"${category.name}" added to homepage sections!`);
    };

    // Remove category from homepage sections
    const handleRemoveSection = (categoryId) => {
        const cat = sectionList.find(s => s._id === categoryId);
        const updated = sectionList
            .filter(s => s._id !== categoryId)
            .map((item, idx) => ({
                ...item,
                homepageSectionOrder: idx
            }));

        setSectionList(updated);
        setIsDirty(true);
        toast.success(`"${cat?.name || 'Category'}" removed from homepage sections.`);
    };

    // Save ordering & status to backend
    const handleSaveOrder = async () => {
        try {
            setSaving(true);
            const token = getCookie('token');

            // Payload: all sections in current order
            const payloadItems = sectionList.map((item, index) => ({
                id: item._id,
                homepageSectionOrder: index,
                showHomepageAsSection: true
            }));

            // Include any categories that were removed from sectionList
            const removedCategories = allCategories
                .filter(c => c.showHomepageAsSection && !sectionList.some(s => s._id === c._id))
                .map(c => ({
                    id: c._id,
                    showHomepageAsSection: false
                }));

            const finalPayload = [...payloadItems, ...removedCategories];

            const res = await categoryAPI.reorderHomepageSections(finalPayload, token);
            if (res.success) {
                toast.success('Homepage category section order saved successfully!');
                setIsDirty(false);
                fetchCategories();
            } else {
                toast.error(res.message || 'Failed to save section ordering');
            }
        } catch (error) {
            console.error('Error saving homepage section order:', error);
            toast.error('Failed to save ordering');
        } finally {
            setSaving(false);
        }
    };

    // Available categories not yet in homepage sections
    const availableCategories = useMemo(() => {
        const activeIds = new Set(sectionList.map(s => s._id));
        return allCategories
            .filter(c => !activeIds.has(c._id))
            .filter(c => {
                if (!searchAvailable.trim()) return true;
                const query = searchAvailable.toLowerCase();
                return (
                    c.name?.toLowerCase().includes(query) ||
                    c.slug?.toLowerCase().includes(query)
                );
            });
    }, [allCategories, sectionList, searchAvailable]);

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                    <div className="space-y-2 animate-pulse">
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                        <div className="h-4 w-96 bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-gray-200">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                                Homepage Category Sections
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Reorder dynamic category sections appearing on your homepage (which one appears above or below)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchCategories}
                        disabled={loading || saving}
                        title="Reload"
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition border border-gray-200"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>

                    <Link
                        href="/"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-sm"
                    >
                        <Home className="w-4 h-4 text-gray-500" />
                        <span>View Live Homepage</span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                    </Link>

                    <button
                        onClick={handleSaveOrder}
                        disabled={saving || !isDirty}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-sm transition-all duration-200 ${
                            isDirty 
                                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md cursor-pointer animate-pulse' 
                                : 'bg-gray-400 cursor-not-allowed opacity-70'
                        }`}
                    >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}</span>
                    </button>
                </div>
            </div>

            {/* Unsaved Changes Banner */}
            {isDirty && (
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm text-amber-800 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">You have unsaved order changes</p>
                            <p className="text-xs text-amber-700">Click &ldquo;Save Changes&rdquo; above to update the order on the live homepage.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveOrder}
                        disabled={saving}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition cursor-pointer"
                    >
                        {saving ? 'Saving...' : 'Save Now'}
                    </button>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                        {sectionList.length}
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider font-semibold text-gray-500">Active Sections</div>
                        <div className="text-lg font-bold text-gray-900">Live on Homepage</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0">
                        {availableCategories.length}
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider font-semibold text-gray-500">Available Categories</div>
                        <div className="text-lg font-bold text-gray-900">Can be added as section</div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider font-semibold text-gray-500">Ordering System</div>
                        <div className="text-sm font-semibold text-emerald-700">Top-to-Bottom Flow</div>
                    </div>
                </div>
            </div>

            {/* Main Ordering Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4.5 border-b border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Homepage Category Sections Order
                        </h2>
                        <p className="text-xs text-gray-500">
                            The section at Position #1 will appear first on the homepage, followed by #2, #3, and so on.
                        </p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 self-start sm:self-auto">
                        {sectionList.length} Sections Active
                    </span>
                </div>

                {sectionList.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Layers className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No homepage sections active</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                            You have not selected any category to appear as a dynamic product section on the homepage. Pick from the available categories below.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sectionList.map((category, index) => {
                            const isFirst = index === 0;
                            const isLast = index === sectionList.length - 1;

                            return (
                                <div 
                                    key={category._id}
                                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors group"
                                >
                                    {/* Left: Reorder Controls + Position Badge + Image + Name */}
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        {/* Move Buttons */}
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                disabled={isFirst}
                                                title={isFirst ? 'Already at the top' : 'Move Up'}
                                                className={`p-1.5 rounded-lg border transition ${
                                                    isFirst 
                                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                                                        : 'border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer shadow-sm'
                                                }`}
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                disabled={isLast}
                                                title={isLast ? 'Already at the bottom' : 'Move Down'}
                                                className={`p-1.5 rounded-lg border transition ${
                                                    isLast 
                                                        ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                                                        : 'border-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer shadow-sm'
                                                }`}
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Position Badge */}
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-800 font-black text-sm flex items-center justify-center shrink-0 border border-gray-200 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">
                                            #{index + 1}
                                        </div>

                                        {/* Image */}
                                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                            {category.image ? (
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-900 text-base truncate">
                                                    {category.name}
                                                </h3>
                                                <span className="text-xs font-mono text-gray-400 hidden md:inline truncate">
                                                    /{category.slug}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Package className="w-3.5 h-3.5 text-gray-400" />
                                                    {category.productCount || 0} products
                                                </span>
                                                {category.parent && (
                                                    <span className="text-gray-400">
                                                        Sub of: <span className="font-medium text-gray-600">{category.parent.name || 'Parent'}</span>
                                                    </span>
                                                )}
                                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Shown on Homepage
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <Link
                                            href={`/shop?category=${category.slug || category._id}`}
                                            target="_blank"
                                            title="View in Shop"
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={() => handleRemoveSection(category._id)}
                                            title="Remove from Homepage Sections"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition border border-rose-200/60 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Remove</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add More Categories Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span>Add Category to Homepage Sections</span>
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Select from the available categories below to turn on dynamic homepage section display.
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchAvailable}
                            onChange={(e) => setSearchAvailable(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                </div>

                {availableCategories.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500 font-medium">
                            {searchAvailable ? 'No matching available categories found' : 'All categories are currently active on the homepage sections!'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                        {availableCategories.map(cat => (
                            <div 
                                key={cat._id}
                                className="p-3 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl flex items-center justify-between gap-3 transition hover:shadow-sm group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 shrink-0">
                                        {cat.image ? (
                                            <img 
                                                src={cat.image} 
                                                alt={cat.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-gray-900 truncate">
                                            {cat.name}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {cat.productCount || 0} products
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAddCategory(cat)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg transition shrink-0 cursor-pointer shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
