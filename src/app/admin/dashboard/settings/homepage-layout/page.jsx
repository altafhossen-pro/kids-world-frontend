'use client'

import { useState, useEffect } from 'react'
import { getCookie } from 'cookies-next'
import { toast } from 'react-hot-toast'
import SectionSettingsCard from './SectionSettingsCard'
import { categoryAPI } from '@/services/api'

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
        },
        dynamicCategories: []
    })
    const [availableCategories, setAvailableCategories] = useState([])

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
            // Fetch Categories that should be shown as section
            const catRes = await categoryAPI.getCategories()
            if (catRes.success) {
                const sectionCategories = catRes.data.filter(c => c.showHomepageAsSection)
                setAvailableCategories(sectionCategories)

                // Initialize dynamic categories in settings if they don't exist
                if (data.success) {
                    const existingDynamics = data.data.dynamicCategories || []
                    const mergedDynamics = sectionCategories.map(cat => {
                        const existing = existingDynamics.find(d => d.categoryId === cat._id)
                        return existing || {
                            categoryId: cat._id,
                            isVisible: true,
                            displayType: 'grid',
                            sortOrder: 'latest',
                            maxProducts: 10,
                            hasPagination: false,
                            productsPerPage: 10,
                            maxPages: 3
                        }
                    })

                    setSettings({
                        trending: data.data.trending || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                        bestSellers: data.data.bestSellers || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                        newArrivals: data.data.newArrivals || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                        justForYou: data.data.justForYou || { isVisible: true, sortOrder: 'latest', maxProducts: 50 },
                        dynamicCategories: mergedDynamics
                    })
                }
            } else if (data.success) {
                setSettings({
                    trending: data.data.trending || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                    bestSellers: data.data.bestSellers || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                    newArrivals: data.data.newArrivals || { isVisible: true, sortOrder: 'latest', displayType: 'grid', maxProducts: 10, hasPagination: false, productsPerPage: 10, maxPages: 3 },
                    justForYou: data.data.justForYou || { isVisible: true, sortOrder: 'latest', maxProducts: 50 },
                    dynamicCategories: data.data.dynamicCategories || []
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
                <SectionSettingsCard
                    title="Trending Now Section"
                    sectionKey="trending"
                    settings={settings}
                    setSettings={setSettings}
                />

                <SectionSettingsCard
                    title="Best Sellers Section"
                    sectionKey="bestSellers"
                    settings={settings}
                    setSettings={setSettings}
                />

                <SectionSettingsCard
                    title="New Arrivals Section"
                    sectionKey="newArrivals"
                    settings={settings}
                    setSettings={setSettings}
                />

                {availableCategories.map(cat => (
                    <SectionSettingsCard
                        key={cat._id}
                        title={`${cat.name} (Dynamic)`}
                        sectionKey={cat._id}
                        isDynamic={true}
                        settings={settings}
                        setSettings={setSettings}
                    />
                ))}

                {/* Just For You Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Just For You (Infinite Scroll)</h2>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Products to Load</label>
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
