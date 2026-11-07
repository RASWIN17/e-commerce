import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts, getCategories } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    return NextResponse.json({ products, categories });
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
      category_id,
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
      color_name = 'Natural Black',
      variants = [],
    } = body;

    if (!name || !slug || !base_price_paise) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // 1. Insert product with category_id
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        category_id: category_id || null,
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

    // 3. Insert variants (with explicit SKU and Qikink SKU from admin input)
    if (variants && variants.length > 0) {
      const variantInserts = variants.map((v: any) => ({
        product_id: product.id,
        sku: v.sku || `IMX-${slug.slice(0, 4).toUpperCase()}-${v.size}`,
        color_name: v.color_name || color_name || 'Natural Black',
        color_hex: v.color_hex || '#1E1E1E',
        size: v.size || 'M',
        price_paise: v.price_paise || base_price_paise,
        compare_at_price_paise: v.compare_at_price_paise || compare_at_price_paise || base_price_paise,
        qikink_sku: v.qikink_sku || v.sku || `QIK-${slug.slice(0, 4).toUpperCase()}-${v.size}`,
        stock_quantity: v.stock_quantity ?? 50,
        is_active: true,
      }));

      await supabase.from('product_variants').insert(variantInserts);
    } else {
      // Fallback default sizes if none provided
      const sizes = ['S', 'M', 'L', 'XL'];
      const defaultVariants = sizes.map((size) => ({
        product_id: product.id,
        sku: `IMX-${slug.slice(0, 4).toUpperCase()}-${size}`,
        color_name: color_name || 'Natural Black',
        color_hex: '#1E1E1E',
        size,
        price_paise: base_price_paise,
        compare_at_price_paise: compare_at_price_paise || base_price_paise,
        qikink_sku: `QIK-${slug.slice(0, 4).toUpperCase()}-${size}`,
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

export async function PATCH(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    const body = await req.json();
    const { product_id, variants } = body;

    if (!product_id || !Array.isArray(variants)) {
      return NextResponse.json({ error: 'Missing product_id or variants' }, { status: 400 });
    }

    for (const v of variants) {
      if (v.id) {
        await supabase
          .from('product_variants')
          .update({
            sku: v.sku,
            qikink_sku: v.qikink_sku,
            updated_at: new Date().toISOString(),
          })
          .eq('id', v.id);
      }
    }

    return NextResponse.json({ success: true, message: 'SKUs updated successfully' });
  } catch (err: any) {
    console.error('Error in variant PATCH:', err);
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

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    console.error('Error in admin product DELETE:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
