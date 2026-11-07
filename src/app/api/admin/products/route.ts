import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch products' }, { status: 500 });
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
      name,
      slug,
      short_description,
      detailed_description,
      fabric_info,
      fit_info,
      wash_care,
      base_price_paise,
      compare_at_price_paise,
      prior_30d_price_paise,
      gst_rate_percentage = 5,
      is_featured = false,
      is_active = true,
      image_url,
      variants = [],
    } = body;

    if (!name || !slug || !base_price_paise) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // 1. Insert product
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        short_description: short_description || 'Heavyweight organic apparel handcrafted for minimal drape.',
        detailed_description: detailed_description || 'Handcrafted in Tirupur, India from combed compact cotton.',
        fabric_info: fabric_info || '100% Combed Compact Cotton, 240 GSM',
        fit_info: fit_info || 'Oversized boxy fit',
        wash_care: wash_care || 'Cold wash, wash inside out.',
        base_price_paise,
        compare_at_price_paise: compare_at_price_paise || base_price_paise,
        prior_30d_price_paise: prior_30d_price_paise || compare_at_price_paise || base_price_paise,
        gst_rate_percentage,
        is_featured,
        is_active,
      })
      .select()
      .single();

    if (prodErr) {
      console.error('Error inserting product:', prodErr);
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    // 2. Insert primary image if provided
    if (image_url) {
      await supabase.from('product_images').insert({
        product_id: product.id,
        image_url,
        alt_text: name,
        display_order: 1,
        is_primary: true,
        view_type: 'front',
      });
    }

    // 3. Insert variants
    if (variants.length > 0) {
      const variantInserts = variants.map((v: any) => ({
        product_id: product.id,
        sku: v.sku,
        color_name: v.color_name || 'Natural Black',
        color_hex: v.color_hex || '#1E1E1E',
        size: v.size || 'M',
        price_paise: v.price_paise || base_price_paise,
        compare_at_price_paise: v.compare_at_price_paise || compare_at_price_paise || base_price_paise,
        qikink_sku: v.qikink_sku || `QIK-${v.sku}`,
        stock_quantity: v.stock_quantity ?? 50,
        is_active: true,
      }));

      await supabase.from('product_variants').insert(variantInserts);
    } else {
      // Create default S, M, L, XL variants
      const sizes = ['S', 'M', 'L', 'XL'];
      const defaultVariants = sizes.map((size) => ({
        product_id: product.id,
        sku: `IMX-${slug.slice(0, 4).toUpperCase()}-${size}`,
        color_name: 'Natural Black',
        color_hex: '#1E1E1E',
        size,
        price_paise: base_price_paise,
        compare_at_price_paise: compare_at_price_paise || base_price_paise,
        qikink_sku: `QIK-OVTEE-BLK-${size}`,
        stock_quantity: 50,
        is_active: true,
      }));

      await supabase.from('product_variants').insert(defaultVariants);
    }

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    console.error('Error in admin products POST:', err);
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
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    // 1. Clean up collection associations
    await supabase.from('collection_products').delete().eq('product_id', id);

    // 2. Delete product (variants, images, designs cascade automatically via FK)
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('DELETE /api/admin/products error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

