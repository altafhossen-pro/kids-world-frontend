'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import toast from 'react-hot-toast';
import {
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Eye,
  MessageSquare,
  Package,
  Calendar,
  ThumbsUp,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Loader2,
  Check
} from 'lucide-react';

import { reviewAPI, productAPI } from '@/services/api';
import { getProductPrice } from '@/utils/productUtils';
import DeleteConfirmationModal from '@/components/Common/DeleteConfirmationModal';

// Instant Autocomplete Product Combobox Component
function ProductCombobox({
  selectedProduct,
  onSelectProduct,
  onClearProduct,
  label = 'Select Product',
  required = true,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch product suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productAPI.getProducts({
          search: query.trim(),
          limit: 12,
        });
        if (active && res?.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        if (active) setLoading(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, isOpen]);

  const handleSelect = (prod) => {
    onSelectProduct(prod);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    onClearProduct();
    setIsOpen(true);
    setQuery('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {selectedProduct ? (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 transition-all shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={selectedProduct.featuredImage || '/images/placeholder.png'}
              alt={selectedProduct.title || 'Product'}
              className="w-12 h-12 object-cover rounded-lg border border-blue-100 shrink-0 bg-white shadow-xs"
              onError={(e) => {
                e.target.src = '/images/placeholder.png';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Selected
                </span>
                {(() => {
                  const { price } = getProductPrice(selectedProduct);
                  return price > 0 ? (
                    <span className="text-xs font-bold text-blue-700">৳{price.toLocaleString()}</span>
                  ) : null;
                })()}
              </div>
              <p className="font-bold text-gray-900 text-sm truncate mt-0.5" title={selectedProduct.title}>
                {selectedProduct.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg shrink-0 transition-all cursor-pointer shadow-xs"
            title="Choose a different product"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search product by title (type for instant suggestions)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            {loading ? (
              <Loader2 className="w-4 h-4 text-blue-600 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Instant Dropdown Suggestions */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-72 overflow-y-auto divide-y divide-gray-100">
              {loading && products.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Searching products...</span>
                </div>
              ) : products.length > 0 ? (
                <div>
                  <div className="px-3.5 py-1.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 border-b border-gray-100 flex items-center justify-between">
                    <span>Instant Suggestions</span>
                    <span>{products.length} products</span>
                  </div>
                  {products.map((p) => {
                    const { price: priceVal } = getProductPrice(p);
                    const stockVal = p.totalStock !== undefined ? p.totalStock : p.stock;
                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => handleSelect(p)}
                        className="w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={p.featuredImage || '/images/placeholder.png'}
                          alt={p.title || 'Product'}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-50 group-hover:border-blue-300"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.png';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 truncate transition-colors">
                            {p.title}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            {priceVal > 0 && (
                              <span className="font-bold text-gray-800">
                                ৳{priceVal.toLocaleString()}
                              </span>
                            )}
                            {p.sku && <span>SKU: {p.sku}</span>}
                            {stockVal !== undefined && (
                              <span className={stockVal > 0 ? 'text-emerald-600 font-medium' : 'text-rose-500'}>
                                {stockVal > 0 ? `${stockVal} in stock` : 'Out of stock'}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2.5 py-1 bg-white rounded-md border border-blue-200 shadow-2xs">
                          Select
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-5 text-center text-sm text-gray-500">
                  {query ? (
                    <>
                      No products found matching &ldquo;
                      <span className="font-semibold text-gray-800">{query}</span>
                      &rdquo;
                    </>
                  ) : (
                    'No products available'
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminProductReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending
  const [ratingFilter, setRatingFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  // Summary Stats
  const [stats, setStats] = useState({
    totalReviews: 0,
    approvedReviews: 0,
    pendingReviews: 0,
  });

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Selected product for Add/Edit Review Modal
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({ ...prev, productId: product._id }));
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setFormData((prev) => ({ ...prev, productId: '' }));
  };

  // Form State
  const [formData, setFormData] = useState({
    productId: '',
    customerName: '',
    customerEmail: '',
    rating: 5,
    title: '',
    comment: '',
    isApproved: true,
    isVerifiedPurchase: true,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie('token');
      const params = {
        page,
        limit,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (statusFilter !== 'all') {
        params.isApproved = statusFilter === 'approved' ? 'true' : 'false';
      }
      if (ratingFilter !== 'all') {
        params.rating = ratingFilter;
      }

      const res = await reviewAPI.getAdminReviews(params, token);
      if (res?.success) {
        setReviews(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.total || 0);
        }
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        toast.error(res?.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      toast.error('Failed to fetch product reviews');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      productId: '',
      customerName: '',
      customerEmail: '',
      rating: 5,
      title: '',
      comment: '',
      isApproved: true,
      isVerifiedPurchase: true,
    });
    setSelectedProduct(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (review) => {
    setSelectedReview(review);
    setFormData({
      productId: review.product?._id || review.product || '',
      customerName: review.customerName || review.user?.name || '',
      customerEmail: review.customerEmail || review.user?.email || '',
      rating: review.rating || 5,
      title: review.title || '',
      comment: review.comment || '',
      isApproved: review.isApproved !== undefined ? review.isApproved : true,
      isVerifiedPurchase: review.isVerifiedPurchase !== undefined ? review.isVerifiedPurchase : true,
    });
    setSelectedProduct(review.product || null);
    setIsEditModalOpen(true);
  };

  // Handle Form Submit (Create)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!formData.comment.trim()) {
      toast.error('Review comment is required');
      return;
    }

    try {
      setSaving(true);
      const token = getCookie('token');
      const res = await reviewAPI.createReview(formData, token);
      if (res?.success) {
        toast.success('Review created and published successfully!');
        setIsCreateModalOpen(false);
        fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to create review');
      }
    } catch (err) {
      console.error('Create review error:', err);
      toast.error('Failed to create review');
    } finally {
      setSaving(false);
    }
  };

  // Handle Form Submit (Edit)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment.trim()) {
      toast.error('Review comment is required');
      return;
    }

    try {
      setSaving(true);
      const token = getCookie('token');
      const res = await reviewAPI.updateReview(selectedReview._id, formData, token);
      if (res?.success) {
        toast.success('Review updated successfully!');
        setIsEditModalOpen(false);
        fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to update review');
      }
    } catch (err) {
      console.error('Update review error:', err);
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  // Toggle review status (Approve / Hide)
  const handleToggleStatus = async (review) => {
    try {
      const token = getCookie('token');
      const res = await reviewAPI.toggleReviewStatus(review._id, token);
      if (res?.success) {
        toast.success(res.message || 'Status updated');
        // Update local state directly for fast UX
        setReviews(prev =>
          prev.map(r => (r._id === review._id ? { ...r, isApproved: !r.isApproved } : r))
        );
        fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to toggle review status');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
      toast.error('Failed to toggle review status');
    }
  };

  // Delete review confirmation
  const handleOpenDeleteModal = (review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      setIsDeleting(true);
      const token = getCookie('token');
      const res = await reviewAPI.deleteReview(reviewToDelete._id, token);
      if (res?.success) {
        toast.success('Review deleted successfully');
        setIsDeleteModalOpen(false);
        setReviewToDelete(null);
        fetchReviews();
      } else {
        toast.error(res?.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
      toast.error('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Product Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage customer feedback, ratings, and manually add verified reviews for products
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-all shadow-blue-500/20 hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product Review</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reviews</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalReviews || totalItems}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Published / Approved</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.approvedReviews}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending / Hidden</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{stats.pendingReviews}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, comment, title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-40 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Rating:</label>
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-36 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Limit Per Page */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Per Page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="w-full md:w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-gray-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">No reviews found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
              {debouncedSearch || statusFilter !== 'all' || ratingFilter !== 'all'
                ? 'Try adjusting your search query or filters to find reviews.'
                : 'Get started by creating your first product review or wait for customers to leave reviews.'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium cursor-pointer transition-colors"
            >
              Add First Review
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Comment</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => {
                  const product = review.product || {};
                  const reviewerName = review.customerName || review.user?.name || 'Anonymous';
                  const reviewerEmail = review.customerEmail || review.user?.email || '';

                  return (
                    <tr key={review._id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Product */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.featuredImage || '/images/placeholder.png'}
                            alt={product.title || 'Product'}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0 bg-gray-50"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.png';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate text-sm" title={product.title}>
                              {product.title || 'Unknown Product'}
                            </p>
                            {product.slug && (
                              <Link
                                href={`/product/${product.slug}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                View product <Eye className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900">{reviewerName}</span>
                            {review.isVerifiedPurchase && (
                              <span
                                title="Verified Purchase"
                                className="inline-flex items-center text-blue-600"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          {reviewerEmail && (
                            <span className="text-xs text-gray-400">{reviewerEmail}</span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < (review.rating || 0)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-700 ml-1">
                            {review.rating || 0}.0
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-3.5 px-4 max-w-sm">
                        {review.title && (
                          <p className="font-bold text-gray-900 text-xs truncate mb-0.5">
                            {review.title}
                          </p>
                        )}
                        <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">
                          {review.comment}
                        </p>
                      </td>

                      {/* Status (Approve / Pending Toggle) */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(review)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            review.isApproved
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {review.isApproved ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Hidden
                            </>
                          )}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-gray-500">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(review)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(review)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of {totalItems} reviews
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Simple windowing
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 2 && pageNum <= page + 2)) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Add Customer Review</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Instant Suggestion Product Combobox */}
              <ProductCombobox
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                onClearProduct={handleClearProduct}
                label="Select Product"
                required={true}
              />

              {/* Reviewer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Customer Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="tanvir@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-2">
                    {formData.rating} out of 5 Stars
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Headline / Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Great quality toy, kids loved it!"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Detailed customer review comment..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerifiedPurchase}
                    onChange={(e) => setFormData({ ...formData, isVerifiedPurchase: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified Purchase Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Publish Immediately</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save & Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Edit Product Review</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              {/* Instant Suggestion Product Combobox */}
              <ProductCombobox
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                onClearProduct={handleClearProduct}
                label="Product"
                required={true}
              />

              {/* Reviewer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-gray-700 ml-2">
                    {formData.rating} Stars
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isVerifiedPurchase}
                    onChange={(e) => setFormData({ ...formData, isVerifiedPurchase: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Verified Purchase Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isApproved}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Published / Approved</span>
                </label>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Product Review"
        message="Are you sure you want to permanently delete this product review? The product's average rating and review count will be updated automatically."
        itemName={reviewToDelete?.customerName ? `Review by ${reviewToDelete.customerName}` : 'this review'}
        itemType="review"
        isLoading={isDeleting}
        confirmText="Delete Review"
        cancelText="Keep Review"
        dangerLevel="high"
      />
    </div>
  );
}
