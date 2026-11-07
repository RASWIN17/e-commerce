import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

// Deterministic UUID generator based on a seed string
function toUuid(name) {
  const hash = crypto.createHash('sha256').update(name).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function seed() {
  console.log('Seeding IMAGIX catalog to Supabase...');

  // 1. Categories
  const categories = [
    {
      id: toUuid('category:t-shirts'),
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Heavyweight, oversized, and classic-cut cotton tees tailored for timeless comfort.',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      display_order: 1,
      is_active: true,
    },
    {
      id: toUuid('category:hoodies'),
      name: 'Hoodies & Sweatshirts',
      slug: 'hoodies',
      description: '380 GSM plush fleece hoodies built for cozy everyday warmth.',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      display_order: 2,
      is_active: true,
    },
    {
      id: toUuid('category:accessories'),
      name: 'Totes & Accessories',
      slug: 'accessories',
      description: 'Durable heavyweight canvas totes and daily carry essentials.',
      image_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=800&auto=format&fit=crop',
      display_order: 3,
      is_active: true,
    },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' });
    if (error) console.error('Error upserting category:', cat.slug, error);
  }
  console.log('Categories seeded.');

  // 2. Collections
  const collections = [
    {
      id: toUuid('collection:graphic-tees'),
      name: 'Graphic Tees',
      slug: 'graphic-tees',
      description: 'Understated, minimal graphics inspired by nature, geometry, and thoughtful typography.',
      banner_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop',
      is_active: true,
    },
    {
      id: toUuid('collection:hoodies-collection'),
      name: 'Hoodies',
      slug: 'hoodies-collection',
      description: 'Structured silhouettes crafted with premium fleece for modern street comfort.',
      banner_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=1000&auto=format&fit=crop',
      is_active: true,
    },
    {
      id: toUuid('collection:accessories-collection'),
      name: 'Accessories',
      slug: 'accessories-collection',
      description: 'Eco-conscious everyday staples engineered for durable utility.',
      banner_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop',
      is_active: true,
    },
  ];

  for (const col of collections) {
    const { error } = await supabase.from('collections').upsert(col, { onConflict: 'slug' });
    if (error) console.error('Error upserting collection:', col.slug, error);
  }
  console.log('Collections seeded.');

  // 3. Products
  const products = [
    {
      id: toUuid('product:sunset-graphic-tee'),
      name: 'Sunset Graphic Tee',
      slug: 'sunset-graphic-tee',
      short_description: 'Boxy-fit heavyweight cotton tee featuring an understated golden sun chest insignia.',
      detailed_description: 'The Sunset Graphic Tee is cut from 240 GSM combed organic cotton for an effortless, relaxed silhouette that drapes cleanly. Features ribbed collar detail, reinforced shoulder taping, and a soft, breathable DTG print that will never peel or crack.',
      category_id: toUuid('category:t-shirts'),
      fabric_info: '100% Super-Combed Compact Cotton, 240 GSM Single Jersey',
      fit_info: 'Boxy / Relaxed street fit. Size down for regular fit.',
      wash_care: 'Machine wash cold inside-out with like colors. Do not iron directly on print. Tumble dry low.',
      base_price_paise: 79900,
      compare_at_price_paise: 119900,
      prior_30d_price_paise: 119900,
      gst_rate_percentage: 5.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Sunset Graphic Tee | IMAGIX Studio',
      meta_description: 'Premium heavyweight oversized cotton tee in washed black with minimal sun graphic.',
      collection_id: toUuid('collection:graphic-tees'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Sunset Graphic Tee in Washed Black front view',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Sunset Graphic Tee model editorial wearing sunglasses',
          display_order: 2,
          is_primary: false,
          view_type: 'model',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Sunset Graphic Tee back view clean silhouette',
          display_order: 3,
          is_primary: false,
          view_type: 'back',
        },
      ],
      variants: [
        { sku: 'IMX-SGT-BLK-S', color_name: 'Washed Black', color_hex: '#1E1E1E', size: 'S', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BLK-S', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 45 },
        { sku: 'IMX-SGT-BLK-M', color_name: 'Washed Black', color_hex: '#1E1E1E', size: 'M', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BLK-M', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 60 },
        { sku: 'IMX-SGT-BLK-L', color_name: 'Washed Black', color_hex: '#1E1E1E', size: 'L', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BLK-L', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 50 },
        { sku: 'IMX-SGT-BLK-XL', color_name: 'Washed Black', color_hex: '#1E1E1E', size: 'XL', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BLK-XL', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 35 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-SUN-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 4.0,
          print_height_inches: 4.0,
        },
      ],
    },
    {
      id: toUuid('product:dream-big-tee'),
      name: 'Dream Big Tee',
      slug: 'dream-big-tee',
      short_description: 'Oversized beige tee featuring minimalist typographic statement across chest.',
      detailed_description: 'A clean aesthetic staple inspired by Scandinavian minimalism. Cut from our heavyweight 240 GSM brushed jersey with drop-shoulders and a broad rib collar. The neutral sand hue pairs seamlessly with denim, linen, and tailored trousers.',
      category_id: toUuid('category:t-shirts'),
      fabric_info: '100% Cotton French Terry, 240 GSM, Bio-Washed',
      fit_info: 'Oversized drop-shoulder silhouette.',
      wash_care: 'Gentle cycle wash cold. Line dry in shade. Do not bleach.',
      base_price_paise: 79900,
      compare_at_price_paise: 119900,
      prior_30d_price_paise: 119900,
      gst_rate_percentage: 5.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Dream Big Tee | IMAGIX Studio',
      meta_description: 'Oversized beige typography t-shirt crafted with heavyweight cotton.',
      collection_id: toUuid('collection:graphic-tees'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Dream Big Tee in sand beige flatlay view',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Dream Big Tee model view outdoors',
          display_order: 2,
          is_primary: false,
          view_type: 'model',
        },
      ],
      variants: [
        { sku: 'IMX-DBT-BGE-S', color_name: 'Sand Beige', color_hex: '#E2DBD2', size: 'S', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BGE-S', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 30 },
        { sku: 'IMX-DBT-BGE-M', color_name: 'Sand Beige', color_hex: '#E2DBD2', size: 'M', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BGE-M', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 40 },
        { sku: 'IMX-DBT-BGE-L', color_name: 'Sand Beige', color_hex: '#E2DBD2', size: 'L', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BGE-L', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 50 },
        { sku: 'IMX-DBT-BGE-XL', color_name: 'Sand Beige', color_hex: '#E2DBD2', size: 'XL', price_paise: 79900, compare_at_price_paise: 119900, qikink_sku: 'QIK-OVTEE-BGE-XL', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 25 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-DRM-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 10.0,
          print_height_inches: 2.5,
        },
      ],
    },
    {
      id: toUuid('product:mountain-vibes-tee'),
      name: 'Mountain Vibes Tee',
      slug: 'mountain-vibes-tee',
      short_description: 'Deep forest green tee with fine-line alpine geometry across chest.',
      detailed_description: 'Constructed for creators and outdoor wanderers. Features a deep pine green fabric wash paired with ultra-crisp vector line art capturing mountain peaks in sharp relief. Breathable, durable, and holds shape after every wash.',
      category_id: toUuid('category:t-shirts'),
      fabric_info: '100% Combed Compact Cotton, 240 GSM',
      fit_info: 'Relaxed fit with structured crew neck.',
      wash_care: 'Cold water wash inside-out. Do not dry clean.',
      base_price_paise: 89900,
      compare_at_price_paise: 129900,
      prior_30d_price_paise: 129900,
      gst_rate_percentage: 5.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Mountain Vibes Tee | IMAGIX Studio',
      meta_description: 'Forest green graphic t-shirt with geometric alpine ridge design.',
      collection_id: toUuid('collection:graphic-tees'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Mountain Vibes Tee in forest green flat view',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1503342452485-86b7f54527ef?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Mountain Vibes Tee on model in natural daylight',
          display_order: 2,
          is_primary: false,
          view_type: 'model',
        },
      ],
      variants: [
        { sku: 'IMX-MVT-GRN-S', color_name: 'Forest Green', color_hex: '#1E382B', size: 'S', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-GRN-S', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 28 },
        { sku: 'IMX-MVT-GRN-M', color_name: 'Forest Green', color_hex: '#1E382B', size: 'M', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-GRN-M', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 42 },
        { sku: 'IMX-MVT-GRN-L', color_name: 'Forest Green', color_hex: '#1E382B', size: 'L', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-GRN-L', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 38 },
        { sku: 'IMX-MVT-GRN-XL', color_name: 'Forest Green', color_hex: '#1E382B', size: 'XL', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-GRN-XL', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 20 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-MTN-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 8.5,
          print_height_inches: 4.5,
        },
      ],
    },
    {
      id: toUuid('product:abstract-mood-tee'),
      name: 'Abstract Mood Tee',
      slug: 'abstract-mood-tee',
      short_description: 'Warm cream heavyweight tee adorned with organic modern silhouette art.',
      detailed_description: 'Elevated contemporary art meets everyday comfort. The Abstract Mood Tee features modern organic shapes silkscreen-printed on thick, creamy 240 GSM carded cotton. Designed to be the foundation of a minimalist capsule wardrobe.',
      category_id: toUuid('category:t-shirts'),
      fabric_info: '100% Cotton, 240 GSM, Pre-Shrunk & Bio-Polished',
      fit_info: 'True to size with slight shoulder drop.',
      wash_care: 'Machine wash 30°C. Do not tumble dry. Iron on reverse.',
      base_price_paise: 89900,
      compare_at_price_paise: 129900,
      prior_30d_price_paise: 129900,
      gst_rate_percentage: 5.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Abstract Mood Tee | IMAGIX Studio',
      meta_description: 'Cream modern art graphic t-shirt with organic shapes.',
      collection_id: toUuid('collection:graphic-tees'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Abstract Mood Tee cream flatlay view',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Abstract Mood Tee model close-up',
          display_order: 2,
          is_primary: false,
          view_type: 'model',
        },
      ],
      variants: [
        { sku: 'IMX-AMT-CRM-S', color_name: 'Warm Cream', color_hex: '#F3EFE6', size: 'S', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-CRM-S', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 22 },
        { sku: 'IMX-AMT-CRM-M', color_name: 'Warm Cream', color_hex: '#F3EFE6', size: 'M', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-CRM-M', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 36 },
        { sku: 'IMX-AMT-CRM-L', color_name: 'Warm Cream', color_hex: '#F3EFE6', size: 'L', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-CRM-L', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 40 },
        { sku: 'IMX-AMT-CRM-XL', color_name: 'Warm Cream', color_hex: '#F3EFE6', size: 'XL', price_paise: 89900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-CRM-XL', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 18 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-ABS-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 9.0,
          print_height_inches: 11.0,
        },
      ],
    },
    {
      id: toUuid('product:good-vibes-oversized-tee'),
      name: 'Good Vibes Oversized Tee',
      slug: 'good-vibes-oversized-tee',
      short_description: 'Hero editorial oversized tee with clean chest micro-embroidery print.',
      detailed_description: 'The signature piece from our debut editorial. Cut in a generous relaxed drape with drop shoulders and a clean rib neckline. Crafted in Tamil Nadu from ethically-sourced organic combed cotton.',
      category_id: toUuid('category:t-shirts'),
      fabric_info: '100% Combed Cotton, 240 GSM Heavyweight Jersey',
      fit_info: 'Oversized boxy fit.',
      wash_care: 'Wash cold, line dry in shade.',
      base_price_paise: 84900,
      compare_at_price_paise: 129900,
      prior_30d_price_paise: 129900,
      gst_rate_percentage: 5.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Good Vibes Oversized Tee | IMAGIX',
      meta_description: 'Editorial oversized tee with micro chest print in off-white.',
      collection_id: toUuid('collection:graphic-tees'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Good Vibes Oversized Tee editorial model',
          display_order: 1,
          is_primary: true,
          view_type: 'model',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Good Vibes Oversized Tee flat view',
          display_order: 2,
          is_primary: false,
          view_type: 'front',
        },
      ],
      variants: [
        { sku: 'IMX-GVT-WHT-S', color_name: 'Off-White', color_hex: '#F5F4EE', size: 'S', price_paise: 84900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-WHT-S', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 30 },
        { sku: 'IMX-GVT-WHT-M', color_name: 'Off-White', color_hex: '#F5F4EE', size: 'M', price_paise: 84900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-WHT-M', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 50 },
        { sku: 'IMX-GVT-WHT-L', color_name: 'Off-White', color_hex: '#F5F4EE', size: 'L', price_paise: 84900, compare_at_price_paise: 129900, qikink_sku: 'QIK-OVTEE-WHT-L', qikink_product_id: 'QIK_BLANK_001', stock_quantity: 45 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-GVB-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 3.5,
          print_height_inches: 2.0,
        },
      ],
    },
    {
      id: toUuid('product:heavyweight-studio-hoodie'),
      name: 'Heavyweight Studio Hoodie',
      slug: 'heavyweight-studio-hoodie',
      short_description: '380 GSM brushed organic fleece hoodie with double-layer hood.',
      detailed_description: 'Designed for substantial warmth and a relaxed silhouette without slouching. Engineered with a double-needle topstitch, heavy ribbed cuffs, and no drawstrings for a sleek architectural aesthetic.',
      category_id: toUuid('category:hoodies'),
      fabric_info: '100% Organic Cotton French Terry Fleece, 380 GSM',
      fit_info: 'Slightly relaxed, structured shoulders.',
      wash_care: 'Cold wash, wash with like colors, flat dry.',
      base_price_paise: 169900,
      compare_at_price_paise: 249900,
      prior_30d_price_paise: 249900,
      gst_rate_percentage: 12.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Heavyweight Studio Hoodie | IMAGIX',
      meta_description: '380 GSM heavyweight brushed fleece hoodie in natural oat.',
      collection_id: toUuid('collection:hoodies-collection'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Heavyweight Studio Hoodie front view in oat beige',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
        {
          image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Heavyweight Studio Hoodie model wearing eyeglasses',
          display_order: 2,
          is_primary: false,
          view_type: 'model',
        },
      ],
      variants: [
        { sku: 'IMX-HSH-OAT-M', color_name: 'Oatmeal Beige', color_hex: '#DDD6CC', size: 'M', price_paise: 169900, compare_at_price_paise: 249900, qikink_sku: 'QIK-HD-OAT-M', qikink_product_id: 'QIK_BLANK_002', stock_quantity: 25 },
        { sku: 'IMX-HSH-OAT-L', color_name: 'Oatmeal Beige', color_hex: '#DDD6CC', size: 'L', price_paise: 169900, compare_at_price_paise: 249900, qikink_sku: 'QIK-HD-OAT-L', qikink_product_id: 'QIK_BLANK_002', stock_quantity: 30 },
      ],
      designs: [],
    },
    {
      id: toUuid('product:botanical-canvas-tote-bag'),
      name: 'Botanical Canvas Tote Bag',
      slug: 'botanical-canvas-tote-bag',
      short_description: 'Heavy 16oz natural canvas tote with hand-drawn floral botanical line art.',
      detailed_description: 'Built for daily farmer market runs, laptops, and studio gear. Made with 100% heavy cotton canvas, reinforced box cross-stitching on handles, and a spacious main compartment.',
      category_id: toUuid('category:accessories'),
      fabric_info: '100% Unbleached Heavy Cotton Canvas, 420 GSM / 16oz',
      fit_info: 'Dimensions: 16" Height x 15" Width x 4" Bottom Gusset.',
      wash_care: 'Spot clean with mild soap and water. Air dry.',
      base_price_paise: 49900,
      compare_at_price_paise: 79900,
      prior_30d_price_paise: 79900,
      gst_rate_percentage: 12.00,
      is_featured: true,
      is_active: true,
      meta_title: 'Botanical Canvas Tote Bag | IMAGIX',
      meta_description: 'Heavyweight organic canvas tote bag with botanical line drawing.',
      collection_id: toUuid('collection:accessories-collection'),
      images: [
        {
          image_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=900&auto=format&fit=crop',
          alt_text: 'Botanical Canvas Tote Bag on chair',
          display_order: 1,
          is_primary: true,
          view_type: 'front',
        },
      ],
      variants: [
        { sku: 'IMX-BCT-NAT-OS', color_name: 'Natural Ecru', color_hex: '#EBE6DC', size: 'One Size', price_paise: 49900, compare_at_price_paise: 79900, qikink_sku: 'QIK-TOTE-ECR-OS', qikink_product_id: 'QIK_BLANK_003', stock_quantity: 80 },
      ],
      designs: [
        {
          design_code: 'IMX-DES-BOT-01',
          placement: 'front',
          artwork_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=600&auto=format&fit=crop',
          preview_mockup_url: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?q=80&w=900&auto=format&fit=crop',
          print_width_inches: 8.0,
          print_height_inches: 10.0,
        },
      ],
    },
  ];

  for (const p of products) {
    const productRecord = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.short_description,
      detailed_description: p.detailed_description,
      category_id: p.category_id,
      fabric_info: p.fabric_info,
      fit_info: p.fit_info,
      wash_care: p.wash_care,
      base_price_paise: p.base_price_paise,
      compare_at_price_paise: p.compare_at_price_paise,
      prior_30d_price_paise: p.prior_30d_price_paise,
      gst_rate_percentage: p.gst_rate_percentage,
      is_featured: p.is_featured,
      is_active: p.is_active,
      meta_title: p.meta_title,
      meta_description: p.meta_description,
    };

    const { error: prodErr } = await supabase.from('products').upsert(productRecord, { onConflict: 'slug' });
    if (prodErr) {
      console.error('Error upserting product:', p.slug, prodErr);
      continue;
    }

    // Link collection product
    if (p.collection_id) {
      await supabase.from('collection_products').upsert({
        id: toUuid(`colprod:${p.collection_id}:${p.id}`),
        collection_id: p.collection_id,
        product_id: p.id,
        display_order: 1,
      }, { onConflict: 'collection_id,product_id' });
    }

    // Images
    for (let i = 0; i < p.images.length; i++) {
      const img = p.images[i];
      await supabase.from('product_images').upsert({
        id: toUuid(`img:${p.id}:${i}`),
        product_id: p.id,
        image_url: img.image_url,
        alt_text: img.alt_text,
        display_order: img.display_order,
        is_primary: img.is_primary,
        view_type: img.view_type,
      });
    }

    // Variants
    for (const v of p.variants) {
      await supabase.from('product_variants').upsert({
        id: toUuid(`var:${v.sku}`),
        product_id: p.id,
        sku: v.sku,
        color_name: v.color_name,
        color_hex: v.color_hex,
        size: v.size,
        price_paise: v.price_paise,
        compare_at_price_paise: v.compare_at_price_paise,
        qikink_sku: v.qikink_sku,
        qikink_product_id: v.qikink_product_id,
        stock_quantity: v.stock_quantity,
        is_active: true,
      }, { onConflict: 'sku' });
    }

    // Designs
    for (let d = 0; d < p.designs.length; d++) {
      const des = p.designs[d];
      await supabase.from('product_designs').upsert({
        id: toUuid(`des:${p.id}:${des.design_code}`),
        product_id: p.id,
        design_code: des.design_code,
        placement: des.placement,
        artwork_url: des.artwork_url,
        preview_mockup_url: des.preview_mockup_url,
        print_width_inches: des.print_width_inches,
        print_height_inches: des.print_height_inches,
        is_active: true,
      });
    }

    console.log(`Product seeded: ${p.name}`);
  }

  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});

