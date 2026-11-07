import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Admin database client unavailable' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount_paise,
        created_at,
        shipping_address,
        order_items (
          id,
          product_name,
          variant_name,
          quantity,
          unit_price_paise,
          qikink_sku
        ),
        payments (
          id,
          status,
          amount_paise,
          gateway_order_id,
          gateway_payment_id
        ),
        fulfilment_jobs (
          id,
          status,
          qikink_order_id,
          retry_count,
          last_error
        ),
        shipments (
          id,
          carrier,
          tracking_number,
          tracking_url,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      if (status === 'paid') {
        query = query.eq('status', 'paid');
      } else if (status === 'pending') {
        query = query.eq('status', 'pending');
      } else if (status === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching admin orders:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let formattedOrders = (orders || []).map((ord) => {
      const address = ord.shipping_address as any;
      const customerName =
        address?.fullName ||
        address?.name ||
        (address?.first_name ? `${address.first_name} ${address.last_name || ''}` : 'Customer');
      const email = address?.email || 'customer@imagix.in';

      const latestPayment = ord.payments?.[0];
      const latestJob = ord.fulfilment_jobs?.[0];
      const latestShipment = ord.shipments?.[0];

      return {
        id: ord.order_number,
        dbId: ord.id,
        customerName,
        email,
        totalRupees: Math.round((ord.total_amount_paise || 0) / 100),
        paymentStatus:
          latestPayment?.status === 'SUCCESS' || ord.status === 'paid'
            ? 'PAID'
            : ord.status?.toUpperCase() || 'PENDING',
        gatewayRef: latestPayment?.gateway_payment_id || latestPayment?.gateway_order_id || 'N/A',
        fulfilmentStatus: latestJob?.status || (ord.status === 'paid' ? 'queued' : 'pending'),
        qikinkOrderId: latestJob?.qikink_order_id || null,
        carrier: latestShipment?.carrier || null,
        trackingNumber: latestShipment?.tracking_number || null,
        retryCount: latestJob?.retry_count || 0,
        lastError: latestJob?.last_error || undefined,
        createdAt: ord.created_at,
        items: ord.order_items || [],
      };
    });

    if (search.trim()) {
      const s = search.toLowerCase();
      formattedOrders = formattedOrders.filter(
        (o) =>
          o.id.toLowerCase().includes(s) ||
          o.customerName.toLowerCase().includes(s) ||
          o.email.toLowerCase().includes(s) ||
          (o.qikinkOrderId && o.qikinkOrderId.toLowerCase().includes(s))
      );
    }

    return NextResponse.json({ orders: formattedOrders });
  } catch (err: any) {
    console.error('Admin orders API exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

