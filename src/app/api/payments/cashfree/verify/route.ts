import { NextResponse } from 'next/server';
import { cashfreeClient } from '@/lib/cashfree/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { queueAndProcessFulfilmentJob } from '@/lib/qikink/queue';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('order_id');

    if (!orderNumber) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    // 1. Fetch internal order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*, order_items(*), payments(*), fulfilment_jobs(*), shipments(*)')
      .eq('order_number', orderNumber)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // If order is already confirmed, in_production, or dispatched, return current state
    if (['confirmed', 'in_production', 'dispatched', 'delivered'].includes(order.status)) {
      return NextResponse.json({
        success: true,
        order,
        paymentStatus: 'PAID',
        verified: true,
      });
    }

    // 2. Query Cashfree server-side API for official status
    let cfOrder: any = null;
    try {
      cfOrder = await cashfreeClient.getOrderDetails(orderNumber);
    } catch (cfErr: any) {
      console.warn('Cashfree server inquiry returned:', cfErr.message);
      return NextResponse.json({
        success: true,
        order,
        paymentStatus: 'PENDING',
        verified: false,
        note: 'Payment status pending verification with gateway',
      });
    }

    const cfStatus = cfOrder?.order_status;
    const cfAmount = cfOrder?.order_amount;
    const expectedAmount = order.total_amount_paise / 100;

    // Verify amount match
    if (cfStatus === 'PAID') {
      if (cfAmount !== undefined && Math.abs(cfAmount - expectedAmount) > 0.01) {
        console.error(`Amount mismatch on verification for ${orderNumber}`);
        return NextResponse.json(
          { error: 'Payment amount mismatch between gateway and invoice' },
          { status: 400 }
        );
      }

      // Update payment record in Supabase
      await supabase
        .from('payments')
        .upsert(
          {
            order_id: order.id,
            payment_gateway: 'cashfree',
            cf_order_id: String(cfOrder.cf_order_id || orderNumber),
            payment_status: 'SUCCESS',
            amount_paise: order.total_amount_paise,
            currency: 'INR',
            gateway_response: cfOrder,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'cf_order_id' }
        );

      // Update order status to confirmed
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // Trigger Qikink fulfilment job
      await queueAndProcessFulfilmentJob(order.id);

      // Refresh order data
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*, order_items(*), payments(*), fulfilment_jobs(*), shipments(*)')
        .eq('id', order.id)
        .single();

      return NextResponse.json({
        success: true,
        order: updatedOrder || order,
        paymentStatus: 'PAID',
        verified: true,
      });
    }

    return NextResponse.json({
      success: true,
      order,
      paymentStatus: cfStatus || 'PENDING',
      verified: false,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json({ error: err.message || 'Verification failed' }, { status: 500 });
  }
}

