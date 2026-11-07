import { NextResponse } from 'next/server';
import { qikinkClient } from '@/lib/qikink/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        {
          error: 'Missing order id parameter. Usage: /api/admin/qikink/order?id=<qikink_order_id>',
          example: '/api/admin/qikink/order?id=28186368',
        },
        { status: 400 }
      );
    }

    const orderData = await qikinkClient.getOrderStatus(orderId);
    return NextResponse.json(orderData, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Failed to fetch order status from Qikink',
      },
      { status: 500 }
    );
  }
}
