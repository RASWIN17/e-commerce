import { MetadataRoute } from 'next';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, SAMPLE_COLLECTIONS } from '../lib/data/sampleProducts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://imagix.in';

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

  // Dynamic Products
  const productPages = SAMPLE_PRODUCTS.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at).toISOString(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  // Dynamic Categories
  const categoryPages = SAMPLE_CATEGORIES.map((c) => ({
    url: `${baseUrl}/category/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic Collections
  const collectionPages = SAMPLE_COLLECTIONS.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages];
}

