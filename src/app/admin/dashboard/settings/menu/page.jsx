'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Save, X, Facebook, Twitter, Instagram, Linkedin, FolderOpen, Loader2, Video, ArrowUp, ArrowDown } from 'lucide-react';
import { menuAPI, categoryAPI, settingsAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { getCookie } from 'cookies-next';
import DeleteConfirmationModal from '@/components/Common/DeleteConfirmationModal';
import { useAppContext } from '@/context/AppContext';
import PermissionDenied from '@/components/Common/PermissionDenied';

export default function MenuSettings() {
    const { hasPermission, contextLoading } = useAppContext();
    const [activeTab, setActiveTab] = useState('header');
    const [headerMenus, setHeaderMenus] = useState([]);
    const [footerMenus, setFooterMenus] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [socialMediaData, setSocialMediaData] = useState({
        facebook: { url: '', isActive: false, openInNewTab: true },
        twitter: { url: '', isActive: false, openInNewTab: true },
        instagram: { url: '', isActive: false, openInNewTab: true },
        linkedin: { url: '', isActive: false, openInNewTab: true }
    });

    const handleVideoMenuChange = (e) => {
        const { name, value, type, checked } = e.target;
        setVideoMenu(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveVideoMenu = async () => {
        try {
            setSavingVideoMenu(true);
            const res = await settingsAPI.updateSiteSettings({ videoMenu }, getAdminToken());
            if (res.success) {
                toast.success('Video menu settings saved successfully');
            } else {
                toast.error(res.message || 'Failed to save video menu');
            }
        } catch (error) {
            console.error('Error saving video menu:', error);
            toast.error('An error occurred while saving video menu');
        } finally {
            setSavingVideoMenu(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        href: '',
        isActive: false,
        order: 0,
        isVisible: true,
        target: '_self',
        icon: '',
        description: '',
        section: 'quickLinks',
        contactType: '',
        socialPlatform: ''
    });
    const [checkingPermission, setCheckingPermission] = useState(true);
    const [hasReadPermission, setHasReadPermission] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    const [hasUpdatePermission, setHasUpdatePermission] = useState(false);
    const [videoMenu, setVideoMenu] = useState({
        isEnabled: false,
        name: 'Videos',
        url: '/videos',
        backgroundColor: '#FF1493',
        textColor: '#FFFFFF',
        tailwindClasses: ''
    });
    const [savingVideoMenu, setSavingVideoMenu] = useState(false);

    // Get admin token from localStorage
    const getAdminToken = () => {
        return getCookie('token');
    };

    // Fetch menus
    const fetchMenus = async () => {
        try {
            setLoading(true);
            const [headerResponse, footerResponse, categoriesResponse, settingsResponse] = await Promise.all([
                menuAPI.getHeaderMenus(),
                menuAPI.getFooterMenus(),
                categoryAPI.getCategories(),
                settingsAPI.getSiteSettings()
            ]);

            if (settingsResponse.success && settingsResponse.data && settingsResponse.data.videoMenu) {
                setVideoMenu(settingsResponse.data.videoMenu);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data);
            }

            if (headerResponse.success) {
                setHeaderMenus(headerResponse.data);
            }

            if (footerResponse.success) {
                setFooterMenus(footerResponse.data);

                // Process social media data
                const socialData = footerResponse.data.socialMedia || [];
                const processedSocialData = {
                    facebook: { url: '', isActive: false, openInNewTab: true },
                    twitter: { url: '', isActive: false, openInNewTab: true },
                    instagram: { url: '', isActive: false, openInNewTab: true },
                    linkedin: { url: '', isActive: false, openInNewTab: true }
                };

                socialData.forEach(item => {
                    const platform = item.socialPlatform || item.name?.toLowerCase();
                    if (processedSocialData[platform]) {
                        processedSocialData[platform] = {
                            url: item.href,
                            isActive: item.isActive,
                            openInNewTab: item.target === '_blank'
                        };
                    }
                });

                setSocialMediaData(processedSocialData);


            }
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Failed to fetch menus');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contextLoading) return;
        const canRead = hasPermission('settings', 'read');
        const canUpdate = hasPermission('settings', 'update');
        setHasReadPermission(canRead);
        setHasUpdatePermission(!!canUpdate);
        setCheckingPermission(false);
        if (canRead) {
            fetchMenus();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contextLoading]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hasUpdatePermission) {
            toast.error("You don't have permission to update settings");
            return;
        }
        try {
            const token = getAdminToken();
            if (!token) {
                toast.error('Admin authentication required');
                return;
            }

            // Clean the form data - remove empty strings for optional fields
            const menuData = { ...formData };

            // Handle empty name for contact section
            if (menuData.section === 'contact' && !menuData.name.trim()) {
                menuData.name = menuData.contactType ? 
                    menuData.contactType.charAt(0).toUpperCase() + menuData.contactType.slice(1) : 
                    'Contact';
            }

            // Remove empty strings for optional fields that have enum validation
            if (!menuData.contactType || menuData.contactType === '') {
                delete menuData.contactType;
            }
            if (!menuData.socialPlatform || menuData.socialPlatform === '') {
                delete menuData.socialPlatform;
            }
            if (!menuData.icon || menuData.icon === '') {
                delete menuData.icon;
            }
            if (!menuData.description || menuData.description === '') {
                delete menuData.description;
            }


            if (activeTab === 'header') {
                if (editingMenu) {
                    const response = await menuAPI.updateHeaderMenu(editingMenu._id, menuData, token);
                    if (response.success) {
                        toast.success('Header menu updated successfully');
                        setHeaderMenus(prev => prev.map(menu =>
                            menu._id === editingMenu._id ? response.data : menu
                        ));
                    }
                } else {
                    const response = await menuAPI.createHeaderMenu(menuData, token);
                    if (response.success) {
                        toast.success('Header menu created successfully');
                        setHeaderMenus(prev => [...prev, response.data]);
                    }
                }
            } else {
                if (editingMenu) {
                    const response = await menuAPI.updateFooterMenu(editingMenu._id, menuData, token);
                    if (response.success) {
                        toast.success('Footer menu updated successfully');
                        setFooterMenus(prev => ({
                            ...prev,
                            [menuData.section]: prev[menuData.section]?.map(menu =>
                                menu._id === editingMenu._id ? response.data : menu
                            ) || []
                        }));
                    }
                } else {
                    const response = await menuAPI.createFooterMenu(menuData, token);
                    if (response.success) {
                        toast.success('Footer menu created successfully');
                        setFooterMenus(prev => ({
                            ...prev,
                            [menuData.section]: [...(prev[menuData.section] || []), response.data]
                        }));
                    }
                }
            }

            setShowForm(false);
            setEditingMenu(null);
            resetForm();
        } catch (error) {
            console.error('Error saving menu:', error);
            toast.error('Failed to save menu');
        }
    };

    // Handle edit
    const handleEdit = (menu) => {
        setEditingMenu(menu);
        setFormData({
            name: menu.name,
            href: menu.href,
            isActive: menu.isActive,
            order: menu.order,
            isVisible: menu.isVisible,
            target: menu.target,
            icon: menu.icon || '',
            description: menu.description || '',
            section: menu.section || 'quickLinks',
            contactType: menu.contactType || '',
            socialPlatform: menu.socialPlatform || ''
        });
        setShowForm(true);
    };

    // Handle delete button click
    const handleDeleteClick = (menu) => {
        setMenuToDelete(menu);
        setShowDeleteModal(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirm = async () => {
        if (!menuToDelete) return;
        if (!hasUpdatePermission) {
            toast.error("You don't have permission to update settings");
            return;
        }

        try {
            setDeleting(true);
            const token = getAdminToken();
            if (!token) {
                toast.error('Admin authentication required');
                return;
            }

            let response;
            if (activeTab === 'header') {
                response = await menuAPI.deleteHeaderMenu(menuToDelete._id, token);
                if (response.success) {
                    setHeaderMenus(prev => prev.filter(m => m._id !== menuToDelete._id));
                    toast.success('Header menu deleted successfully');
                }
            } else {
                response = await menuAPI.deleteFooterMenu(menuToDelete._id, token);
                if (response.success) {
                    setFooterMenus(prev => ({
                        ...prev,
                        [menuToDelete.section]: prev[menuToDelete.section]?.filter(m => m._id !== menuToDelete._id) || []
                    }));
                    toast.success('Footer menu deleted successfully');
                }
            }

            setShowDeleteModal(false);
            setMenuToDelete(null);
        } catch (error) {
            console.error('Error deleting menu:', error);
            toast.error('Failed to delete menu');
        } finally {
            setDeleting(false);
        }
    };

    // Handle delete modal close
    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setMenuToDelete(null);
    };

    // Handle move order
    const handleMoveOrder = async (menu, direction, sectionKey) => {
        if (!hasUpdatePermission) return;
        
        let sectionMenus = activeTab === 'header' 
            ? headerMenus.filter(m => m.section === sectionKey).sort((a, b) => (a.order || 0) - (b.order || 0))
            : footerMenus[sectionKey] || [];
            
        const currentIndex = sectionMenus.findIndex(m => m._id === menu._id);
        const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        
        if (adjacentIndex < 0 || adjacentIndex >= sectionMenus.length) return;
        
        const adjacentMenu = sectionMenus[adjacentIndex];
        
        let newOrder = adjacentMenu.order || 0;
        let adjacentNewOrder = menu.order || 0;
        
        if (newOrder === adjacentNewOrder) {
            newOrder = direction === 'up' ? menu.order - 1 : menu.order + 1;
            adjacentNewOrder = menu.order;
        }

        try {
            const token = getAdminToken();
            if (!token) return toast.error('Admin authentication required');
            
            const updateState = (menus) => {
                const updated = [...menus];
                const menuInState = updated.find(m => m._id === menu._id);
                const adjInState = updated.find(m => m._id === adjacentMenu._id);
                if(menuInState) menuInState.order = newOrder;
                if(adjInState) adjInState.order = adjacentNewOrder;
                return updated;
            };

            if (activeTab === 'header') {
                setHeaderMenus(prev => updateState(prev));
                const res1 = await menuAPI.updateHeaderMenu(menu._id, { ...menu, order: newOrder }, token);
                const res2 = await menuAPI.updateHeaderMenu(adjacentMenu._id, { ...adjacentMenu, order: adjacentNewOrder }, token);
                if(!res1.success || !res2.success) throw new Error("Failed to update");
            } else {
                setFooterMenus(prev => ({
                    ...prev,
                    [sectionKey]: updateState(prev[sectionKey] || [])
                }));
                const res1 = await menuAPI.updateFooterMenu(menu._id, { ...menu, order: newOrder, section: sectionKey }, token);
                const res2 = await menuAPI.updateFooterMenu(adjacentMenu._id, { ...adjacentMenu, order: adjacentNewOrder, section: sectionKey }, token);
                if(!res1.success || !res2.success) throw new Error("Failed to update");
            }
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };



    // Handle social media save
    const handleSocialMediaSave = async () => {
        try {
            if (!hasUpdatePermission) {
                toast.error("You don't have permission to update settings");
                return;
            }
            const token = getAdminToken();
            if (!token) {
                toast.error('Admin authentication required');
                return;
            }

            // Validate URLs before saving
            const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin'];
            const validUrls = [];

            for (const platform of socialPlatforms) {
                const data = socialMediaData[platform];
                if (data.url.trim()) {
                    let validUrl = data.url.trim();

                    // Add https:// if no protocol is present
                    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
                        validUrl = `https://${validUrl}`;
                    }

                    // Basic URL validation
                    try {
                        new URL(validUrl);
                        validUrls.push({ platform, url: validUrl, isActive: data.isActive, openInNewTab: data.openInNewTab });
                    } catch (error) {
                        toast.error(`Invalid URL for ${platform}: ${data.url}`);
                        return;
                    }
                }
            }

            // Delete existing social media menus first
            const existingSocialMenus = footerMenus.socialMedia || [];
            for (const menu of existingSocialMenus) {
                await menuAPI.deleteFooterMenu(menu._id, token);
            }

            // Create new social media menus with validated URLs
            for (const { platform, url, isActive, openInNewTab } of validUrls) {
                await menuAPI.createFooterMenu({
                    section: 'socialMedia',
                    name: platform.charAt(0).toUpperCase() + platform.slice(1),
                    href: url,
                    isActive: isActive,
                    order: socialPlatforms.indexOf(platform),
                    isVisible: true,
                    target: openInNewTab ? '_blank' : '_self',
                    socialPlatform: platform
                }, token);
            }

            toast.success('Social media links updated successfully');
            fetchMenus(); // Refresh data
        } catch (error) {
            console.error('Error saving social media:', error);
            toast.error('Failed to save social media links');
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            href: '',
            isActive: false,
            order: 0,
            isVisible: true,
            target: '_self',
            icon: '',
            description: '',
            section: 'quickLinks',
            contactType: '',
            socialPlatform: ''
        });
    };

    const handleNewMenu = () => {
        setEditingMenu(null);
        resetForm();
        
        let initialSection = activeTab === 'header' ? 'leftMenu' : 'quickLinks';
        let sectionMenus = activeTab === 'header' 
            ? headerMenus.filter(m => m.section === initialSection)
            : footerMenus[initialSection] || [];
            
        const maxOrder = sectionMenus.length > 0 ? Math.max(...sectionMenus.map(menu => menu.order || 0)) : 0;
        
        setFormData(prev => ({ 
            ...prev, 
            section: initialSection,
            order: maxOrder + 1
        }));
        
        setShowForm(true);
    };

    // Handle new menu for specific section
    const handleNewMenuForSection = (sectionKey) => {
        setEditingMenu(null);

        // Get the highest order in this section and increment by 1
        let sectionMenus = activeTab === 'header'
            ? headerMenus.filter(m => m.section === sectionKey)
            : footerMenus[sectionKey] || [];
            
        const maxOrder = sectionMenus.length > 0 ? Math.max(...sectionMenus.map(menu => menu.order || 0)) : 0;
        const nextOrder = maxOrder + 1;

        setFormData({
            name: '',
            href: '',
            isActive: false,
            order: nextOrder,
            isVisible: true,
            target: '_self',
            icon: '',
            description: '',
            section: sectionKey,
            contactType: '',
            socialPlatform: ''
        });
        setShowForm(true);
    };

    // Handle cancel
    const handleCancel = () => {
        setShowForm(false);
        setEditingMenu(null);
        resetForm();
    };

    // Get current menus based on active tab
    const getCurrentMenus = () => {
        if (activeTab === 'header') {
            return headerMenus;
        } else {
            return footerMenus[formData.section] || [];
        }
    };

    // Handle category update
    const handleCategoryUpdate = async (id, field, value) => {
        try {
            if (!hasUpdatePermission) {
                toast.error("You don't have permission to update settings");
                return;
            }

            // Optimistic update
            setCategories(prev => prev.map(cat =>
                cat._id === id ? { ...cat, [field]: value } : cat
            ));

            const response = await categoryAPI.updateCategory(id, { [field]: value });
            if (response.success) {
                toast.success('Category updated successfully');
            } else {
                toast.error('Failed to update category');
                fetchMenus(); // Revert on failure
            }
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
            fetchMenus(); // Revert on failure
        }
    };

    const saveCategoryOrder = async (updatedCategories) => {
        try {
            const orderData = updatedCategories.map((cat, i) => ({ id: cat._id, sortOrder: i }));
            // Using existing reorder API or updating them one by one.
            // Since categoryAPI.reorderCategories uses 'sortOrder', but we are modifying 'headerSortOrder', we might need to modify the backend or just call updateCategory in a loop.
            // Actually, we can use a Promise.all to update headerSortOrder for all changed categories.
            const promises = updatedCategories.map((cat, i) =>
                categoryAPI.updateCategory(cat._id, { headerSortOrder: i })
            );
            await Promise.all(promises);
            toast.success('Categories reordered successfully');
        } catch (error) {
            console.error('Error reordering:', error);
            toast.error('Error reordering categories');
            fetchMenus();
        }
    }

    const handleCategoryMoveUp = (index) => {
        if (index === 0) return;
        const sortedCats = [...categories].sort((a, b) => (a.headerSortOrder || 0) - (b.headerSortOrder || 0));
        const temp = sortedCats[index];
        sortedCats[index] = sortedCats[index - 1];
        sortedCats[index - 1] = temp;

        sortedCats.forEach((cat, i) => cat.headerSortOrder = i);
        setCategories(sortedCats);
        saveCategoryOrder(sortedCats);
    }

    const handleCategoryMoveDown = (index) => {
        const sortedCats = [...categories].sort((a, b) => (a.headerSortOrder || 0) - (b.headerSortOrder || 0));
        if (index === sortedCats.length - 1) return;
        const temp = sortedCats[index];
        sortedCats[index] = sortedCats[index + 1];
        sortedCats[index + 1] = temp;

        sortedCats.forEach((cat, i) => cat.headerSortOrder = i);
        setCategories(sortedCats);
        saveCategoryOrder(sortedCats);
    }

    // Get all footer sections for display (excluding social media)
    const getHeaderSections = () => {
        const sections = ['leftMenu', 'rightMenu'];
        return sections.map(section => ({
            key: section,
            name: section === 'leftMenu' ? 'Left Menu' : 'Right Menu',
            menus: headerMenus.filter(m => m.section === section).sort((a, b) => (a.order || 0) - (b.order || 0))
        }));
    };

    const getFooterSections = () => {
        const sections = ['quickLinks', 'utilities', 'about', 'contact', 'socialMedia'];
        return sections.map(section => ({
            key: section,
            name: section === 'quickLinks' ? 'Quick Links' :
                section === 'utilities' ? 'Utilities' :
                    section === 'about' ? 'About' : 
                        section === 'contact' ? 'Contact Information' : section,
            menus: footerMenus[section] || []
        }));
    };

    if (checkingPermission || contextLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!hasReadPermission || permissionError) {
        return (
            <PermissionDenied
                title="Access Denied"
                message={permissionError || "You don't have permission to access menu settings"}
                action="Contact your administrator for access"
                showBackButton={true}
            />
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Management</h1>
                <p className="text-gray-600">Manage header and footer navigation menus</p>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('categories')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Header Categories
                        </button>
                        <button
                            onClick={() => setActiveTab('header')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'header'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Header Menus
                        </button>
                        <button
                            onClick={() => setActiveTab('footer')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'footer'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Footer Menu
                        </button>
                    </nav>
                </div>
            </div>


            {/* Add New Button */}
            <div className="mb-6">
                {activeTab === 'categories' ? (
                    <div className="text-sm text-gray-600">
                        Toggle the categories you want to display on the frontend header, and set their ordering.
                    </div>
                ) : activeTab === 'header' ? (
                    hasUpdatePermission && (
                        <button
                            onClick={handleNewMenu}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Header Menu Item
                        </button>
                    )
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 self-center mr-2">Add new menu item to:</span>
                        {hasUpdatePermission && getFooterSections().map((section) => (
                            <button
                                key={section.key}
                                onClick={() => handleNewMenuForSection(section.key)}
                                className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                {section.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Menu List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading menus...</p>
                </div>
            ) : activeTab === 'header' ? (
                <div className="space-y-6">
                    {/* Video Menu Section */}
                    {hasUpdatePermission && (
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Video className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-medium text-gray-900">Dynamic Video Menu</h3>
                                </div>
                                <button
                                    onClick={() => handleVideoMenuChange({ target: { name: 'isEnabled', type: 'checkbox', checked: !videoMenu.isEnabled } })}
                                    className={`${videoMenu.isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                                >
                                    <span
                                        className={`${videoMenu.isEnabled ? 'translate-x-5' : 'translate-x-0'
                                            } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </button>
                            </div>

                            {videoMenu.isEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={videoMenu.name}
                                            onChange={handleVideoMenuChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">URL (Default: /videos)</label>
                                        <input
                                            type="text"
                                            name="url"
                                            value={videoMenu.url}
                                            onChange={handleVideoMenuChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                name="backgroundColor"
                                                value={videoMenu.backgroundColor}
                                                onChange={handleVideoMenuChange}
                                                className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                name="backgroundColor"
                                                value={videoMenu.backgroundColor}
                                                onChange={handleVideoMenuChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                name="textColor"
                                                value={videoMenu.textColor}
                                                onChange={handleVideoMenuChange}
                                                className="h-10 w-10 border border-gray-300 rounded-md cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                name="textColor"
                                                value={videoMenu.textColor}
                                                onChange={handleVideoMenuChange}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tailwind CSS Classes (Optional)</label>
                                        <input
                                            type="text"
                                            name="tailwindClasses"
                                            value={videoMenu.tailwindClasses}
                                            onChange={handleVideoMenuChange}
                                            placeholder="e.g. animate-bounce shadow-xl hover:scale-110"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Custom tailwind classes will be added to the button.</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSaveVideoMenu}
                                    disabled={savingVideoMenu}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                                >
                                    {savingVideoMenu ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Video Menu
                                </button>
                            </div>
                        </div>
                    )}

                    {getHeaderSections().map((section) => (
                        <div key={section.key} className="bg-white shadow overflow-hidden sm:rounded-md">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {section.menus.length} menu item{section.menus.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {section.menus.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {section.menus.map((menu, index) => (
                                        <li key={menu._id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{menu.name}</p>
                                                        <p className="text-sm text-gray-500">{menu.href}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${menu.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {menu.isVisible ? 'Visible' : 'Hidden'}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${menu.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {menu.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">Order: {menu.order}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 sm:space-x-2">
                                                    {hasUpdatePermission && (
                                                        <>
                                                            <button
                                                                onClick={() => handleMoveOrder(menu, 'up', section.key)}
                                                                disabled={index === 0}
                                                                title="Move Up"
                                                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 border ${index === 0 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300 cursor-pointer'}`}
                                                            >
                                                                <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMoveOrder(menu, 'down', section.key)}
                                                                disabled={index === section.menus.length - 1}
                                                                title="Move Down"
                                                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 border ${index === section.menus.length - 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300 cursor-pointer'}`}
                                                            >
                                                                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {hasUpdatePermission && (
                                                        <button
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, section: section.key }));
                                                                handleEdit(menu);
                                                            }}
                                                            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-full transition-all duration-200 cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </button>
                                                    )}
                                                    {hasUpdatePermission && (
                                                        <button
                                                            onClick={() => handleDeleteClick(menu)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-full transition-all duration-200 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    <p>No menu items in this section</p>
                                    {hasUpdatePermission && (
                                        <button
                                            onClick={() => handleNewMenuForSection(section.key)}
                                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Add first menu item
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    {getFooterSections().map((section) => (
                        <div key={section.key} className="bg-white shadow overflow-hidden sm:rounded-md">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">{section.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {section.menus.length} menu item{section.menus.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {section.menus.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {section.menus.map((menu, index) => (
                                        <li key={menu._id} className="px-6 py-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <GripVertical className="w-5 h-5 text-gray-400 mr-3" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{menu.name}</p>
                                                        <p className="text-sm text-gray-500">{menu.href}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${menu.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {menu.isVisible ? 'Visible' : 'Hidden'}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${menu.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {menu.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">Order: {menu.order}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 sm:space-x-2">
                                                    {hasUpdatePermission && (
                                                        <>
                                                            <button
                                                                onClick={() => handleMoveOrder(menu, 'up', section.key)}
                                                                disabled={index === 0}
                                                                title="Move Up"
                                                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 border ${index === 0 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300 cursor-pointer'}`}
                                                            >
                                                                <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleMoveOrder(menu, 'down', section.key)}
                                                                disabled={index === section.menus.length - 1}
                                                                title="Move Down"
                                                                className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 border ${index === section.menus.length - 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300 cursor-pointer'}`}
                                                            >
                                                                <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {hasUpdatePermission && (
                                                        <button
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, section: section.key }));
                                                                handleEdit(menu);
                                                            }}
                                                            className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-300 hover:border-blue-300 rounded-full transition-all duration-200 cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </button>
                                                    )}
                                                    {hasUpdatePermission && (
                                                        <button
                                                            onClick={() => handleDeleteClick(menu)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-300 rounded-full transition-all duration-200 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    <p>No menu items in this section</p>
                                    {hasUpdatePermission && (
                                        <button
                                            onClick={() => handleNewMenuForSection(section.key)}
                                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Add first menu item
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && hasUpdatePermission && (
                <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-6 border w-full max-w-md shadow-xl rounded-lg bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {editingMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
                                    </h3>
                                    {(activeTab === 'footer' || activeTab === 'header') && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Adding to: <span className="font-medium text-blue-600">
                                                {activeTab === 'header' ? (
                                                    formData.section === 'leftMenu' ? 'Left Menu' : 'Right Menu'
                                                ) : (
                                                    formData.section === 'quickLinks' ? 'Quick Links' :
                                                        formData.section === 'utilities' ? 'Utilities' :
                                                            formData.section === 'about' ? 'About' :
                                                                formData.section === 'contact' ? 'Contact' :
                                                                    formData.section === 'socialMedia' ? 'Social Media' : formData.section
                                                )}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {formData.section === 'contact' ? 'Label (Optional)' : 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                        required={formData.section !== 'contact'}
                                        placeholder={formData.section === 'contact' ? 'e.g. Head Office (Leave empty to hide label)' : ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {formData.section === 'contact' 
                                            ? (formData.contactType === 'address' ? 'Address' 
                                                : formData.contactType === 'phone' ? 'Phone Number' 
                                                : formData.contactType === 'email' ? 'Email Address' 
                                                : 'Contact Value') 
                                            : 'URL'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.href}
                                        onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                        required
                                        placeholder={formData.section === 'contact' ? 'Enter contact details here...' : ''}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Order</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Menu display order"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                                </div>

                                {activeTab === 'header' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Section</label>
                                        <select
                                            value={formData.section}
                                            onChange={(e) => {
                                                const newSection = e.target.value;
                                                setFormData(prev => {
                                                    const newData = { ...prev, section: newSection };
                                                    if (!editingMenu) {
                                                        const sectionMenus = headerMenus.filter(m => m.section === newSection);
                                                        const maxOrder = sectionMenus.length > 0 ? Math.max(...sectionMenus.map(menu => menu.order || 0)) : 0;
                                                        newData.order = maxOrder + 1;
                                                    }
                                                    return newData;
                                                });
                                            }}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                            required
                                            disabled={editingMenu || (formData.section !== 'leftMenu' && formData.section !== 'rightMenu') ? true : false}
                                        >
                                            <option value="leftMenu">Left Menu</option>
                                            <option value="rightMenu">Right Menu</option>
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Section is automatically set based on your selection</p>
                                    </div>
                                )}

                                {activeTab === 'footer' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Section</label>
                                            <select
                                                value={formData.section}
                                                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm bg-gray-100"
                                                required
                                                disabled
                                            >
                                                <option value="quickLinks">Quick Links</option>
                                                <option value="utilities">Utilities</option>
                                                <option value="about">About</option>
                                                <option value="contact">Contact</option>
                                                <option value="socialMedia">Social Media</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Section is automatically set based on your selection</p>
                                        </div>
                                        {formData.section === 'contact' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Contact Type</label>
                                                <select
                                                    value={formData.contactType}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, contactType: e.target.value }))}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                                    required
                                                >
                                                    <option value="">Select a type</option>
                                                    <option value="address">Address</option>
                                                    <option value="phone">Phone</option>
                                                    <option value="email">Email</option>
                                                    <option value="callToAction">Call to Action</option>
                                                </select>
                                                <p className="mt-1 text-xs text-gray-500">Select what type of contact this is (determines icon)</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Target</label>
                                    <select
                                        value={formData.target}
                                        onChange={(e) => setFormData(prev => ({ ...prev, target: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="_self">Same Window</option>
                                        <option value="_blank">New Window</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isVisible}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-pink-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Visible</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-pink-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors inline-flex items-center"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {editingMenu ? 'Update Menu' : 'Create Menu'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}



            {/* Social Media Management Section - Only for Footer Tab */}
            {activeTab === 'footer' && (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
                        <p className="text-sm text-gray-500">Manage social media links for footer</p>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(socialMediaData).map(([platform, data]) => (
                                <div key={platform} className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            {platform === 'facebook' && <Facebook className="w-4 h-4 text-blue-600" />}
                                            {platform === 'twitter' && <Twitter className="w-4 h-4 text-blue-400" />}
                                            {platform === 'instagram' && <Instagram className="w-4 h-4 text-blue-600" />}
                                            {platform === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-700" />}
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 capitalize">{platform}</h4>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL
                                        </label>
                                        <input
                                            type="text"
                                            value={data.url}
                                            onChange={(e) => {
                                                setSocialMediaData(prev => ({
                                                    ...prev,
                                                    [platform]: { ...prev[platform], url: e.target.value }
                                                }));
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-blue-500 sm:text-sm"
                                            placeholder={`${platform}.com/your-page`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.isActive}
                                                onChange={(e) => setSocialMediaData(prev => ({
                                                    ...prev,
                                                    [platform]: { ...prev[platform], isActive: e.target.checked }
                                                }))}
                                                className="h-4 w-4 text-blue-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Show in footer
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.openInNewTab}
                                                onChange={(e) => setSocialMediaData(prev => ({
                                                    ...prev,
                                                    [platform]: { ...prev[platform], openInNewTab: e.target.checked }
                                                }))}
                                                className="h-4 w-4 text-blue-600 focus:ring-pink-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 text-sm text-gray-700">
                                                Open in new tab
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {hasUpdatePermission && (
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSocialMediaSave}
                                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors cursor-pointer"
                                >
                                    Save Social Media Links
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title={`Delete ${activeTab === 'header' ? 'Header' : 'Footer'} Menu`}
                message={`Are you sure you want to delete this ${activeTab === 'header' ? 'header' : 'footer'} menu item?`}
                itemName={menuToDelete?.name}
                itemType="menu item"
                isLoading={deleting}
                confirmText="Delete Menu"
                cancelText="Cancel"
                dangerLevel="high"
            />
        </div>
    );
}

