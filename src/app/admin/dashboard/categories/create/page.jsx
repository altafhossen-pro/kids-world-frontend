'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Info, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/Common/ImageUpload'
import toast from 'react-hot-toast'
import { categoryAPI } from '@/services/api'
import { useAppContext } from '@/context/AppContext'
import PermissionDenied from '@/components/Common/PermissionDenied'

export default function CreateCategoryPage() {
    const router = useRouter()
    const { hasPermission, contextLoading } = useAppContext()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image: '',
        parent: '',
        showHomepageCategory: false,
        showHomepageAsSection: false,
        bgClass: '',
        banner: {
            url: '',
            isActive: false
        }
    })
    const [checkingPermission, setCheckingPermission] = useState(true)
    const [hasCreatePermission, setHasCreatePermission] = useState(false)
    const [permissionError, setPermissionError] = useState(null)

    useEffect(() => {
        if (contextLoading) return
        const canCreate = hasPermission('category', 'create')
        setHasCreatePermission(canCreate)
        setCheckingPermission(false)
        if (canCreate) {
            fetchCategories()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextLoading])

    const fetchCategories = async () => {
        try {
            const data = await categoryAPI.getCategories()
            if (data.success) {
                setCategories(data.data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const generateSlugString = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target

        if (name === 'banner.isActive') {
            setFormData(prev => ({
                ...prev,
                banner: {
                    ...prev.banner,
                    isActive: checked
                }
            }))
            return
        }

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }

            // Auto-update slug if name changes and slug was generated from name or empty
            if (name === 'name' && (!prev.slug || prev.slug === generateSlugString(prev.name))) {
                newData.slug = generateSlugString(value)
            }

            return newData
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.slug) {
            toast.error('Name and Slug are required')
            return
        }

        setLoading(true)

        try {
            const data = await categoryAPI.createCategory(formData)

            if (data.success) {
                toast.success('Category created successfully!')
                router.push('/admin/dashboard/categories')
            } else {
                if (data.status === 403) {
                    setPermissionError(data.message || "You don't have permission to create categories")
                } else {
                    toast.error('Failed to create category: ' + data.message)
                }
            }
        } catch (error) {
            console.error('Error creating category:', error)
            if (error?.status === 403) {
                setPermissionError(error?.data?.message || "You don't have permission to create categories")
            } else {
                toast.error('Error creating category')
            }
        } finally {
            setLoading(false)
        }
    }

    if (checkingPermission || contextLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!hasCreatePermission || permissionError) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError || "You don't have permission to create categories"}
                action="Contact your administrator for access"
                showBackButton={true}
            />
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/dashboard/categories"
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
                        <p className="text-sm text-gray-500 mt-1">Add a new product category to your store</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                                placeholder="e.g. Action Figures"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                URL Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                                placeholder="e.g. action-figures"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Auto-generates from name. Must be unique.</p>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Parent Category
                            </label>
                            <select
                                name="parent"
                                value={formData.parent}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                            >
                                <option value="">None (Top Level Category)</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Media & Images */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        Media & Layout
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Category Thumbnail
                            </label>
                            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                                <ImageUpload
                                    onImageUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                    onImageRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                                    currentImage={formData.image}
                                    label=""
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Homepage Settings */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="showHomepageCategory"
                                        checked={formData.showHomepageCategory}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Show Homepage Category</span>
                                        <span className="block text-xs text-gray-500">Show this category in the Shop by Category section</span>
                                    </div>
                                </label>

                                {formData.showHomepageCategory && (
                                    <div className="mt-2 space-y-2 pl-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Card Background Gradient
                                        </label>
                                        <select
                                            name="bgClass"
                                            value={formData.bgClass || 'bg-gradient-to-b from-blue-50 to-cyan-100'}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors text-sm"
                                        >
                                            <option value="bg-gradient-to-b from-blue-50 to-cyan-100">Light Blue to Cyan (Default)</option>
                                            <option value="bg-gradient-to-b from-blue-50 to-purple-100">Light Pink to Purple</option>
                                            <option value="bg-gradient-to-b from-green-50 to-emerald-100">Light Green to Emerald</option>
                                            <option value="bg-gradient-to-b from-orange-50 to-rose-100">Light Orange to Rose</option>
                                        </select>
                                    </div>
                                )}

                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="showHomepageAsSection"
                                        checked={formData.showHomepageAsSection}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Show Homepage As Section</span>
                                        <span className="block text-xs text-gray-500">Create a dedicated product section on the homepage for this category</span>
                                    </div>
                                </label>
                            </div>

                            {/* Banner Settings */}
                            <div>
                                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="banner.isActive"
                                        checked={formData.banner?.isActive || false}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-gray-900">Enable Shop Banner</span>
                                        <span className="block text-xs text-gray-500">Show a banner header on the category shop page</span>
                                    </div>
                                </label>

                                {formData.banner?.isActive && (
                                    <div className="mt-4 pl-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Banner Image (1200x300px)
                                        </label>
                                        <ImageUpload
                                            onImageUpload={(url) => setFormData(prev => ({ ...prev, banner: { ...prev.banner, url } }))}
                                            onImageRemove={() => setFormData(prev => ({ ...prev, banner: { ...prev.banner, url: '' } }))}
                                            currentImage={formData.banner?.url || ''}
                                            label=""
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Link
                        href="/admin/dashboard/categories"
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {loading ? 'Saving...' : 'Save Category'}
                    </button>
                </div>
            </form>
        </div>
    )
}
