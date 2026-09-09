export default function SectionSettingsCard({ title, sectionKey, settings, setSettings, isDynamic = false, onDelete = null }) {
    const config = isDynamic 
        ? settings.dynamicCategories.find(c => c.categoryId === sectionKey) 
        : settings[sectionKey];

    if (!config) return null;

    const updateConfig = (updates) => {
        if (isDynamic) {
            setSettings({
                ...settings,
                dynamicCategories: settings.dynamicCategories.map(c => 
                    c.categoryId === sectionKey ? { ...c, ...updates } : c
                )
            });
        } else {
            setSettings({
                ...settings,
                [sectionKey]: { ...config, ...updates }
            });
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <div className="flex items-center gap-4">
                    {onDelete && (
                        <button 
                            onClick={onDelete}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                            Remove
                        </button>
                    )}
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={config.isVisible}
                            onChange={(e) => updateConfig({ isVisible: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            {config.isVisible ? 'Visible' : 'Hidden'}
                        </span>
                    </label>
                </div>
            </div>
            
            <div className={`p-6 space-y-6 ${!config.isVisible ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Style</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${config.displayType === 'grid' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input 
                                type="radio" 
                                name={`${sectionKey}_display`} 
                                value="grid" 
                                checked={config.displayType === 'grid'}
                                onChange={(e) => updateConfig({ displayType: e.target.value })}
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
                        <label className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center gap-2 transition-colors ${config.displayType === 'slider' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input 
                                type="radio" 
                                name={`${sectionKey}_display`} 
                                value="slider" 
                                checked={config.displayType === 'slider'}
                                onChange={(e) => updateConfig({ displayType: e.target.value })}
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
                        value={config.sortOrder}
                        onChange={(e) => updateConfig({ sortOrder: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="latest">Latest First</option>
                        <option value="random">Randomize</option>
                    </select>
                </div>

                {config.displayType === 'slider' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Load in Slider</label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={config.maxProducts || 10}
                            onChange={(e) => updateConfig({ maxProducts: parseInt(e.target.value) || 10 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                ) : (
                    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.hasPagination || false}
                                onChange={(e) => updateConfig({ hasPagination: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <div>
                                <span className="block text-sm font-medium text-gray-900">Enable "Load More" Pagination</span>
                                <span className="block text-xs text-gray-500">Allow users to load more products in the grid</span>
                            </div>
                        </label>

                        {config.hasPagination ? (
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Products Per Page</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={config.productsPerPage || 10}
                                        onChange={(e) => updateConfig({ productsPerPage: parseInt(e.target.value) || 10 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Pages Allowed</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={config.maxPages || 3}
                                        onChange={(e) => updateConfig({ maxPages: parseInt(e.target.value) || 3 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Products to Show Initially</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={config.maxProducts || 10}
                                    onChange={(e) => updateConfig({ maxProducts: parseInt(e.target.value) || 10 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
