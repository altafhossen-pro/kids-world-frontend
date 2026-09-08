'use client'

import { useState, useEffect } from 'react'
import { getCookie } from 'cookies-next'
import { toast } from 'react-hot-toast'

export default function HomepageLayoutSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        trending: {
            isVisible: true,
            sortOrder: 'latest',
            displayType: 'grid',
            maxProducts: 10
        },
        bestSellers: {
            isVisible: true,
            sortOrder: 'latest',
            displayType: 'grid',
            maxProducts: 10
        },
        newArrivals: {
            isVisible: true,
            sortOrder: 'latest',
            displayType: 'grid',
            maxProducts: 10
        },
        justForYou: {
            isVisible: true,
            sortOrder: 'latest',
            maxProducts: 50
        }
    })

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            // Re-using the getHomepageLayout API
            // Wait, getHomepageLayout was added to settingsAPI in the backend, but in api.js it's notificationAPI?
            // Actually, I added getHomepageLayout to `notificationAPI` by mistake. Let me fix it in api.js.
            // I'll import productAPI/notificationAPI whatever it is in a bit. Let's assume it's in notificationAPI for now, but I'll fix it to settingsAPI later.
            
            // Wait, let's just use fetch manually to ensure no import issue for now, or use the one I added.
            const token = getCookie('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/homepage-layout`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setSettings({
                    trending: data.data.trending || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10 },
                    bestSellers: data.data.bestSellers || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10 },
                    newArrivals: data.data.newArrivals || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10 },
                    justForYou: data.data.justForYou || { isVisible: true, sortOrder: 'latest', maxProducts: 50 }
                })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error('Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const token = getCookie('token')
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/homepage-layout`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            })
            const data = await res.json()
            
            if (data.success) {
                toast.success('Homepage layout updated successfully')
            } else {
                toast.error(data.message || 'Failed to update settings')
            }
        } catch (error) {
            console.error('Error updating settings:', error)
            toast.error('Failed to update settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Homepage Layout Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Configure how the sections appear on your homepage
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trending Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Trending Now Section</h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.trending.isVisible}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    trending: { ...settings.trending, isVisible: e.target.checked }
                                })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {settings.trending.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                        </label>
                    </div>
                    
                    <div className={`p-6 space-y-6 ${!settings.trending.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Style</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.trending.displayType === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="trending_display" 
                                        value="grid" 
                                        checked={settings.trending.displayType === 'grid'}
                                        onChange={(e) => setSettings({...settings, trending: {...settings.trending, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex flex-wrap gap-1 justify-center items-center">
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                    </div>
                                    <span className="text-sm font-medium">Grid</span>
                                </label>
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.trending.displayType === 'slider' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="trending_display" 
                                        value="slider" 
                                        checked={settings.trending.displayType === 'slider'}
                                        onChange={(e) => setSettings({...settings, trending: {...settings.trending, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex gap-1 justify-center items-center overflow-hidden">
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                    </div>
                                    <span className="text-sm font-medium">Slider (Carousel)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Sort Order</label>
                            <select
                                value={settings.trending.sortOrder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    trending: { ...settings.trending, sortOrder: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="latest">Latest First</option>
                                <option value="random">Randomize</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Load</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={settings.trending.maxProducts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    trending: { ...settings.trending, maxProducts: parseInt(e.target.value) || 10 }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Best Sellers Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Best Sellers Section</h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.bestSellers.isVisible}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    bestSellers: { ...settings.bestSellers, isVisible: e.target.checked }
                                })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {settings.bestSellers.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                        </label>
                    </div>
                    
                    <div className={`p-6 space-y-6 ${!settings.bestSellers.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Style</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.bestSellers.displayType === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="bestseller_display" 
                                        value="grid" 
                                        checked={settings.bestSellers.displayType === 'grid'}
                                        onChange={(e) => setSettings({...settings, bestSellers: {...settings.bestSellers, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex flex-wrap gap-1 justify-center items-center">
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                    </div>
                                    <span className="text-sm font-medium">Grid</span>
                                </label>
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.bestSellers.displayType === 'slider' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="bestseller_display" 
                                        value="slider" 
                                        checked={settings.bestSellers.displayType === 'slider'}
                                        onChange={(e) => setSettings({...settings, bestSellers: {...settings.bestSellers, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex gap-1 justify-center items-center overflow-hidden">
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                    </div>
                                    <span className="text-sm font-medium">Slider (Carousel)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Sort Order</label>
                            <select
                                value={settings.bestSellers.sortOrder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    bestSellers: { ...settings.bestSellers, sortOrder: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="latest">Latest First</option>
                                <option value="random">Randomize</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Load</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={settings.bestSellers.maxProducts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    bestSellers: { ...settings.bestSellers, maxProducts: parseInt(e.target.value) || 10 }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* New Arrivals Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2 max-w-2xl mx-auto w-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">New Arrivals Section</h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.newArrivals.isVisible}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    newArrivals: { ...settings.newArrivals, isVisible: e.target.checked }
                                })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {settings.newArrivals.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                        </label>
                    </div>
                    
                    <div className={`p-6 space-y-6 ${!settings.newArrivals.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Style</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.newArrivals.displayType === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="newarrival_display" 
                                        value="grid" 
                                        checked={settings.newArrivals.displayType === 'grid'}
                                        onChange={(e) => setSettings({...settings, newArrivals: {...settings.newArrivals, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex flex-wrap gap-1 justify-center items-center">
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                                    </div>
                                    <span className="text-sm font-medium">Grid</span>
                                </label>
                                <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${settings.newArrivals.displayType === 'slider' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="newarrival_display" 
                                        value="slider" 
                                        checked={settings.newArrivals.displayType === 'slider'}
                                        onChange={(e) => setSettings({...settings, newArrivals: {...settings.newArrivals, displayType: e.target.value}})}
                                        className="sr-only" 
                                    />
                                    <div className="w-16 h-12 flex gap-1 justify-center items-center overflow-hidden">
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                        <div className="w-8 h-4 bg-blue-200 rounded shrink-0"></div>
                                    </div>
                                    <span className="text-sm font-medium">Slider (Carousel)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Sort Order</label>
                            <select
                                value={settings.newArrivals.sortOrder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    newArrivals: { ...settings.newArrivals, sortOrder: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="latest">Latest First</option>
                                <option value="random">Randomize</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Load</label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={settings.newArrivals.maxProducts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    newArrivals: { ...settings.newArrivals, maxProducts: parseInt(e.target.value) || 10 }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Just For You Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:col-span-2 max-w-2xl mx-auto w-full">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Just For You Section</h2>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.justForYou.isVisible}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    justForYou: { ...settings.justForYou, isVisible: e.target.checked }
                                })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                {settings.justForYou.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                        </label>
                    </div>
                    
                    <div className={`p-6 space-y-6 ${!settings.justForYou.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Sort Order</label>
                            <select
                                value={settings.justForYou.sortOrder}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    justForYou: { ...settings.justForYou, sortOrder: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="latest">Latest First</option>
                                <option value="random">Randomize</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Products to Load (Infinite Scroll)</label>
                            <input
                                type="number"
                                min="10"
                                max="200"
                                value={settings.justForYou.maxProducts}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    justForYou: { ...settings.justForYou, maxProducts: parseInt(e.target.value) || 50 }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
