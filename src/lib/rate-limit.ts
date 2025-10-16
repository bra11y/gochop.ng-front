import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Enterprise-Grade Rate Limiting System
 *
 * Multi-layered rate limiting following Stripe's approach:
 * 1. IP-based limiting (anti-abuse)
 * 2. Tenant-based limiting (fair resource allocation)
 * 3. Endpoint-specific limiting (resource protection)
 * 4. Subscription tier limiting (business logic)
 *
 * Algorithms used:
 * - Sliding Window: For consistent rate control
 * - Token Bucket: For burst handling
 * - Fixed Window: For simple endpoint protection
 */

// Initialize Redis connection (serverless-optimized)
const redis = Redis.fromEnv();

// Rate Limiter Instances (cached for performance)
const rateLimiters = {
  // Layer 1: IP-based rate limiting (anti-abuse)
  ipLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute per IP
    analytics: true,
    prefix: "rl:ip",
  }),

  // Layer 2: Tenant-based rate limiting (fair allocation)
  tenantLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 m"), // 1000 requests per minute per tenant
    analytics: true,
    prefix: "rl:tenant",
  }),

  // Layer 3: API endpoint protection
  apiLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(50, "1 m", 100), // Burst handling for API calls
    analytics: true,
    prefix: "rl:api",
  }),

  // Layer 4: Authentication endpoints (special protection)
  authLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"), // Very strict for auth endpoints
    analytics: true,
    prefix: "rl:auth",
  }),

  // Layer 5: Store creation (prevents spam)
  storeCreationLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(2, "1 h"), // 2 stores per hour per IP
    analytics: true,
    prefix: "rl:store_creation",
  }),

  // Layer 6: Order placement (prevents abuse)
  orderLimiter: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 orders per minute per tenant
    analytics: true,
    prefix: "rl:orders",
  }),
};

/**
 * Rate limit check result interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
  blocked: boolean;
  reason?: string;
  retryAfter?: number;
}

/**
 * Extract client IP from request (handles proxies)
 */
function getClientIP(request: NextRequest): string {
  // Handle Vercel/Cloudflare forwarded IPs
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Handle direct connections
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to remote address
  return request.headers.get("x-client-ip") || "unknown";
}

/**
 * Get tenant ID from request headers (injected by middleware)
 */
function getTenantId(request: NextRequest): string {
  return request.headers.get("x-tenant-id") || "default";
}

/**
 * Determine endpoint type for specific rate limiting
 */
function getEndpointType(
  pathname: string,
): "api" | "auth" | "store_creation" | "orders" | "general" {
  if (
    pathname.includes("/api/auth") ||
    pathname.includes("/login") ||
    pathname.includes("/signup")
  ) {
    return "auth";
  }

  if (pathname.includes("/api/stores") && pathname.includes("POST")) {
    return "store_creation";
  }

  if (pathname.includes("/api/orders")) {
    return "orders";
  }

  if (pathname.startsWith("/api/")) {
    return "api";
  }

  return "general";
}

/**
 * Multi-layered rate limiting check
 *
 * Implements Stripe-style layered protection:
 * 1. Check IP-based limits (prevent DDoS)
 * 2. Check tenant-based limits (fair resource allocation)
 * 3. Check endpoint-specific limits (protect sensitive operations)
 */
export async function checkRateLimit(
  request: NextRequest,
): Promise<RateLimitResult> {
  const startTime = Date.now();
  const clientIP = getClientIP(request);
  const tenantId = getTenantId(request);
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const endpointType = getEndpointType(pathname);

  try {
    // Layer 1: IP-based rate limiting (most critical)
    const ipResult = await rateLimiters.ipLimiter.limit(clientIP);

    if (!ipResult.success) {
      // Log rate limit hit for monitoring
      Sentry.addBreadcrumb({
        message: "IP rate limit exceeded",
        data: {
          ip: clientIP,
          tenant: tenantId,
          endpoint: pathname,
          remaining: ipResult.remaining,
        },
        level: "warning",
      });

      return {
        success: false,
        limit: ipResult.limit,
        remaining: ipResult.remaining,
        reset: ipResult.reset,
        blocked: true,
        reason: "IP rate limit exceeded",
        retryAfter: Math.ceil((ipResult.reset.getTime() - Date.now()) / 1000),
      };
    }

    // Layer 2: Tenant-based rate limiting
    const tenantResult = await rateLimiters.tenantLimiter.limit(tenantId);

    if (!tenantResult.success) {
      Sentry.addBreadcrumb({
        message: "Tenant rate limit exceeded",
        data: {
          tenant: tenantId,
          endpoint: pathname,
          remaining: tenantResult.remaining,
        },
        level: "warning",
      });

      return {
        success: false,
        limit: tenantResult.limit,
        remaining: tenantResult.remaining,
        reset: tenantResult.reset,
        blocked: true,
        reason: "Tenant rate limit exceeded",
        retryAfter: Math.ceil(
          (tenantResult.reset.getTime() - Date.now()) / 1000,
        ),
      };
    }

    // Layer 3: Endpoint-specific rate limiting
    let endpointResult;
    const endpointKey = `${tenantId}:${clientIP}:${endpointType}`;

    switch (endpointType) {
      case "auth":
        endpointResult = await rateLimiters.authLimiter.limit(endpointKey);
        break;
      case "store_creation":
        endpointResult =
          await rateLimiters.storeCreationLimiter.limit(clientIP);
        break;
      case "orders":
        endpointResult = await rateLimiters.orderLimiter.limit(tenantId);
        break;
      case "api":
        endpointResult = await rateLimiters.apiLimiter.limit(
          `${tenantId}:${pathname}`,
        );
        break;
      default:
        // No specific endpoint limiting for general requests
        endpointResult = {
          success: true,
          limit: 1000,
          remaining: 999,
          reset: new Date(),
        };
    }

    if (!endpointResult.success) {
      Sentry.addBreadcrumb({
        message: "Endpoint rate limit exceeded",
        data: {
          tenant: tenantId,
          endpoint: pathname,
          endpointType,
          remaining: endpointResult.remaining,
        },
        level: "warning",
      });

      return {
        success: false,
        limit: endpointResult.limit,
        remaining: endpointResult.remaining,
        reset: endpointResult.reset,
        blocked: true,
        reason: `${endpointType} rate limit exceeded`,
        retryAfter: Math.ceil(
          (endpointResult.reset.getTime() - Date.now()) / 1000,
        ),
      };
    }

    // All checks passed - log successful request for analytics
    const duration = Date.now() - startTime;

    if (duration > 100) {
      // Log slow rate limit checks
      Sentry.addBreadcrumb({
        message: "Slow rate limit check",
        data: {
          duration,
          tenant: tenantId,
          endpoint: pathname,
        },
        level: "info",
      });
    }

    // Return the most restrictive result for client information
    const mostRestrictive = [ipResult, tenantResult, endpointResult].reduce(
      (min, current) => (current.remaining < min.remaining ? current : min),
    );

    return {
      success: true,
      limit: mostRestrictive.limit,
      remaining: mostRestrictive.remaining,
      reset: mostRestrictive.reset,
      blocked: false,
    };
  } catch (error) {
    // Rate limiting failure should not block requests
    Sentry.captureException(error, {
      tags: {
        component: "rate_limiter",
        tenant: tenantId,
        endpoint: pathname,
      },
    });

    // Fail open - allow request but log the error
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 60000),
      blocked: false,
      reason: "Rate limiting service unavailable",
    };
  }
}

/**
 * Create rate limit response headers (RFC compliant)
 */
export function createRateLimitHeaders(
  result: RateLimitResult,
): Record<string, string> {
  // Defensive programming: ensure reset is a valid Date object
  const resetTime =
    result.reset instanceof Date
      ? result.reset.getTime()
      : typeof result.reset === "number"
        ? result.reset
        : Date.now() + 60000;

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
  };

  if (result.blocked && result.retryAfter) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Subscription tier-based rate limiting (future enhancement)
 *
 * This will integrate with the tenant context to provide different
 * limits based on subscription tiers (starter, growth, pro, enterprise)
 */
export async function checkSubscriptionLimits(
  tenantId: string,
  tier: "starter" | "growth" | "pro" | "enterprise",
): Promise<{ allowed: boolean; reason?: string }> {
  // Tier-based monthly limits
  const monthlyLimits = {
    starter: 10000, // 10K requests per month
    growth: 50000, // 50K requests per month
    pro: 200000, // 200K requests per month
    enterprise: -1, // Unlimited
  };

  const limit = monthlyLimits[tier];

  if (limit === -1) {
    return { allowed: true };
  }

  // Check monthly usage (this would integrate with analytics)
  // For now, return allowed - this will be implemented in Phase 3
  return { allowed: true };
}

/**
 * Rate limit analytics and monitoring
 */
export async function getRateLimitAnalytics(tenantId: string): Promise<{
  requests: number;
  blocked: number;
  topEndpoints: { endpoint: string; requests: number }[];
}> {
  // This would integrate with Redis analytics
  // For now, return mock data - will be implemented with analytics dashboard
  return {
    requests: 0,
    blocked: 0,
    topEndpoints: [],
  };
}
