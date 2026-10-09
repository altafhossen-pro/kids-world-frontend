import { siteConfig } from '@/config/siteConfig';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
const CHUNK_SIZE = 1000; // 1,000 products per sitemap chunk for blazing-fast indexing

// Return complete URL entries for /sitemap.xml
export default async function sitemap() {
  const baseUrl = siteConfig.url || 'https://kidsworldbd.com';

  // 1. Static routes
  const staticRoutes = [
    '',
    '/shop',
    '/categories',
    '/offers',
    '/contact-us',
    '/privacy-policy',
    '/return-refund-policy',
    '/terms-and-conditions',
    '/faq',
    '/tracking'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic Categories
  let categoryRoutes = [];
  try {
    const catRes = await fetch(`${API_BASE_URL}/category`, {
      next: { revalidate: 3600 },
    });
    if (catRes.ok) {
      const catData = await catRes.json();
      const categories = Array.isArray(catData?.data) ? catData.data : [];
      categoryRoutes = categories
        .filter((cat) => cat && cat.slug)
        .map((cat) => ({
          url: `${baseUrl}/shop?category=${encodeURIComponent(cat.slug)}`,
          lastModified: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // 3. Dynamic Products
  let productRoutes = [];
  try {
    const res = await fetch(`${API_BASE_URL}/product/sitemap-slugs`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        productRoutes = data.data
          .filter((p) => p && p.slug)
          .map((product) => ({
            url: `${baseUrl}/product/${product.slug}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
          }));
      }
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
