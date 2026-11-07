import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyCashfreeWebhook } from '../lib/cashfree/webhook';

describe('Cashfree Payment Webhook Verification', () => {
  const secretKey = 'test_secret_key_imagix_pod';

  it('successfully verifies a genuine Cashfree HMAC-SHA256 signature', () => {
    const rawBody = JSON.stringify({
      type: 'PAYMENT_SUCCESS_WEBHOOK',
      data: {
        order: { order_id: 'IMX-839201' },
        payment: { payment_status: 'SUCCESS', cf_payment_id: 'cf_12345' },
      },
    });

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payload = `${timestamp}${rawBody}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(payload);
    const validSignature = hmac.digest('base64');

    const result = verifyCashfreeWebhook(rawBody, validSignature, timestamp, secretKey);
    expect(result.isValid).toBe(true);
    expect(result.data?.data?.order?.order_id).toBe('IMX-839201');
  });

  it('rejects tampered webhook payloads', () => {
    const rawBody = JSON.stringify({ order_id: 'IMX-839201', amount: 799 });
    const tamperedBody = JSON.stringify({ order_id: 'IMX-839201', amount: 1 }); // tampered!
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${timestamp}${rawBody}`);
    const signature = hmac.digest('base64');

    const result = verifyCashfreeWebhook(tamperedBody, signature, timestamp, secretKey);
    expect(result.isValid).toBe(false);
  });
});

