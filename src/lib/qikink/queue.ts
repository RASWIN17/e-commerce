import { qikinkClient, QikinkCreateOrderPayload, QikinkLineItem } from './client';
import { createAdminClient } from '../supabase/admin';

export interface ProcessOrderResult {
  success: boolean;
  qikinkOrderId?: string;
  error?: string;
  jobStatus: string;
}

/**
 * Processes a fulfilment job for a paid order idempotently
 */
export async function queueAndProcessFulfilmentJob(orderId: string): Promise<ProcessOrderResult> {
  const supabase = createAdminClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase admin client not configured. Cannot process fulfilment job.',
      jobStatus: 'failed',
    };
  }

  // 1. Fetch order details, address snapshot, and items
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return { success: false, error: 'Order not found', jobStatus: 'failed' };
  }

  // Check if order is paid
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .eq('payment_status', 'SUCCESS')
    .single();

  if (!payment) {
    return { success: false, error: 'Order has not confirmed payment yet', jobStatus: 'queued' };
  }

  // 2. Check if a fulfilment job already exists (Idempotency check)
  const { data: existingJob } = await supabase
    .from('fulfilment_jobs')
    .select('*')
    .eq('order_id', orderId)
    .single();

  if (existingJob && ['submitted', 'shipped', 'delivered'].includes(existingJob.status)) {
    return {
      success: true,
      qikinkOrderId: existingJob.qikink_order_id,
      jobStatus: existingJob.status,
    };
  }

  // 3. Create or lock fulfilment job record
  let jobId = existingJob?.id;
  if (!jobId) {
    const { data: newJob, error: createJobErr } = await supabase
      .from('fulfilment_jobs')
      .insert({
        order_id: orderId,
        provider: 'qikink',
        status: 'processing',
        retry_count: 0,
        max_retries: 5,
      })
      .select('id')
      .single();

    if (createJobErr || !newJob) {
      return { success: false, error: 'Could not create fulfilment job', jobStatus: 'failed' };
    }
    jobId = newJob.id;
  } else {
    await supabase
      .from('fulfilment_jobs')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', jobId);
  }

  // 4. Construct Qikink payload
  const address = order.shipping_address_snapshot || {};
  const nameParts = (address.full_name || 'Valued Customer').trim().split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || firstName;

  const lineItems: QikinkLineItem[] = (order.order_items || []).map((item: any) => {
    const design = item.design_snapshot;
    return {
      sku: item.qikink_sku || item.sku,
      quantity: String(item.quantity || 1),
      price: String(((item.unit_price_paise || 0) / 100).toFixed(2)),
      designs: design
        ? [
            {
              design_code: design.design_code,
              design_link: design.artwork_url,
              placement: design.placement || 'front',
              width: design.print_width,
              height: design.print_height,
            },
          ]
        : undefined,
    };
  });

  const qikinkPayload: QikinkCreateOrderPayload = {
    order_number: order.order_number,
    qikink_shipping: '1',
    gateway: 'Prepaid',
    total_order_value: String(((order.total_amount_paise || 0) / 100).toFixed(2)),
    line_items: lineItems,
    shipping_address: {
      first_name: firstName,
      last_name: lastName,
      address1: address.address_line1 || 'Main St',
      address2: address.address_line2 || '',
      city: address.city || 'Tirupur',
      province: address.state || 'Tamil Nadu',
      zip: address.postal_code || '641602',
      phone: address.phone || order.guest_phone || '9999999999',
      email: order.guest_email || 'orders@imagix.in',
      country_code: 'IN',
    },
  };

  try {
    const response = await qikinkClient.createOrder(qikinkPayload);
    const qkOrderId = response.qikink_order_id || response.order_id || String(response.id || '');

    if (response.status || qkOrderId) {
      // Update job to submitted
      await supabase
        .from('fulfilment_jobs')
        .update({
          status: 'submitted',
          qikink_order_id: qkOrderId,
          payload_sent: qikinkPayload,
          response_received: response,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      // Update order status to in_production
      await supabase
        .from('orders')
        .update({ status: 'in_production', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      // Create initial shipment entry
      await supabase.from('shipments').insert({
        order_id: orderId,
        fulfilment_job_id: jobId,
        courier_name: 'Qikink Logistics Hub',
        current_status: 'Order queued for DTG printing',
        tracking_history: [
          {
            status: 'Production Staged',
            location: 'Tirupur Hub',
            timestamp: new Date().toISOString(),
            description: 'Artwork verified and blank staged for printing.',
          },
        ],
      });

      return {
        success: true,
        qikinkOrderId: qkOrderId,
        jobStatus: 'submitted',
      };
    } else {
      throw new Error(response.message || 'Qikink order creation rejected');
    }
  } catch (err: any) {
    const errorMsg = err.message || 'Network error connecting to Qikink';
    const nextRetry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes backoff

    await supabase
      .from('fulfilment_jobs')
      .update({
        status: 'failed',
        last_error: errorMsg,
        retry_count: (existingJob?.retry_count || 0) + 1,
        next_retry_at: nextRetry.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return {
      success: false,
      error: errorMsg,
      jobStatus: 'failed',
    };
  }
}
