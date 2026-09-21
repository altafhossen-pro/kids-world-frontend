import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2, ChevronDown } from 'lucide-react';
import { productAPI } from '@/services/api';
import { getCookie } from 'cookies-next';

export default function BasicInfoTab({ 
    formData, 
    handleInputChange, 
    categories, 
    tagInput, 
    setTagInput, 
    handleTagInputKeyPress, 
    addTag, 
    removeTag, 
    generateSlug 
}) {
    const [descSearchQuery, setDescSearchQuery] = useState('');
    const [descSearchResults, setDescSearchResults] = useState([]);
    const [isSearchingDesc, setIsSearchingDesc] = useState(false);
    const [showDescSuggestions, setShowDescSuggestions] = useState(false);
    const searchRef = useRef(null);

    const [shortDescSearchQuery, setShortDescSearchQuery] = useState('');
    const [shortDescSearchResults, setShortDescSearchResults] = useState([]);
    const [isSearchingShortDesc, setIsSearchingShortDesc] = useState(false);
    const [showShortDescSuggestions, setShowShortDescSuggestions] = useState(false);
    const shortDescSearchRef = useRef(null);

    const [announcementSearchQuery, setAnnouncementSearchQuery] = useState('');
    const [announcementSearchResults, setAnnouncementSearchResults] = useState([]);
    const [isSearchingAnnouncement, setIsSearchingAnnouncement] = useState(false);
    const [showAnnouncementSuggestions, setShowAnnouncementSuggestions] = useState(false);
    const announcementSearchRef = useRef(null);

    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [categorySearchTerm, setCategorySearchTerm] = useState('');
    const categoryDropdownRef = useRef(null);

    // Handle outside click to close suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDescSuggestions(false);
            }
            if (shortDescSearchRef.current && !shortDescSearchRef.current.contains(event.target)) {
                setShowShortDescSuggestions(false);
            }
            if (announcementSearchRef.current && !announcementSearchRef.current.contains(event.target)) {
                setShowAnnouncementSuggestions(false);
            }
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCategoryDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchProducts = async () => {
            if (!descSearchQuery.trim()) {
                setDescSearchResults([]);
                return;
            }
            
            setIsSearchingDesc(true);
            try {
                const token = getCookie('token');
                const response = await productAPI.getAdminProducts({ 
                    search: descSearchQuery, 
                    limit: 5,
                    sort: 'createdAt',
                    order: 'desc'
                }, token);
                
                if (response.success) {
                    const products = Array.isArray(response.data) ? response.data : (response.data?.products || []);
                    setDescSearchResults(products);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsSearchingDesc(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchProducts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [descSearchQuery]);

    useEffect(() => {
        const searchProducts = async () => {
            if (!shortDescSearchQuery.trim()) {
                setShortDescSearchResults([]);
                return;
            }
            
            setIsSearchingShortDesc(true);
            try {
                const token = getCookie('token');
                const response = await productAPI.getAdminProducts({ 
                    search: shortDescSearchQuery, 
                    limit: 5,
                    sort: 'createdAt',
                    order: 'desc'
                }, token);
                
                if (response.success) {
                    const products = Array.isArray(response.data) ? response.data : (response.data?.products || []);
                    setShortDescSearchResults(products);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsSearchingShortDesc(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchProducts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [shortDescSearchQuery]);

    useEffect(() => {
        const searchProducts = async () => {
            if (!announcementSearchQuery.trim()) {
                setAnnouncementSearchResults([]);
                return;
            }
            
            setIsSearchingAnnouncement(true);
            try {
                const token = getCookie('token');
                const response = await productAPI.getAdminProducts({ 
                    search: announcementSearchQuery, 
                    limit: 5,
                    sort: 'createdAt',
                    order: 'desc'
                }, token);
                
                if (response.success) {
                    const products = Array.isArray(response.data) ? response.data : (response.data?.products || []);
                    setAnnouncementSearchResults(products);
                }
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setIsSearchingAnnouncement(false);
            }
        };

        const timeoutId = setTimeout(() => {
            searchProducts();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [announcementSearchQuery]);

    const handleSelectDescription = (product) => {
        handleInputChange({
            target: {
                name: 'description',
                value: product.description || ''
            }
        });
        setDescSearchQuery('');
        setShowDescSuggestions(false);
    };

    const handleSelectShortDescription = (product) => {
        handleInputChange({
            target: {
                name: 'shortDescription',
                value: product.shortDescription || ''
            }
        });
        setShortDescSearchQuery('');
        setShowShortDescSuggestions(false);
    };

    const handleSelectAnnouncement = (product) => {
        handleInputChange({
            target: {
                name: 'announcementText',
                value: product.announcementText || ''
            }
        });
        setAnnouncementSearchQuery('');
        setShowAnnouncementSuggestions(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                {/* 
                <div>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between text-sm font-medium text-gray-700">
                          <span>Product Subtitle</span>
                          <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Use Global Subtitle</span>
                              <button
                                  type="button"
                                  onClick={() => handleInputChange({ target: { name: 'isGlobalSubtitleOn', type: 'checkbox', checked: !formData.isGlobalSubtitleOn } })}
                                  className={`${
                                      formData.isGlobalSubtitleOn ? 'bg-blue-600' : 'bg-gray-200'
                                  } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                              >
                                  <span
                                      className={`${
                                          formData.isGlobalSubtitleOn ? 'translate-x-4' : 'translate-x-0'
                                      } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                  />
                              </button>
                          </div>
                      </label>
                      <input
                          type="text"
                          name="customSubtitle"
                          value={formData.customSubtitle || ''}
                          onChange={handleInputChange}
                          placeholder={formData.isGlobalSubtitleOn ? "Using global subtitle..." : "Custom subtitle"}
                          disabled={formData.isGlobalSubtitleOn}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      />
                  </div>
                </div>
                */}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                    </label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            type="button"
                            onClick={generateSlug}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors"
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <div className="relative" ref={categoryDropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    
                    <div 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white flex justify-between items-center focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    >
                        <span className={formData.category ? "text-gray-900" : "text-gray-500"}>
                            {formData.category ? categories.find(c => c._id === formData.category)?.name || 'Unknown Category' : 'Select Category'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {isCategoryDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                            <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search category..."
                                        value={categorySearchTerm}
                                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-60 overflow-y-auto py-1">
                                <div 
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${!formData.category ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}`}
                                    onClick={() => {
                                        handleInputChange({ target: { name: 'category', value: '' } });
                                        setIsCategoryDropdownOpen(false);
                                    }}
                                >
                                    Select Category
                                </div>
                                {categories
                                    .filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase()))
                                    .map(category => (
                                        <div 
                                            key={category._id}
                                            onClick={() => {
                                                handleInputChange({ target: { name: 'category', value: category._id } });
                                                setIsCategoryDropdownOpen(false);
                                                setCategorySearchTerm('');
                                            }}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-0 ${formData.category === category._id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                                        >
                                            {category.name}
                                        </div>
                                ))}
                                {categories.filter(c => c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).length === 0 && (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        No categories found.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                    </label>
                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Sold
                    </label>
                    <input
                        type="number"
                        name="totalSold"
                        value={formData.totalSold}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Sales Analytics (Dynamic Simulated Growth) */}
            <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Dynamic Sales Analytics</h3>
                        <p className="text-xs text-gray-500 mt-1">Enable this to simulate daily automatic growth of the total sold count.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.salesAnalytics?.isActive || false}
                            onChange={(e) => handleInputChange({
                                target: {
                                    name: 'salesAnalytics',
                                    value: { ...formData.salesAnalytics, isActive: e.target.checked }
                                }
                            })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {formData.salesAnalytics?.isActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.salesAnalytics?.startDate || ''}
                                onChange={(e) => handleInputChange({
                                    target: {
                                        name: 'salesAnalytics',
                                        value: { ...formData.salesAnalytics, startDate: e.target.value }
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sales increment will calculate from this date.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Average Sales</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.salesAnalytics?.dailyAverage || 0}
                                onChange={(e) => handleInputChange({
                                    target: {
                                        name: 'salesAnalytics',
                                        value: { ...formData.salesAnalytics, dailyAverage: Number(e.target.value) }
                                    }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Approximate number of sales added per day.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                    </label>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={handleTagInputKeyPress}
                                placeholder="Type tag and press Enter"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={addTag}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                Add
                            </button>
                        </div>
                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-2 text-gray-500 hover:text-red-600 cursor-pointer"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Short Description
                    </label>
                    
                    <div className="relative" ref={shortDescSearchRef}>
                        <div className="flex items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search short description..."
                                    value={shortDescSearchQuery}
                                    onChange={(e) => {
                                        setShortDescSearchQuery(e.target.value);
                                        setShowShortDescSuggestions(true);
                                    }}
                                    onFocus={() => setShowShortDescSuggestions(true)}
                                    className="pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 md:w-80"
                                />
                                {isSearchingShortDesc && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {showShortDescSuggestions && shortDescSearchQuery.trim() !== '' && (
                            <div className="absolute right-0 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                {shortDescSearchResults.length > 0 ? (
                                    <div className="py-1">
                                        {shortDescSearchResults.map(prod => (
                                            <div 
                                                key={prod._id}
                                                onClick={() => handleSelectShortDescription(prod)}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate">{prod.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {prod.shortDescription ? prod.shortDescription.substring(0, 80) + '...' : 'No short description available'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isSearchingShortDesc && (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            No products found matching "{shortDescSearchQuery}"
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the product"
                />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Full Description (Optional)
                    </label>
                    
                    <div className="relative" ref={searchRef}>
                        <div className="flex items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search description from existing products..."
                                    value={descSearchQuery}
                                    onChange={(e) => {
                                        setDescSearchQuery(e.target.value);
                                        setShowDescSuggestions(true);
                                    }}
                                    onFocus={() => setShowDescSuggestions(true)}
                                    className="pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 md:w-80"
                                />
                                {isSearchingDesc && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {showDescSuggestions && descSearchQuery.trim() !== '' && (
                            <div className="absolute right-0 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                {descSearchResults.length > 0 ? (
                                    <div className="py-1">
                                        {descSearchResults.map(prod => (
                                            <div 
                                                key={prod._id}
                                                onClick={() => handleSelectDescription(prod)}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate">{prod.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {prod.description ? prod.description.substring(0, 80) + '...' : 'No description available'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isSearchingDesc && (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            No products found matching "{descSearchQuery}"
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detailed description of the product"
                />
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Announcement / Instruction Text (Optional)
                    </label>
                    
                    <div className="relative" ref={announcementSearchRef}>
                        <div className="flex items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search announcement text..."
                                    value={announcementSearchQuery}
                                    onChange={(e) => {
                                        setAnnouncementSearchQuery(e.target.value);
                                        setShowAnnouncementSuggestions(true);
                                    }}
                                    onFocus={() => setShowAnnouncementSuggestions(true)}
                                    className="pl-9 pr-8 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 md:w-80"
                                />
                                {isSearchingAnnouncement && (
                                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {showAnnouncementSuggestions && announcementSearchQuery.trim() !== '' && (
                            <div className="absolute right-0 mt-1 w-full sm:w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                {announcementSearchResults.length > 0 ? (
                                    <div className="py-1">
                                        {announcementSearchResults.map(prod => (
                                            <div 
                                                key={prod._id}
                                                onClick={() => handleSelectAnnouncement(prod)}
                                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900 truncate">{prod.title}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {prod.announcementText ? prod.announcementText.substring(0, 80) + '...' : 'No announcement text available'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !isSearchingAnnouncement && (
                                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                            No products found matching "{announcementSearchQuery}"
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <textarea
                    name="announcementText"
                    value={formData.announcementText || ''}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Dynamic text to display below the Buy Now button"
                />
            </div>
        </div>
    );
}
