import { NextResponse } from 'next/server';
import { queueAndProcessFulfilmentJob } from '@/lib/qikink/queue';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const result = await queueAndProcessFulfilmentJob(orderId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Retry failed' }, { status: 500 });
  }
}

