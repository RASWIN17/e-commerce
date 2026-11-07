interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const localStore = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  intervalSeconds: number;
  maxRequests: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Server-side rate limiter for API routes
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { intervalSeconds: 60, maxRequests: 30 }
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.intervalSeconds * 1000;
  const existing = localStore.get(identifier);

  // Clean expired
  if (existing && now > existing.resetTime) {
    localStore.delete(identifier);
  }

  const record = localStore.get(identifier) || {
    count: 0,
    resetTime: now + windowMs,
  };

  record.count += 1;
  localStore.set(identifier, record);

  const remaining = Math.max(0, options.maxRequests - record.count);
  const success = record.count <= options.maxRequests;

  return {
    success,
    limit: options.maxRequests,
    remaining,
    resetTime: record.resetTime,
  };
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

