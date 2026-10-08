import { siteConfig } from '@/config/siteConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const CHUNK_SIZE = 1000; // 1,000 products per sitemap chunk for blazing-fast indexing

// 1. Generate sitemap IDs (0 is for static pages + first chunk, 1, 2, 3... for extra chunks)
export async function generateSitemaps() {
  try {
    const res = await fetch(`${API_BASE_URL}/product/sitemap-slugs`, {
      next: { revalidate: 3600 } // Cache count check for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      const totalProducts = Array.isArray(data?.data) ? data.data.length : 0;
      
      // Calculate total sitemaps needed (at least 1 sitemap)
      const count = Math.max(1, Math.ceil(totalProducts / CHUNK_SIZE));
      
      return Array.from({ length: count }, (_, index) => ({ id: index }));
    }
  } catch (error) {
    console.error('Error in generateSitemaps:', error);
  }

  // Fallback to single sitemap
  return [{ id: 0 }];
}

// 2. Return URL entries for the requested sitemap id
export default async function sitemap({ id }) {
  const baseUrl = siteConfig.url || 'https://kidsworldbd.com';
  const sitemapId = Number(id) || 0;

  // Static routes are added ONLY to the primary sitemap (id: 0)
  const staticRoutes = sitemapId === 0 ? [
    '',
    '/shop',
    '/categories',
    '/offers',
    '/contact-us',
    '/privacy-policy',
    '/return-refund-policy',
    '/terms-and-conditions',
    '/faq',
    '/tracking',
    '/videos'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  })) : [];

  // Fetch product entries for this specific chunk/page
  let productRoutes = [];
  try {
    const res = await fetch(`${API_BASE_URL}/product/sitemap-slugs`, {
      next: { revalidate: 3600 } // Cache sitemap data for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const start = sitemapId * CHUNK_SIZE;
        const end = start + CHUNK_SIZE;
        const currentBatch = data.data.slice(start, end);

        productRoutes = currentBatch.map((product) => ({
          url: `${baseUrl}/product/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.9,
        }));
      }
    }
  } catch (error) {
    console.error(`Error fetching products for sitemap id ${sitemapId}:`, error);
  }

  return [...staticRoutes, ...productRoutes];
}
