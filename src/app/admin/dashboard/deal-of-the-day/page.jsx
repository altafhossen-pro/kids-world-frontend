'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, ImageIcon, Upload, X, Clock, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import { dealOfTheDayAPI, uploadAPI } from '@/services/api';
import DeleteConfirmationModal from '@/components/Common/DeleteConfirmationModal';

export default function DealOfTheDayPage() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dealToDelete, setDealToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [inputType, setInputType] = useState('url'); // 'url' or 'upload'

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image: '',
        endTime: '',
        buttonText: 'Shop Deal Now',
        buttonLink: '#',
        isActive: false
    });

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const token = getCookie('token');
            const response = await dealOfTheDayAPI.getAllDeals(token);
            if (response.success) {
                setDeals(response.data);
            }
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast.error('Failed to fetch deals');
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditingDeal(null);
        // Default end time to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setFormData({
            title: '',
            subtitle: '',
            image: '',
            endTime: tomorrow.toISOString().slice(0, 16),
            buttonText: 'Shop Deal Now',
            buttonLink: '#',
            isActive: false
        });
        setSelectedFile(null);
        setImagePreview(null);
        setInputType('url');
        setShowModal(true);
    };

    const handleEdit = (deal) => {
        setEditingDeal(deal);

        setFormData({
            title: deal.title || '',
            subtitle: deal.subtitle || '',
            image: deal.image || '',
            endTime: deal.endTime ? new Date(deal.endTime).toISOString().slice(0, 16) : '',
            buttonText: deal.buttonText || 'Shop Deal Now',
            buttonLink: deal.buttonLink || '#',
            isActive: deal.isActive || false
        });

        if (deal.image) {
            setImagePreview(deal.image);
            setInputType('url'); // Default to URL for existing
        } else {
            setImagePreview(null);
        }
        setSelectedFile(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            toast.error('Please provide an image for the deal');
            return;
        }

        try {
            const token = getCookie('token');
            const submitData = { ...formData };

            if (editingDeal) {
                const response = await dealOfTheDayAPI.updateDeal(editingDeal._id, submitData, token);
                if (response.success) {
                    toast.success('Deal updated successfully');
                    fetchDeals();
                } else {
                    toast.error('Failed to update deal');
                }
            } else {
                const response = await dealOfTheDayAPI.createDeal(submitData, token);
                if (response.success) {
                    toast.success('Deal created successfully');
                    fetchDeals();
                } else {
                    toast.error('Failed to create deal');
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving deal:', error);
            toast.error('Failed to save deal');
        }
    };

    const handleDelete = (deal) => {
        setDealToDelete(deal);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            const token = getCookie('token');
            const response = await dealOfTheDayAPI.deleteDeal(dealToDelete._id, token);
            if (response.success) {
                toast.success('Deal deleted successfully');
                fetchDeals();
            }
        } catch (error) {
            console.error('Error deleting deal:', error);
            toast.error('Failed to delete deal');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDealToDelete(null);
        }
    };

    const toggleDealStatus = async (deal) => {
        try {
            const token = getCookie('token');
            const response = await dealOfTheDayAPI.toggleStatus(deal._id, token);
            if (response.success) {
                toast.success(`Deal ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
                fetchDeals();
            }
        } catch (error) {
            console.error('Error toggling deal status:', error);
            toast.error('Failed to toggle deal status');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select an image file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await uploadAPI.uploadSingle(formData);

            if (response.success) {
                setFormData(prev => ({ ...prev, image: response.data.url }));
                toast.success('Image uploaded successfully');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, image: url }));
        setImagePreview(url);
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: '' }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Deal of the Day</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Deal
                </button>
            </div>

            {deals.length === 0 ? (
                <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
                    <p className="text-gray-500 mb-6">Create your first Deal of the Day to get started</p>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Create Deal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {deals.map((deal) => (
                        <div key={deal._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                            <div className="relative w-full md:w-2/5 h-48 md:h-auto">
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => toggleDealStatus(deal)}
                                        className={`p-2 rounded-full transition-colors ${deal.isActive
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-500 text-white'
                                            }`}
                                        title={deal.isActive ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'}
                                    >
                                        {deal.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{deal.title}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{deal.subtitle}</p>

                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                        <Clock className="w-4 h-4" />
                                        Ends: {new Date(deal.endTime).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                        <LinkIcon className="w-4 h-4" />
                                        {deal.buttonText}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(deal)}
                                            className="flex-1 bg-blue-50 text-blue-600 border border-blue-200 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(deal)}
                                            className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingDeal ? 'Edit Deal of the Day' : 'Add New Deal'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                        <Clock className="w-4 h-4 text-blue-500" />
                                        Content Details
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Deal of the Day!"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Subtitle / Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                            required
                                            rows="3"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Get the ultimate kids electric ride-on..."
                                        ></textarea>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            End Time (Countdown) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Image and Button */}
                                <div className="space-y-4">
                                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-2">
                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                        Media & Action
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Deal Image <span className="text-red-500">*</span>
                                        </label>
                                        
                                        <div className="flex gap-4 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setInputType('url')}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${inputType === 'url' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Image URL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setInputType('upload')}
                                                className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors ${inputType === 'upload' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                Upload File
                                            </button>
                                        </div>

                                        {inputType === 'url' ? (
                                            <input
                                                type="url"
                                                value={formData.image}
                                                onChange={handleImageUrlChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        ) : (
                                            <div className="space-y-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                        id="image-upload"
                                                    />
                                                    <label
                                                        htmlFor="image-upload"
                                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm font-medium"
                                                    >
                                                        <Upload className="w-4 h-4" />
                                                        Choose File
                                                    </label>

                                                    {selectedFile && (
                                                        <button
                                                            type="button"
                                                            onClick={handleImageUpload}
                                                            disabled={uploading}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
                                                        >
                                                            {uploading ? 'Uploading...' : 'Upload'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Image Preview */}
                                        {imagePreview && (
                                            <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-32 object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Button Text
                                        </label>
                                        <input
                                            type="text"
                                            name="buttonText"
                                            value={formData.buttonText}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Button Link
                                        </label>
                                        <input
                                            type="text"
                                            name="buttonLink"
                                            value={formData.buttonLink}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="/shop or https://..."
                                        />
                                    </div>
                                    
                                    <div className="pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-bold text-gray-900">Activate this deal</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Activating this deal will automatically deactivate any other active deal.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
                                >
                                    {editingDeal ? 'Update Deal' : 'Save Deal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Deal"
                message="Are you sure you want to delete this deal? This action cannot be undone."
                itemName={dealToDelete?.title}
                itemType="deal"
                isLoading={deleting}
            />
        </div>
    );
}
