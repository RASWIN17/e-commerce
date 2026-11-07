import crypto from 'crypto';

export interface VerifyWebhookResult {
  isValid: boolean;
  error?: string;
  data?: any;
}

/**
 * Verifies a Cashfree payment webhook signature
 * Official Cashfree signature algorithm:
 * expectedSignature = Base64(HMAC-SHA256(timestamp + rawBody, clientSecret))
 */
export function verifyCashfreeWebhook(
  rawBody: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secretKeyOverride?: string
): VerifyWebhookResult {
  const secretKey = secretKeyOverride || process.env.CASHFREE_SECRET_KEY || '';

  if (!secretKey) {
    // If not configured, we flag in non-production environments
    if (process.env.NODE_ENV === 'development') {
      try {
        const parsed = JSON.parse(rawBody);
        return { isValid: true, data: parsed };
      } catch (err: any) {
        return { isValid: false, error: 'Invalid JSON payload' };
      }
    }
    return { isValid: false, error: 'Cashfree secret key not configured on server' };
  }

  if (!signatureHeader || !timestampHeader) {
    return { isValid: false, error: 'Missing webhook signature or timestamp headers' };
  }

  // Prevent replay attacks (check if timestamp is older than 15 minutes)
  const webhookTime = parseInt(timestampHeader, 10);
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - webhookTime) > 900) {
    return { isValid: false, error: 'Webhook timestamp expired or out of sync' };
  }

  try {
    const signaturePayload = `${timestampHeader}${rawBody}`;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signaturePayload);
    const expectedSignature = hmac.digest('base64');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      return { isValid: false, error: 'Signature mismatch' };
    }

    const data = JSON.parse(rawBody);
    return { isValid: true, data };
  } catch (err: any) {
    return { isValid: false, error: `Signature verification exception: ${err.message}` };
  }
}

