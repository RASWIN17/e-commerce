import { NextResponse } from 'next/server';
import { verifyCashfreeWebhook } from '@/lib/cashfree/webhook';
import { cashfreeClient } from '@/lib/cashfree/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { queueAndProcessFulfilmentJob } from '@/lib/qikink/queue';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    // 1. Strict Webhook Signature Verification
    const verification = verifyCashfreeWebhook(rawBody, signature, timestamp);
    if (!verification.isValid) {
      console.warn('Unauthorized Cashfree webhook attempt:', verification.error);
      return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 401 });
    }

    const payload = verification.data;
    const eventType = payload?.type || 'PAYMENT_SUCCESS_WEBHOOK';
    const eventId = String(payload?.event_time || payload?.data?.payment?.cf_payment_id || `evt_${Date.now()}`);
    const orderData = payload?.data?.order;
    const paymentData = payload?.data?.payment;
    const orderNumber = orderData?.order_id;

    if (!orderNumber) {
      return NextResponse.json({ message: 'Missing order_id in webhook data' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // 2. Webhook Event Deduplication
    const { data: existingEvent } = await supabase
      .from('payment_webhook_events')
      .select('id, processed')
      .eq('event_id', eventId)
      .single();

    if (existingEvent && existingEvent.processed) {
      return NextResponse.json({ status: 'OK', message: 'Event already processed' });
    }

    await supabase.from('payment_webhook_events').insert({
      gateway: 'cashfree',
      event_type: eventType,
      event_id: eventId,
      payload: payload,
      signature_verified: true,
      processed: true,
    });

    // 3. Find matching internal order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount_paise')
      .eq('order_number', orderNumber)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Matching internal order not found' }, { status: 404 });
    }

    // 4. CRITICAL SECURITY: Verify payment with Cashfree's server-side API!
    // Never trust client or unverified status directly.
    let verifiedCashfreeOrder: any = null;
    try {
      verifiedCashfreeOrder = await cashfreeClient.getOrderDetails(orderNumber);
    } catch (cfErr: any) {
      console.error('Failed to query Cashfree server-side API for order verification:', cfErr);
      return NextResponse.json(
        { error: 'Failed to verify payment status with Cashfree server-side' },
        { status: 502 }
      );
    }

    const cfStatus = verifiedCashfreeOrder?.order_status;
    const cfAmount = verifiedCashfreeOrder?.order_amount;
    const expectedAmountRupees = order.total_amount_paise / 100;

    // 5. Amount mismatch protection
    if (cfAmount !== undefined && Math.abs(cfAmount - expectedAmountRupees) > 0.01) {
      console.error(
        `Payment amount mismatch for ${orderNumber}: expected ₹${expectedAmountRupees}, received ₹${cfAmount}`
      );
      await supabase.from('payments').insert({
        order_id: order.id,
        payment_gateway: 'cashfree',
        cf_order_id: verifiedCashfreeOrder.cf_order_id || String(orderNumber),
        payment_status: 'FAILED',
        amount_paise: Math.round(cfAmount * 100),
        currency: 'INR',
        gateway_response: { ...payload, error: 'Amount mismatch detected' },
      });
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
    }

    // 6. Update database & trigger fulfillment only if Cashfree confirms PAID
    if (cfStatus === 'PAID') {
      await supabase
        .from('payments')
        .upsert(
          {
            order_id: order.id,
            payment_gateway: 'cashfree',
            cf_order_id: String(verifiedCashfreeOrder.cf_order_id || orderNumber),
            cf_payment_id: String(paymentData?.cf_payment_id || verifiedCashfreeOrder.cf_order_id),
            payment_method: paymentData?.payment_group || 'Prepaid',
            payment_status: 'SUCCESS',
            amount_paise: order.total_amount_paise,
            currency: 'INR',
            gateway_response: verifiedCashfreeOrder,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cf_order_id' }
        );

      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Trigger asynchronous outbox fulfilment
      await queueAndProcessFulfilmentJob(order.id);
    } else {
      await supabase
        .from('payments')
        .upsert(
          {
            order_id: order.id,
            payment_gateway: 'cashfree',
            cf_order_id: String(verifiedCashfreeOrder?.cf_order_id || orderNumber),
            payment_status: cfStatus === 'ACTIVE' ? 'PENDING' : 'FAILED',
            amount_paise: order.total_amount_paise,
            currency: 'INR',
            gateway_response: verifiedCashfreeOrder,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cf_order_id' }
        );
    }

    return NextResponse.json({ status: 'OK', verifiedStatus: cfStatus });
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
