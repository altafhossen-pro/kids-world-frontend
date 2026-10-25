export const formatProductName = (title, subtitle) => {
    if (!subtitle) return title;
    
    // If subtitle contains the placeholder, replace it with the title
    // and don't prepend the title again.
    if (subtitle.includes('$subtitleName') || subtitle.includes('$productName')) {
        return subtitle.replace(/\$(subtitleName|productName)/g, title);
    }
    
    // Otherwise, prepend the title to the subtitle
    return `${title} ${subtitle}`;
};

/**
 * Safely extracts the display price and original (strikethrough) price for any product.
 * Handles variants (filtering out invalid/zero prices), singleVariants, calculatedPriceRange,
 * priceRange, basePrice, price, salePrice, and originalPrice.
 * @param {Object} product
 * @returns {{ price: number, originalPrice: number, hasDiscount: boolean }}
 */
export const getProductPrice = (product) => {
    if (!product) return { price: 0, originalPrice: 0, hasDiscount: false };

    // 1. Gather all variant prices > 0
    const validVariants = (product.variants || []).filter(v => {
        const p = v?.currentPrice ?? v?.salePrice ?? v?.price;
        return typeof p === 'number' && p > 0;
    });

    let variantPrice = 0;
    let variantOriginalPrice = 0;

    if (validVariants.length > 0) {
        // Find variant with the lowest positive price
        const lowest = validVariants.reduce((min, curr) => {
            const currP = curr.currentPrice ?? curr.salePrice ?? curr.price ?? 0;
            const minP = min.currentPrice ?? min.salePrice ?? min.price ?? 0;
            return currP < minP ? curr : min;
        }, validVariants[0]);

        variantPrice = lowest.currentPrice ?? lowest.salePrice ?? lowest.price ?? 0;
        variantOriginalPrice = lowest.originalPrice ?? lowest.regularPrice ?? 0;
    }

    // 2. Single variant details (for simple products)
    const singlePrice = (product.singleVariant?.currentPrice ?? product.singleVariant?.salePrice ?? product.singleVariant?.price) || 0;
    const singleOriginalPrice = (product.singleVariant?.originalPrice ?? product.singleVariant?.regularPrice) || 0;

    // 3. Fallbacks: calculatedPriceRange, priceRange, basePrice, price, salePrice
    const fallbackPrice =
        product.calculatedPriceRange?.min ||
        product.priceRange?.min ||
        product.basePrice ||
        product.salePrice ||
        product.price ||
        0;

    const fallbackOriginalPrice =
        product.originalPrice ||
        product.regularPrice ||
        product.basePrice ||
        product.calculatedPriceRange?.max ||
        product.priceRange?.max ||
        0;

    const finalPrice = variantPrice || singlePrice || fallbackPrice || 0;
    const rawOriginalPrice = variantOriginalPrice || singleOriginalPrice || (fallbackOriginalPrice > finalPrice ? fallbackOriginalPrice : 0);
    const finalOriginalPrice = rawOriginalPrice > finalPrice ? rawOriginalPrice : 0;

    return {
        price: finalPrice,
        originalPrice: finalOriginalPrice,
        hasDiscount: finalOriginalPrice > finalPrice
    };
};

