import { MetadataRoute } from 'next';
import { getProducts, getCategories, getCollections } from '../lib/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imagix.in';

  // Static Pages
  const staticPages = [
    '',
    '/shop',
    '/categories',
    '/collections',
    '/about',
    '/contact',
    '/faq',
    '/reviews',
    '/terms',
    '/privacy',
    '/shipping',
    '/cancellation',
    '/returns',
    '/pricing-policy',
    '/cookie-preferences',
    '/grievance',
    '/ip-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const [products, categories, collections] = await Promise.all([
    getProducts(),
    getCategories(),
    getCollections(),
  ]);

  // Dynamic Products
  const productPages = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()).toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Dynamic Categories
  const categoryPages = categories.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic Collections
  const collectionPages = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages];
}
