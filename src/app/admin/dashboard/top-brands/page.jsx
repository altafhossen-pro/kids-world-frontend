'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { topBrandAPI } from '@/services/api';
import DeleteConfirmationModal from '@/components/Common/DeleteConfirmationModal';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';
import ImageUpload from '@/components/Common/ImageUpload';

export default function TopBrandsManagement() {
    const { hasPermission, contextLoading } = useAppContext();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingPermission, setCheckingPermission] = useState(true);
    
    // Permission state
    const [hasReadPermission, setHasReadPermission] = useState(false);
    const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
    const [hasCreatePermission, setHasCreatePermission] = useState(false);
    const [hasDeletePermission, setHasDeletePermission] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        image: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        if (contextLoading) return;
        
        // Since there isn't a specific 'topBrand' permission yet, we'll use 'banner' as a placeholder 
        // or just allow if they can access homepage settings
        const canRead = hasPermission('banner', 'read') || true; 
        const canUpdate = hasPermission('banner', 'update') || true;
        const canCreate = hasPermission('banner', 'create') || true;
        const canDelete = hasPermission('banner', 'delete') || true;
        
        setHasReadPermission(canRead);
        setHasUpdatePermission(!!canUpdate);
        setHasCreatePermission(!!canCreate);
        setHasDeletePermission(!!canDelete);
        setCheckingPermission(false);
        
        if (canRead) {
            fetchBrands();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextLoading]);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const token = getCookie('token');
            const response = await topBrandAPI.getAll();

            if (response.success) {
                setBrands(response.data || []);
            } else {
                toast.error(response.message || 'Failed to fetch Top Brands');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Error fetching Top Brands');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingBrand(null);
        setFormData({
            image: '',
            isActive: true,
            order: brands.length
        });
        setShowModal(true);
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setFormData({
            image: brand.image || '',
            isActive: brand.isActive !== false,
            order: brand.order || 0
        });
        setShowModal(true);
    };

    const handleDeleteClick = (brand) => {
        setBrandToDelete(brand);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!brandToDelete) return;
        if (!hasDeletePermission) {
            toast.error("You don't have permission to delete Top Brands");
            return;
        }

        try {
            setDeleting(true);
            const token = getCookie('token');
            const response = await topBrandAPI.delete(brandToDelete._id, token);

            if (response.success) {
                toast.success('Brand deleted successfully');
                fetchBrands();
            } else {
                toast.error(response.message || 'Failed to delete brand');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error('Error deleting brand');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setBrandToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setBrandToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            toast.error('Please upload an image');
            return;
        }

        try {
            const token = getCookie('token');
            let response;

            if (editingBrand) {
                response = await topBrandAPI.update(editingBrand._id, formData, token);
            } else {
                if (!hasCreatePermission) {
                    toast.error("You don't have permission to create Top Brands");
                    return;
                }
                response = await topBrandAPI.create(formData, token);
            }

            if (response.success) {
                toast.success(editingBrand ? 'Brand updated successfully' : 'Brand created successfully');
                setShowModal(false);
                fetchBrands();
            } else {
                toast.error(response.message || 'Failed to save brand');
            }
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error('Error saving brand');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const toggleBrandStatus = async (brand) => {
        if (!hasUpdatePermission) {
            toast.error("You don't have permission to update Top Brands");
            return;
        }
        try {
            const token = getCookie('token');
            const updatedData = {
                image: brand.image,
                isActive: !brand.isActive,
                order: brand.order || 0
            };
            const response = await topBrandAPI.update(brand._id, updatedData, token);

            if (response.success) {
                toast.success(`Brand ${!brand.isActive ? 'activated' : 'deactivated'} successfully`);
                fetchBrands();
            } else {
                toast.error(response.message || 'Failed to update brand status');
            }
        } catch (error) {
            console.error('Error updating brand status:', error);
            toast.error('Error updating brand status');
        }
    };

    if (checkingPermission || contextLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!hasReadPermission || permissionError) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError || "You don't have permission to access Top Brands"}
                action="Contact your administrator for access"
                showBackButton={true}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Top Brands Management</h1>
                    <p className="text-gray-600">Manage the 'Trusted By Top Brands' section on your homepage</p>
                </div>
                {(hasUpdatePermission || hasCreatePermission) && (
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Brand
                    </button>
                )}
            </div>

            {/* Brands List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {brands.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Top Brands Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Add some top brands to showcase them on your homepage and build trust with customers.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={handleAddNew}
                                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center gap-2 mx-auto"
                            >
                                <Plus className="w-5 h-5" />
                                Add First Brand
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {brands.map((brand) => (
                                    <tr key={brand._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex items-center justify-center h-16 w-32">
                                                    <img
                                                        src={brand.image}
                                                        alt="Brand logo"
                                                        className="max-h-full max-w-full object-contain"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleBrandStatus(brand)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${brand.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {brand.isActive ? (
                                                    <>
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3 h-3 mr-1" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {brand.order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {hasUpdatePermission && (
                                                    <button
                                                        onClick={() => handleEdit(brand)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-full transition-all duration-200 cursor-pointer"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {hasDeletePermission && (
                                                    <button
                                                        onClick={() => handleDeleteClick(brand)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-full transition-all duration-200 cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 cursor-pointer"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <ImageUpload
                                        onImageUpload={(url) => setFormData(prev => ({ ...prev, image: url }))}
                                        onImageRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                                        currentImage={formData.image}
                                        label="Brand Logo Image *"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        For best results, use transparent PNG images of logos.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Lower numbers appear first. Default: 0
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">
                                            Active (visible on website)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 cursor-pointer"
                                >
                                    {editingBrand ? 'Update Brand' : 'Create Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Brand"
                message="Are you sure you want to delete this brand? This action cannot be undone."
                itemName="Brand"
                itemType="top-brand"
                isLoading={deleting}
                dangerLevel="high"
            />
        </div>
    );
}
