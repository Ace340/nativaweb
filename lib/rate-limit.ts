/**
 * Rate limiting middleware
 * Provides basic rate limiting for API routes
 *
 * NOTE: In production, use Redis or Vercel KV for distributed rate limiting
 */

const createLogger = () => ({
  info: (msg: string, data?: any) => console.log(`[rate-limit] ${msg}`, data || ""),
  warn: (msg: string, data?: any) => console.warn(`[rate-limit] ${msg}`, data || ""),
});

const logger = createLogger();

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Simple in-memory store (use Redis in production)
const store: RateLimitStore = {};

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { maxRequests: 100, windowMs: 60000 }
): { allowed: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const { maxRequests, windowMs } = options;

  // Clean up expired entries
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });

  // Check if identifier exists in store
  if (!store[identifier]) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: store[identifier].resetTime,
    };
  }

  // Check if window has expired
  if (store[identifier].resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: store[identifier].resetTime,
    };
  }

  // Check if limit exceeded
  if (store[identifier].count >= maxRequests) {
    logger.warn("Rate limit exceeded", { identifier, count: store[identifier].count });

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: store[identifier].resetTime,
    };
  }

  // Increment count
  store[identifier].count++;

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - store[identifier].count,
    reset: store[identifier].resetTime,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (for Vercel, AWS, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "unknown";
}

/**
 * Rate limiting error response
 */
export function createRateLimitResponse(reset: number) {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(reset).toISOString(),
        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    }
  );
}