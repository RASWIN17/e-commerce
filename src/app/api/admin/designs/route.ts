import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    const { data: designs, error } = await supabase
      .from('product_designs')
      .select(`
        id,
        product_id,
        variant_id,
        design_code,
        placement,
        artwork_url,
        preview_mockup_url,
        print_width_inches,
        print_height_inches,
        is_active,
        created_at,
        products (
          id,
          name,
          slug,
          product_variants (
            id,
            sku,
            qikink_sku,
            size,
            color_name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching designs:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ designs: designs || [] });
  } catch (err: any) {
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
    const {
      product_id,
      variant_id,
      design_code,
      placement = 'front',
      artwork_url,
      preview_mockup_url,
      print_width_inches = 10,
      print_height_inches = 12,
      is_active = true,
    } = body;

    if (!product_id || !design_code || !artwork_url) {
      return NextResponse.json({ error: 'Missing required design fields' }, { status: 400 });
    }

    const { data: newDesign, error } = await supabase
      .from('product_designs')
      .insert({
        product_id,
        variant_id: variant_id || null,
        design_code,
        placement,
        artwork_url,
        preview_mockup_url: preview_mockup_url || artwork_url,
        print_width_inches,
        print_height_inches,
        is_active,
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting design:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, design: newDesign });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

