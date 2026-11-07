import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database admin client unavailable' }, { status: 500 });
    }

    // 1. Fetch Orders with order_items, payments, fulfilment_jobs
    const { data: orders, error: ordersError } = await supabase
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
          unit_price_paise
        ),
        payments (
          id,
          status,
          amount_paise,
          gateway_payment_id
        ),
        fulfilment_jobs (
          id,
          status,
          qikink_order_id,
          retry_count,
          last_error
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (ordersError) {
      console.error('Error fetching admin orders overview:', ordersError);
      return NextResponse.json({ error: ordersError.message }, { status: 500 });
    }

    const orderList = orders || [];

    // Calculate metrics
    let totalRevenuePaise = 0;
    let paidOrdersCount = 0;
    let activeFulfilments = 0;
    let stalledJobs = 0;

    orderList.forEach((ord) => {
      const isPaid =
        ord.status === 'paid' ||
        ord.payments?.some((p: any) => p.status === 'SUCCESS');

      if (isPaid) {
        paidOrdersCount += 1;
        totalRevenuePaise += ord.total_amount_paise || 0;
      }

      const activeJob = ord.fulfilment_jobs?.find((j: any) =>
        ['queued', 'processing', 'submitted'].includes(j.status)
      );
      if (activeJob) activeFulfilments += 1;

      const failedJob = ord.fulfilment_jobs?.find((j: any) => j.status === 'failed');
      if (failedJob) stalledJobs += 1;
    });

    const recentOrders = orderList.slice(0, 10).map((ord) => {
      const address = ord.shipping_address as any;
      const customerName =
        address?.fullName ||
        address?.name ||
        (address?.first_name ? `${address.first_name} ${address.last_name || ''}` : 'Customer');
      const city = address?.city ? ` (${address.city})` : '';

      const firstItem = ord.order_items?.[0];
      const itemCount = ord.order_items?.length || 0;
      const productSummary = firstItem
        ? `${firstItem.product_name || 'Apparel Item'}${firstItem.variant_name ? ` (${firstItem.variant_name})` : ''}${itemCount > 1 ? ` +${itemCount - 1} more` : ''}`
        : 'Apparel Item';

      const latestPayment = ord.payments?.[0];
      const paymentStatus =
        latestPayment?.status === 'SUCCESS' || ord.status === 'paid'
          ? 'PAID (Cashfree)'
          : ord.status === 'pending'
          ? 'PENDING'
          : ord.status?.toUpperCase() || 'UNPAID';

      const latestJob = ord.fulfilment_jobs?.[0];
      const qikinkStatus = latestJob
        ? latestJob.status === 'submitted'
          ? `Submitted to Qikink (${latestJob.qikink_order_id || 'Queued'})`
          : latestJob.status === 'failed'
          ? 'Fulfilment Failed'
          : latestJob.status === 'processing'
          ? 'In Processing'
          : 'Pending Payment'
        : 'Pending Payment';

      return {
        id: ord.order_number,
        dbId: ord.id,
        customer: `${customerName}${city}`,
        product: productSummary,
        amount: `₹${((ord.total_amount_paise || 0) / 100).toLocaleString('en-IN')}`,
        payment: paymentStatus,
        qikinkStatus,
        time: new Date(ord.created_at).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    // Fetch live products for catalog stats
    const products = await getProducts();
    const topProducts = products.slice(0, 4).map((p) => ({
      id: p.id,
      name: p.name,
      fabric: p.fabric_info?.split(',')?.[0] || '100% Combed Cotton',
      price: (p.base_price_paise / 100).toFixed(0),
    }));

    return NextResponse.json({
      metrics: {
        totalRevenue: `₹${(totalRevenuePaise / 100).toLocaleString('en-IN')}`,
        totalOrders: orderList.length.toString(),
        paidOrdersCount: paidOrdersCount.toString(),
        activeFulfilments: activeFulfilments.toString(),
        stalledJobs: stalledJobs.toString(),
        fulfilmentHealth:
          orderList.length > 0 && stalledJobs === 0
            ? '100%'
            : orderList.length > 0
            ? `${Math.round(((orderList.length - stalledJobs) / orderList.length) * 100)}%`
            : '100%',
      },
      recentOrders,
      topProducts,
    });
  } catch (err: any) {
    console.error('Admin overview handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

