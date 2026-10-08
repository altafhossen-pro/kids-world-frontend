import NewProductDetails from '@/components/NewProductDetails/NewProductDetails';
import React from 'react';
import { siteConfig } from '@/config/siteConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Server-side helper to fetch product details for SEO
async function fetchProductData(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/product/slug/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.success ? data.data : null;
  } catch (err) {
    console.error('Error fetching product for SEO:', err);
    return null;
  }
}

// Generate Dynamic SEO Metadata for Google and Social Platforms
export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const product = await fetchProductData(productSlug);
  const baseUrl = siteConfig.url || 'https://kidsworldbd.com';
  const canonicalUrl = `${baseUrl}/product/${productSlug}`;

  if (!product) {
    return {
      title: `Product Not Found | ${siteConfig.name}`,
      description: 'The requested product could not be found.',
      robots: { index: false, follow: false },
    };
  }

  // Title priority: Custom SEO Meta Title -> Product Title + Custom Subtitle -> Default
  const title = product.seo?.metaTitle?.trim() 
    || `${product.title}${product.customSubtitle ? ` - ${product.customSubtitle}` : ''} | ${siteConfig.name}`;

  // Description priority: Custom SEO Meta Description -> Short Description -> Stripped HTML Description -> Default
  const rawDescription = product.seo?.metaDescription?.trim()
    || product.shortDescription?.trim()
    || (product.description ? product.description.replace(/<[^>]+>/g, '').trim().slice(0, 160) : '')
    || `${product.title} - Best price, fast delivery in Bangladesh from Kids World BD.`;

  // Clean description
  const description = rawDescription.slice(0, 170);

  // Featured Image / OG Image
  const ogImage = product.seo?.ogImage?.trim()
    || product.featuredImage?.trim()
    || (product.gallery && product.gallery.length > 0 ? product.gallery[0].url : '')
    || `${baseUrl}/images/logo.png`;

  // Keywords
  const categoryKeywords = [
    product.category?.name,
    ...(product.subCategories?.map(sub => sub.name) || []),
    product.brand
  ].filter(Boolean);

  const keywords = Array.from(new Set([
    ...(product.seo?.metaKeywords || []),
    ...(product.tags || []),
    ...categoryKeywords,
    'Kids World BD',
    'buy toys in bangladesh',
    'kids products online'
  ])).join(', ');

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: product.seo?.ogTitle?.trim() || title,
      description: product.seo?.ogDescription?.trim() || description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.social?.twitter?.site || '@kidsworldbd',
      creator: siteConfig.social?.twitter?.creator || '@kidsworldbd',
      title: product.seo?.ogTitle?.trim() || title,
      description: product.seo?.ogDescription?.trim() || description,
      images: [ogImage],
    },
  };
}

export default async function ProductPage({ params }) {
  const { productSlug } = await params;
  const product = await fetchProductData(productSlug);
  const baseUrl = siteConfig.url || 'https://kidsworldbd.com';

  // Construct JSON-LD Schema.org Structured Data
  let jsonLd = null;

  if (product) {
    // Determine price
    const isSingle = product.productType === 'simple' && product.singleVariant;
    const currentPrice = isSingle 
      ? (product.singleVariant?.salePrice || product.singleVariant?.currentPrice || 0)
      : (product.variants?.[0]?.salePrice || product.variants?.[0]?.currentPrice || product.basePrice || 0);

    const originalPrice = isSingle
      ? (product.singleVariant?.originalPrice || currentPrice)
      : (product.variants?.[0]?.originalPrice || currentPrice);

    // Collect all valid image URLs
    const productImages = [];
    if (product.featuredImage) productImages.push(product.featuredImage);
    if (product.gallery?.length) {
      product.gallery.forEach(img => {
        if (img?.url && !productImages.includes(img.url)) productImages.push(img.url);
      });
    }

    // Availability
    const isInStock = product.totalStock > 0 || (product.variants && product.variants.some(v => v.stockQuantity > 0));

    jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.title,
      "image": productImages.length > 0 ? productImages : [`${baseUrl}/images/logo.png`],
      "description": product.shortDescription?.trim() 
        || (product.description ? product.description.replace(/<[^>]+>/g, '').trim().slice(0, 300) : product.title),
      "sku": product.singleVariant?.sku || product.variants?.[0]?.sku || product.slug,
      "brand": {
        "@type": "Brand",
        "name": product.brand || siteConfig.name
      },
      "offers": {
        "@type": "Offer",
        "url": `${baseUrl}/product/${product.slug}`,
        "priceCurrency": "BDT",
        "price": currentPrice,
        "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        "itemCondition": "https://schema.org/NewCondition",
        "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": siteConfig.name
        }
      }
    };

    // Add aggregate rating if available
    if (product.averageRating && product.totalReviews > 0) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.averageRating,
        "reviewCount": product.totalReviews,
      };
    }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <NewProductDetails productSlug={productSlug} />
    </>
  );
}