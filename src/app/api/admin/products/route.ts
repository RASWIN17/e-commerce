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
      design_code,
      artwork_url,
      placement = 'front',
      print_width_inches = 10,
      print_height_inches = 12,
      variants = [],
    } = body;

    if (!name || !slug || !base_price_paise) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // 1. Insert product with category_id and rich specifications
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
        gst_rate_percentage: Number(gst_rate_percentage) || 5,
        is_featured: Boolean(is_featured),
        is_active: is_active !== false,
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

    // 3. Insert design specification if provided
    if (design_code || artwork_url) {
      await supabase.from('product_designs').insert({
        product_id: product.id,
        design_code: design_code || `IMX-DES-${slug.slice(0, 4).toUpperCase()}`,
        placement: placement || 'front',
        artwork_url: artwork_url || image_url,
        preview_mockup_url: image_url,
        print_width_inches: Number(print_width_inches) || 10,
        print_height_inches: Number(print_height_inches) || 12,
        is_active: true,
      });
    }

    // 4. Insert variants (with explicit Store SKU and Qikink SKU from admin input)
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
    const {
      product_id,
      name,
      category_id,
      short_description,
      detailed_description,
      fabric_info,
      fit_info,
      wash_care,
      base_price_paise,
      compare_at_price_paise,
      prior_30d_price_paise,
      gst_rate_percentage,
      is_featured,
      is_active,
      image_url,
      design_code,
      artwork_url,
      placement,
      print_width_inches,
      print_height_inches,
      variants,
    } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }

    // 1. Update product base fields if provided
    const productUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) productUpdates.name = name;
    if (category_id !== undefined) productUpdates.category_id = category_id || null;
    if (short_description !== undefined) productUpdates.short_description = short_description;
    if (detailed_description !== undefined) productUpdates.detailed_description = detailed_description;
    if (fabric_info !== undefined) productUpdates.fabric_info = fabric_info;
    if (fit_info !== undefined) productUpdates.fit_info = fit_info;
    if (wash_care !== undefined) productUpdates.wash_care = wash_care;
    if (base_price_paise !== undefined) productUpdates.base_price_paise = Number(base_price_paise);
    if (compare_at_price_paise !== undefined) productUpdates.compare_at_price_paise = Number(compare_at_price_paise);
    if (prior_30d_price_paise !== undefined) productUpdates.prior_30d_price_paise = Number(prior_30d_price_paise);
    if (gst_rate_percentage !== undefined) productUpdates.gst_rate_percentage = Number(gst_rate_percentage);
    if (is_featured !== undefined) productUpdates.is_featured = Boolean(is_featured);
    if (is_active !== undefined) productUpdates.is_active = Boolean(is_active);

    const { error: updateProdErr } = await supabase
      .from('products')
      .update(productUpdates)
      .eq('id', product_id);

    if (updateProdErr) {
      console.error('Error updating product:', updateProdErr);
      return NextResponse.json({ error: updateProdErr.message }, { status: 500 });
    }

    // 2. Update or insert primary image
    if (image_url) {
      const { data: existingImg } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', product_id)
        .eq('is_primary', true)
        .single();

      if (existingImg) {
        await supabase
          .from('product_images')
          .update({ image_url, alt_text: name || 'Product image' })
          .eq('id', existingImg.id);
      } else {
        await supabase.from('product_images').insert({
          product_id,
          image_url,
          alt_text: name || 'Product image',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        });
      }
    }

    // 3. Update or insert design specifications
    if (design_code !== undefined || artwork_url !== undefined) {
      const { data: existingDesign } = await supabase
        .from('product_designs')
        .select('id')
        .eq('product_id', product_id)
        .single();

      if (existingDesign) {
        await supabase
          .from('product_designs')
          .update({
            ...(design_code !== undefined ? { design_code } : {}),
            ...(artwork_url !== undefined ? { artwork_url } : {}),
            ...(placement !== undefined ? { placement } : {}),
            ...(print_width_inches !== undefined ? { print_width_inches: Number(print_width_inches) } : {}),
            ...(print_height_inches !== undefined ? { print_height_inches: Number(print_height_inches) } : {}),
          })
          .eq('id', existingDesign.id);
      } else if (design_code || artwork_url) {
        await supabase.from('product_designs').insert({
          product_id,
          design_code: design_code || 'IMX-DES',
          placement: placement || 'front',
          artwork_url: artwork_url || image_url,
          preview_mockup_url: image_url,
          print_width_inches: Number(print_width_inches) || 10,
          print_height_inches: Number(print_height_inches) || 12,
          is_active: true,
        });
      }
    }

    // 4. Update variants
    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v.id) {
          await supabase
            .from('product_variants')
            .update({
              sku: v.sku,
              qikink_sku: v.qikink_sku,
              ...(v.price_paise !== undefined ? { price_paise: Number(v.price_paise) } : {}),
              ...(v.stock_quantity !== undefined ? { stock_quantity: Number(v.stock_quantity) } : {}),
              updated_at: new Date().toISOString(),
            })
            .eq('id', v.id);
        } else if (v.size) {
          await supabase.from('product_variants').insert({
            product_id,
            sku: v.sku || `IMX-VAR-${v.size}`,
            size: v.size,
            color_name: v.color_name || 'Standard',
            color_hex: '#1E1E1E',
            price_paise: v.price_paise || (base_price_paise ? Number(base_price_paise) : 79900),
            qikink_sku: v.qikink_sku || v.sku,
            stock_quantity: v.stock_quantity ?? 50,
            is_active: true,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Product and specifications updated successfully' });
  } catch (err: any) {
    console.error('Error in product PATCH:', err);
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
