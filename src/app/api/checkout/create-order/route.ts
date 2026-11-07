import { NextResponse } from 'next/server';
import { cashfreeClient } from '@/lib/cashfree/client';
import { calculateDeliveryEstimate } from '@/lib/delivery/calculator';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit/limiter';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    // 1. Rate limiting check (max 10 checkout attempts per minute per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`checkout_${clientIp}`, {
      intervalSeconds: 60,
      maxRequests: 10,
    });

    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many checkout requests. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { items, shippingAddress, couponCode, userEmail, userPhone } = body;

    if (!items || !items.length || !shippingAddress || !shippingAddress.postal_code) {
      return NextResponse.json(
        { error: 'Incomplete order payload or missing address' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    // 2. CRITICAL SECURITY: Fetch product & variant details from Supabase database!
    let subtotalPaise = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      // Find legitimate product from Supabase
      let productQuery = supabase
        .from('products')
        .select('*, variants:product_variants(*), designs:product_designs(*)');

      if (item.productId) {
        productQuery = productQuery.eq('id', item.productId);
      } else if (item.productSlug) {
        productQuery = productQuery.eq('slug', item.productSlug);
      } else {
        return NextResponse.json({ error: 'Missing product identification' }, { status: 400 });
      }

      const { data: product, error: prodErr } = await productQuery.single();

      if (prodErr || !product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productSlug || item.productId}` },
          { status: 400 }
        );
      }

      const variants = product.variants || [];
      const variant =
        variants.find((v: any) => v.id === item.variantId || v.sku === item.variantSku) ||
        variants[0];

      if (!variant) {
        return NextResponse.json(
          { error: `Variant not found for product: ${product.name}` },
          { status: 400 }
        );
      }

      const quantity = Math.max(1, Math.min(10, parseInt(item.quantity || 1, 10)));
      const itemPricePaise = variant.price_paise;
      const totalItemPricePaise = itemPricePaise * quantity;

      subtotalPaise += totalItemPricePaise;

      const design = (product.designs && product.designs[0]) || null;

      validatedOrderItems.push({
        variant_id: variant.id,
        product_id: product.id,
        product_name: product.name,
        variant_name: `${variant.color_name} / ${variant.size}`,
        sku: variant.sku,
        unit_price_paise: itemPricePaise,
        quantity,
        total_price_paise: totalItemPricePaise,
        gst_rate_percentage: product.gst_rate_percentage || 5.00,
        qikink_sku: variant.qikink_sku || variant.sku,
        design_snapshot: design
          ? {
              design_code: design.design_code,
              placement: design.placement,
              artwork_url: design.artwork_url,
              print_width: design.print_width_inches,
              print_height: design.print_height_inches,
            }
          : undefined,
      });
    }

    // 3. Server-side Coupon validation against database or active promotions
    let discountPaise = 0;
    let validatedCoupon = null;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      const { data: dbCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .single();

      if (dbCoupon) {
        if (subtotalPaise >= (dbCoupon.min_cart_value_paise || 0)) {
          if (dbCoupon.discount_type === 'percentage') {
            discountPaise = Math.round((subtotalPaise * dbCoupon.discount_value) / 100);
            if (dbCoupon.max_discount_paise) {
              discountPaise = Math.min(discountPaise, dbCoupon.max_discount_paise);
            }
          } else {
            discountPaise = Math.min(dbCoupon.discount_value, subtotalPaise);
          }
          validatedCoupon = cleanCode;
        }
      } else if (cleanCode === 'FIRST10') {
        discountPaise = Math.round(subtotalPaise * 0.1);
        validatedCoupon = 'FIRST10';
      } else if (cleanCode === 'IMAGIX100' && subtotalPaise >= 99900) {
        discountPaise = 10000;
        validatedCoupon = 'IMAGIX100';
      }
    }

    // 4. Calculate Delivery and Shipping fee
    const deliveryEst = calculateDeliveryEstimate(
      shippingAddress.postal_code,
      false,
      subtotalPaise
    );
    const shippingFeePaise = deliveryEst.shipping_fee_paise;

    // 5. Total calculation in integer paise (financial accuracy)
    const totalAmountPaise = Math.max(0, subtotalPaise - discountPaise + shippingFeePaise);
    const totalRupees = parseFloat((totalAmountPaise / 100).toFixed(2));
    const orderNumber = `IMX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    // 6. Create internal order snapshot in Supabase
    const { data: orderRecord, error: orderInsertErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        guest_email: userEmail || 'guest@imagix.in',
        guest_phone: userPhone || shippingAddress.phone,
        status: 'pending',
        subtotal_paise: subtotalPaise,
        discount_paise: discountPaise,
        shipping_fee_paise: shippingFeePaise,
        gst_amount_paise: Math.round((subtotalPaise * 5) / 105),
        total_amount_paise: totalAmountPaise,
        coupon_code: validatedCoupon,
        shipping_address_snapshot: shippingAddress,
        delivery_estimate_min_days: deliveryEst.total_days_min,
        delivery_estimate_max_days: deliveryEst.total_days_max,
        delivery_estimate_date: `${deliveryEst.estimated_delivery_start} – ${deliveryEst.estimated_delivery_end}`,
      })
      .select('id')
      .single();

    if (orderInsertErr || !orderRecord) {
      console.error('Failed to insert order in Supabase:', orderInsertErr);
      return NextResponse.json(
        { error: 'Failed to record order details in database' },
        { status: 500 }
      );
    }

    const internalOrderId = orderRecord.id;
    const itemsWithOrderId = validatedOrderItems.map((it) => ({
      ...it,
      order_id: internalOrderId,
    }));
    await supabase.from('order_items').insert(itemsWithOrderId);

    // 7. Create Cashfree payment order
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cfOrder = await cashfreeClient.createPaymentOrder({
      orderId: orderNumber,
      orderAmount: totalRupees,
      customerDetails: {
        customerId: `cust_${(userEmail || 'guest').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`,
        customerEmail: userEmail || 'guest@imagix.in',
        customerPhone: shippingAddress.phone || '9999999999',
        customerName: shippingAddress.full_name || 'Valued Customer',
      },
      orderMeta: {
        returnUrl: `${origin}/orders/${orderNumber}/track?cf_id={order_id}`,
        notifyUrl: `${origin}/api/payments/cashfree/webhook`,
      },
      orderNote: `IMAGIX Order ${orderNumber}`,
    });

    // Record initial pending payment
    await supabase.from('payments').insert({
      order_id: internalOrderId,
      payment_gateway: 'cashfree',
      cf_order_id: cfOrder.cf_order_id || orderNumber,
      payment_session_id: cfOrder.payment_session_id,
      payment_status: 'PENDING',
      amount_paise: totalAmountPaise,
      currency: 'INR',
    });

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId: internalOrderId,
      cfOrderId: cfOrder.cf_order_id,
      paymentSessionId: cfOrder.payment_session_id,
      totalAmountPaise,
      totalRupees,
    });
  } catch (err: any) {
    console.error('Checkout creation error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to initialize checkout order' },
      { status: 500 }
    );
  }
}
