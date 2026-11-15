'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { 
    Edit, 
    Search, 
    ChevronLeft, 
    ChevronRight, 
    Download, 
    AlertTriangle, 
    Package, 
    RotateCcw, 
    Layers, 
    Filter,
    X,
    ExternalLink,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCookie } from 'cookies-next'
import { productAPI } from '@/services/api'
import PermissionDenied from '@/components/Common/PermissionDenied'
import { useAppContext } from '@/context/AppContext'

export default function LowStockProductsPage() {
    const { hasPermission } = useAppContext()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    
    // User requested: default threshold 0
    const [threshold, setThreshold] = useState(0)
    // User requested: control for "Any variant low" vs "All combined / Total stock"
    const [stockMode, setStockMode] = useState('any') // 'any' | 'total'

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [permissionError, setPermissionError] = useState(null)
    const [limit, setLimit] = useState(10)
    const [isCustomLimit, setIsCustomLimit] = useState(false)
    const [customLimitVal, setCustomLimitVal] = useState('')
    const [exporting, setExporting] = useState(false)
    const [sortBy, setSortBy] = useState('totalStock')
    const [sortOrder, setSortOrder] = useState('asc')

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            const token = getCookie('token')

            const params = {
                page: currentPage,
                limit: limit,
                status: 'low_stock',
                threshold: threshold,
                stockMode: stockMode
            }

            if (searchTerm.trim()) {
                params.search = searchTerm.trim()
            }

            params.sort = sortOrder === 'asc' ? sortBy : `-${sortBy}`

            const data = await productAPI.getAdminProducts(params, token)

            if (data.success) {
                setProducts(data.data || [])
                setTotalPages(data.pagination?.totalPages || 1)
                setTotal(data.pagination?.total || 0)
                setPermissionError(null)
            } else {
                if (data.message && (
                    data.message.toLowerCase().includes('permission') ||
                    data.message.toLowerCase().includes('access denied') ||
                    data.message.toLowerCase().includes("don't have permission")
                )) {
                    setPermissionError({
                        message: data.message,
                        action: 'Read Products'
                    })
                } else {
                    toast.error(data.message || 'Failed to fetch products')
                }
            }
        } catch (error) {
            if (error.status === 403 || error.response?.status === 403) {
                const errorMessage = error.response?.data?.message || error.message || "You don't have permission to access this resource."
                setPermissionError({
                    message: errorMessage,
                    action: 'Read Products'
                })
            } else if (error.message && (
                error.message.toLowerCase().includes('permission') ||
                error.message.toLowerCase().includes('access denied') ||
                error.message.toLowerCase().includes("don't have permission")
            )) {
                setPermissionError({
                    message: error.message,
                    action: 'Read Products'
                })
            } else {
                console.error('Error fetching low stock products:', error)
            }
        } finally {
            setLoading(false)
        }
    }, [currentPage, searchTerm, threshold, stockMode, limit, sortBy, sortOrder])

    // Reset to page 1 when search or filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, threshold, stockMode])

    // Debounce search and filter fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts()
        }, 350)

        return () => clearTimeout(timer)
    }, [searchTerm, threshold, stockMode, currentPage, limit, sortBy, sortOrder, fetchProducts])

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const getPriceDisplay = (product) => {
        if (product.variants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.currentPrice).filter(p => p > 0)
            if (prices.length > 0) {
                const min = Math.min(...prices)
                const max = Math.max(...prices)
                return min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`
            }
        }
        if (product.singleVariant?.currentPrice) {
            return `৳${Number(product.singleVariant.currentPrice).toLocaleString()}`
        }
        return product.basePrice ? `৳${Number(product.basePrice).toLocaleString()}` : 'N/A'
    }

    const handleExportCSV = async () => {
        try {
            setExporting(true)
            const token = getCookie('token')
            const toastId = toast.loading('Fetching products for export...')

            const data = await productAPI.getAdminProducts({
                page: 1,
                limit: 10000,
                status: 'low_stock',
                threshold: threshold,
                stockMode: stockMode,
                search: searchTerm.trim() || undefined
            }, token)

            if (!data.success) {
                toast.error('Failed to fetch products for export', { id: toastId })
                return
            }

            toast.loading('Generating CSV...', { id: toastId })

            const allProducts = data.data || []
            const headers = ['Product Name', 'SKU', 'Brand', 'Total Stock', 'Variant Details', 'Variant Stock']
            const csvRows = [headers.join(',')]

            allProducts.forEach(product => {
                const baseName = `"${product.title?.replace(/"/g, '""') || ''}"`
                const brand = `"${product.brand?.replace(/"/g, '""') || ''}"`
                const totalStock = product.calculatedTotalStock ?? product.totalStock ?? 0

                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach(variant => {
                        const stock = variant.stockQuantity || 0
                        const variantAttrs = variant.attributes?.map(a => `${a.name}:${a.value}`).join(' | ') || ''
                        const sku = variant.sku || ''
                        csvRows.push(`${baseName},"${sku}",${brand},${totalStock},"${variantAttrs.replace(/"/g, '""')}",${stock}`)
                    })
                } else {
                    const sku = product.singleVariant?.sku || ''
                    csvRows.push(`${baseName},"${sku}",${brand},${totalStock},"Single Product",${totalStock}`)
                }
            })

            const csvContent = csvRows.join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.setAttribute('href', url)
            link.setAttribute('download', `low_stock_products_${new Date().toISOString().split('T')[0]}.csv`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Export completed successfully!', { id: toastId })
        } catch (error) {
            console.error('Export error:', error)
            toast.error('An error occurred during export')
        } finally {
            setExporting(false)
        }
    }

    if (permissionError && !loading) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError.message}
                action={permissionError.action}
            />
        )
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Low Stock &amp; Out of Stock Products</h1>
                                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                    Monitor products and variants below safety stock levels, filter by single variant or total stock, and restock quickly.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            onClick={() => fetchProducts()}
                            disabled={loading}
                            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                            title="Refresh list"
                        >
                            <RotateCcw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={exporting}
                            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            <Download className="h-4 w-4 mr-1.5" />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Controls Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
                    {/* Search Input */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by title, SKU, brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 transition-all text-gray-800 placeholder-gray-400"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Stock Mode Selection (Any variant vs Total stock) */}
                    <div className="md:col-span-4 flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Check Mode:</label>
                        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setStockMode('any')}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                    stockMode === 'any'
                                        ? 'bg-white text-blue-700 shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="Single kono akta variant eo kom hole list e asbe"
                            >
                                Any Variant Low
                            </button>
                            <button
                                type="button"
                                onClick={() => setStockMode('total')}
                                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                    stockMode === 'total'
                                        ? 'bg-white text-blue-700 shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                title="All miliye total stock kom hole list e asbe"
                            >
                                Total Stock Low
                            </button>
                        </div>
                    </div>

                    {/* Threshold Input */}
                    <div className="md:col-span-3 flex items-center justify-start md:justify-end gap-2">
                        <label className="text-xs font-bold text-gray-700 whitespace-nowrap">Stock &le;</label>
                        <input
                            type="number"
                            min="0"
                            value={threshold}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setThreshold(isNaN(val) || val < 0 ? 0 : val);
                            }}
                            className="w-20 px-3 py-2 text-center text-sm font-bold bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100/70 outline-none"
                            placeholder="0"
                        />
                        <span className="text-xs text-gray-400">units</span>
                    </div>
                </div>

                {/* Sub-row: Quick Presets & Sorting */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-gray-500 font-semibold mr-1">Quick Presets:</span>
                        <button
                            type="button"
                            onClick={() => setThreshold(0)}
                            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                threshold === 0
                                    ? 'bg-red-50 text-red-700 border-red-200 ring-2 ring-red-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            0 (Out of Stock)
                        </button>
                        <button
                            type="button"
                            onClick={() => setThreshold(2)}
                            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                threshold === 2
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            &le; 2 Units
                        </button>
                        <button
                            type="button"
                            onClick={() => setThreshold(5)}
                            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                threshold === 5
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            &le; 5 Units
                        </button>
                        <button
                            type="button"
                            onClick={() => setThreshold(10)}
                            className={`px-2.5 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                                threshold === 10
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 ring-2 ring-amber-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            &le; 10 Units
                        </button>
                    </div>

                    {/* Sorting */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-semibold">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                        >
                            <option value="totalStock">By Total Stock</option>
                            <option value="createdAt">By Date Added</option>
                            <option value="title">By Product Name</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                        >
                            <option value="asc">Ascending (Low &rarr; High)</option>
                            <option value="desc">Descending (High &rarr; Low)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Active Filter Indicator Badge Bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <div className="flex items-center gap-2">
                    <span>
                        Showing products where <strong className="text-gray-800">{stockMode === 'total' ? 'Total Stock' : 'Any Variant or Total'}</strong> is &le; <strong className="text-red-600 font-bold">{threshold}</strong> units.
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        {total} Products Found
                    </span>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-28">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                <p className="text-sm font-semibold text-gray-500">Loading low stock products...</p>
                            </div>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Product Details
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Total Stock
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Variants Stock Breakdown
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <p className="text-base font-bold text-gray-800">No products found with stock &le; {threshold}</p>
                                            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                                All items are currently stocked above {threshold} units, or try adjusting the stock threshold or search terms above.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const calculatedStock = product.calculatedTotalStock ?? product.totalStock ?? 0
                                        const hasVariants = Array.isArray(product.variants) && product.variants.length > 0
                                        const isOutOfStock = calculatedStock <= 0

                                        return (
                                            <tr key={product._id} className="hover:bg-blue-50/30 transition-colors">
                                                {/* Product Info */}
                                                <td className="px-5 py-4 min-w-[240px]">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            className="h-12 w-12 rounded-xl object-cover border border-gray-200 bg-gray-100 shrink-0"
                                                            src={product.featuredImage || '/images/placeholder.png'}
                                                            alt={product.title}
                                                            onError={(e) => { e.currentTarget.src = '/images/placeholder.png' }}
                                                        />
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={`/admin/dashboard/products/${product._id}/edit`}
                                                                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                                                                title={product.title}
                                                            >
                                                                {product.title}
                                                            </Link>
                                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                {product.singleVariant?.sku && (
                                                                    <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[10px] font-bold border border-gray-200">
                                                                        SKU: {product.singleVariant.sku}
                                                                    </span>
                                                                )}
                                                                {product.brand && (
                                                                    <span className="text-[11px] text-gray-500 font-medium">
                                                                        {product.brand}
                                                                    </span>
                                                                )}
                                                                {product.category?.name && (
                                                                    <span className="text-[11px] text-gray-400">
                                                                        &bull; {product.category.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    {getPriceDisplay(product)}
                                                </td>

                                                {/* Total Stock Badge */}
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                                                            isOutOfStock
                                                                ? 'bg-red-50 text-red-700 border-red-200'
                                                                : calculatedStock <= 5
                                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {isOutOfStock ? (
                                                                <>
                                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                                    <span>Out of Stock (0)</span>
                                                                </>
                                                            ) : (
                                                                <span>{calculatedStock} units</span>
                                                            )}
                                                        </span>
                                                        {hasVariants && (
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {product.variants.length} variant(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Variants Breakdown */}
                                                <td className="px-5 py-4 min-w-[280px]">
                                                    {hasVariants ? (
                                                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                                            {product.variants.map((v, i) => {
                                                                const attrs = v.attributes?.map(a => a.value).filter(Boolean).join(' / ') || ''
                                                                const vName = v.sku || attrs || `Variant ${i + 1}`
                                                                const vStock = v.stockQuantity ?? 0
                                                                const isVarLow = vStock <= threshold

                                                                return (
                                                                    <div
                                                                        key={v._id || `var-${i}`}
                                                                        className={`text-xs flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-colors ${
                                                                            isVarLow
                                                                                ? 'bg-red-50/80 border-red-200 text-red-800'
                                                                                : 'bg-gray-50 border-gray-200 text-gray-700'
                                                                        }`}
                                                                    >
                                                                        <div className="min-w-0 pr-2">
                                                                            <span className="font-semibold truncate block" title={vName}>
                                                                                {vName}
                                                                            </span>
                                                                            {attrs && v.sku && (
                                                                                <span className="text-[10px] opacity-75 truncate block">
                                                                                    {attrs}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="shrink-0 text-right">
                                                                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                                                                                vStock <= 0
                                                                                    ? 'bg-red-600 text-white'
                                                                                    : isVarLow
                                                                                        ? 'bg-red-200 text-red-800'
                                                                                        : 'bg-gray-200 text-gray-800'
                                                                            }`}>
                                                                                {vStock <= 0 ? '0 (Out)' : `${vStock} left`}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            Single Product &bull; Stock: {product.singleVariant?.stockQuantity ?? calculatedStock}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4 whitespace-nowrap text-right text-sm">
                                                    <Link
                                                        href={`/admin/dashboard/products/${product._id}/edit`}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold border border-blue-200 transition-all cursor-pointer shadow-xs"
                                                        title="Edit Product and Restock"
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                        <span>Edit / Restock</span>
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination Card */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                        <div>
                            Showing {products.length} of {total} products (Page {currentPage} of {totalPages})
                        </div>
                        <div className="flex items-center gap-2">
                            <label>Per page:</label>
                            {isCustomLimit ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        min="1"
                                        value={customLimitVal}
                                        onChange={(e) => setCustomLimitVal(e.target.value)}
                                        className="w-14 px-2 py-1 border border-gray-300 rounded-lg text-xs outline-none text-center"
                                        placeholder="Num"
                                    />
                                    <button
                                        onClick={() => {
                                            const val = parseInt(customLimitVal)
                                            if (val > 0) {
                                                setLimit(val)
                                                setCurrentPage(1)
                                            }
                                        }}
                                        className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                                    >
                                        Go
                                    </button>
                                    <button
                                        onClick={() => setIsCustomLimit(false)}
                                        className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded-lg text-xs"
                                    >
                                        X
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        if (e.target.value === 'custom') {
                                            setIsCustomLimit(true)
                                            setCustomLimitVal(limit.toString())
                                        } else {
                                            setLimit(parseInt(e.target.value))
                                            setCurrentPage(1)
                                        }
                                    }}
                                    className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="custom">Custom</option>
                                </select>
                            )}
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center space-x-1.5">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Previous
                            </button>

                            <div className="flex items-center space-x-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const page = idx + 1
                                    if (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white shadow-xs'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                                        return (
                                            <span key={page} className="px-1 text-gray-400 text-xs">
                                                ...
                                            </span>
                                        )
                                    }
                                    return null
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                Next
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
