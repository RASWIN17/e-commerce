import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        slug,
        description,
        image_url,
        display_order,
        is_active,
        created_at,
        products (
          id
        )
      `)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (categories || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url,
      display_order: c.display_order,
      is_active: c.is_active,
      created_at: c.created_at,
      productCount: c.products ? c.products.length : 0,
    }));

    return NextResponse.json({ categories: formatted });
  } catch (err: any) {
    console.error('Error in categories GET:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    const body = await req.json();
    const { name, slug, description, image_url, display_order = 0 } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug: finalSlug,
        description: description || `Minimal heavyweight ${name.toLowerCase()} tailored in Tirupur.`,
        image_url:
          image_url ||
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
        display_order: Number(display_order) || 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('Error in category POST:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing category ID' }, { status: 400 });
    }

    // Delete category. Products referencing this category automatically get category_id set to NULL (ON DELETE SET NULL).
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    console.error('Error in category DELETE:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

