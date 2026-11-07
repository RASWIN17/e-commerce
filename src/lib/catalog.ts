import { createClient } from './supabase/client';
import { Product, Category, Collection } from './types';

// Helper to normalize product images ordering
function sortImages(images: any[]): any[] {
  if (!images) return [];
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching products from Supabase:', error);
      return [];
    }

    return data.map((p: any) => ({
      ...p,
      images: sortImages(p.images),
      variants: p.variants || [],
    }));
  } catch (err) {
    console.error('Unexpected error in getProducts:', err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      images: sortImages(data.images),
      variants: data.variants || [],
    };
  } catch (err) {
    console.error('Unexpected error in getProductBySlug:', err);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getCategories:', err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function getCollections(): Promise<Collection[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('is_active', true);

    if (error || !data) {
      console.error('Error fetching collections:', error);
      return [];
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getCollections:', err);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .eq('category_id', categoryId)
      .eq('is_active', true);

    if (error || !data) return [];
    return data.map((p: any) => ({
      ...p,
      images: sortImages(p.images),
      variants: p.variants || [],
    }));
  } catch (err) {
    return [];
  }
}

export async function getProductsByCollection(collectionId: string): Promise<Product[]> {
  try {
    const supabase = createClient();
    const { data: mappings, error: mapErr } = await supabase
      .from('collection_products')
      .select('product_id')
      .eq('collection_id', collectionId);

    if (mapErr || !mappings || mappings.length === 0) return [];

    const productIds = mappings.map((m: any) => m.product_id);
    const { data, error } = await supabase
      .from('products')
      .select('*, images:product_images(*), variants:product_variants(*)')
      .in('id', productIds)
      .eq('is_active', true);

    if (error || !data) return [];
    return data.map((p: any) => ({
      ...p,
      images: sortImages(p.images),
      variants: p.variants || [],
    }));
  } catch (err) {
    return [];
  }
}

