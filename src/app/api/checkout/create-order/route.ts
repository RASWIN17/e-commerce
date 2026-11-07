import { NextResponse } from 'next/server';
import { cashfreeClient } from '@/lib/cashfree/client';
import { calculateDeliveryEstimate } from '@/lib/delivery/calculator';
import { SAMPLE_PRODUCTS } from '@/lib/data/sampleProducts';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit/limiter';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    // 1. Rate limiting check (e.g. max 10 checkout attempts per minute per IP)
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

    // 2. CRITICAL SECURITY: Recalculate prices completely on the server!
    let subtotalPaise = 0;
    const validatedOrderItems: any[] = [];

    for (const item of items) {
      // Find legitimate product & variant from database or catalog
      const product = SAMPLE_PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productSlug);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productSlug || item.productId}` },
          { status: 400 }
        );
      }

      const variant = product.variants.find((v) => v.id === item.variantId) || product.variants[0];
      const quantity = Math.max(1, Math.min(10, parseInt(item.quantity || 1, 10)));
      const itemPricePaise = variant.price_paise;
      const totalItemPricePaise = itemPricePaise * quantity;

      subtotalPaise += totalItemPricePaise;

      validatedOrderItems.push({
        variant_id: variant.id,
        product_id: product.id,
        product_name: product.name,
        variant_name: `${variant.color_name} / ${variant.size}`,
        sku: variant.sku,
        unit_price_paise: itemPricePaise,
        quantity,
        total_price_paise: totalItemPricePaise,
        gst_rate_percentage: product.gst_rate_percentage,
        qikink_sku: variant.qikink_sku,
        design_snapshot: product.designs?.[0]
          ? {
              design_code: product.designs[0].design_code,
              placement: product.designs[0].placement,
              artwork_url: product.designs[0].artwork_url,
              print_width: product.designs[0].print_width_inches,
              print_height: product.designs[0].print_height_inches,
            }
          : undefined,
      });
    }

    // 3. Server-side Coupon validation
    let discountPaise = 0;
    let validatedCoupon = null;
    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      if (cleanCode === 'FIRST10') {
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

    // 5. Total calculation in integer paise
    const totalAmountPaise = Math.max(0, subtotalPaise - discountPaise + shippingFeePaise);
    const totalRupees = parseFloat((totalAmountPaise / 100).toFixed(2));
    const orderNumber = `IMX-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    // 6. Create internal order snapshot in Supabase if configured
    const supabase = createAdminClient();
    let internalOrderId = `ord_${Date.now()}`;

    if (supabase) {
      const { data: orderRecord } = await supabase
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

      if (orderRecord) {
        internalOrderId = orderRecord.id;
        const itemsWithOrderId = validatedOrderItems.map((item) => ({
          ...item,
          order_id: internalOrderId,
        }));
        await supabase.from('order_items').insert(itemsWithOrderId);
      }
    }

    // 7. Create Cashfree payment order
    const origin = req.headers.get('origin') || 'http://localhost:3000';
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
        returnUrl: `${origin}/orders/${orderNumber}/track?cf_id={order_id}&status=success`,
        notifyUrl: `${origin}/api/payments/cashfree/webhook`,
      },
      orderNote: `IMAGIX Order ${orderNumber}`,
    });

    if (supabase) {
      await supabase.from('payments').insert({
        order_id: internalOrderId,
        payment_gateway: 'cashfree',
        cf_order_id: cfOrder.cf_order_id || orderNumber,
        payment_session_id: cfOrder.payment_session_id,
        payment_status: 'PENDING',
        amount_paise: totalAmountPaise,
        currency: 'INR',
      });
    }

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
