import { NextResponse } from 'next/server';
import { verifyCashfreeWebhook } from '@/lib/cashfree/webhook';
import { createAdminClient } from '@/lib/supabase/admin';
import { queueAndProcessFulfilmentJob } from '@/lib/qikink/queue';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    const verification = verifyCashfreeWebhook(rawBody, signature, timestamp);
    if (!verification.isValid) {
      console.warn('Unauthorized Cashfree webhook attempt:', verification.error);
      return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 401 });
    }

    const payload = verification.data;
    const eventType = payload?.type || 'PAYMENT_SUCCESS_WEBHOOK';
    const eventId = payload?.event_time || `evt_${Date.now()}`;
    const orderData = payload?.data?.order;
    const paymentData = payload?.data?.payment;
    const orderNumber = orderData?.order_id;

    if (!orderNumber) {
      return NextResponse.json({ message: 'Missing order_id in webhook data' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ status: 'OK', simulated: true });
    }

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

    const { data: order } = await supabase
      .from('orders')
      .select('id, status')
      .eq('order_number', orderNumber)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Matching internal order not found' }, { status: 404 });
    }

    const paymentStatus = paymentData?.payment_status || 'SUCCESS';

    if (paymentStatus === 'SUCCESS') {
      await supabase
        .from('payments')
        .update({
          payment_status: 'SUCCESS',
          cf_payment_id: paymentData?.cf_payment_id || `cf_pay_${Date.now()}`,
          payment_method: paymentData?.payment_group || 'UPI',
          gateway_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order.id);

      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      await queueAndProcessFulfilmentJob(order.id);
    } else {
      await supabase
        .from('payments')
        .update({
          payment_status: 'FAILED',
          gateway_response: payload,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order.id);
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
