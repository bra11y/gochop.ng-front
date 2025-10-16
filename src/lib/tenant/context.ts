/**
 * Client-safe tenant context types and utilities
 * 
 * This file contains shared types and utilities that can be used
 * in both client and server components.
 */

/**
 * Tenant Context Interface
 * 
 * Defines the structure of tenant information available throughout the application.
 * This enables feature gating, resource limits, and tenant-specific configuration.
 */
export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  strategy: 'subdomain' | 'path' | 'default';
  tier: 'starter' | 'growth' | 'pro' | 'enterprise';
  limits: {
    products: number;
    orders: number;
    storage: number; // in MB
    bandwidth: number; // in GB
    api_calls: number; // per month
  };
  features: string[];
  status: 'active' | 'suspended' | 'pending';
  subscription: {
    expires_at: string | null;
    auto_renew: boolean;
    payment_status: 'current' | 'past_due' | 'cancelled';
  };
}

/**
 * Default tenant configuration for fallback scenarios
 */
export const DEFAULT_TENANT: TenantContext = {
  tenantId: 'default',
  tenantSlug: 'default',
  strategy: 'default',
  tier: 'starter',
  limits: {
    products: 10,
    orders: 100,
    storage: 100,
    bandwidth: 1,
    api_calls: 1000,
  },
  features: ['basic_store', 'product_management', 'order_processing'],
  status: 'active',
  subscription: {
    expires_at: null,
    auto_renew: false,
    payment_status: 'current',
  },
};

/**
 * Utility function to check if tenant has a specific feature
 */
export function hasTenantFeature(context: TenantContext, feature: string): boolean {
  return context.features.includes(feature);
}

/**
 * Utility function to check if tenant is within limits
 */
export function checkTenantLimit(
  context: TenantContext, 
  limitType: keyof TenantContext['limits'], 
  currentUsage: number
): { allowed: boolean; remaining: number; percentage: number } {
  const limit = context.limits[limitType];
  const remaining = Math.max(0, limit - currentUsage);
  const percentage = limit > 0 ? (currentUsage / limit) * 100 : 0;
  
  return {
    allowed: currentUsage < limit,
    remaining,
    percentage,
  };
}

/**
 * Utility function to get tenant API rate limit
 */
export function getTenantRateLimit(context: TenantContext): number {
  const tierLimits = {
    starter: 100,
    growth: 500,
    pro: 2000,
    enterprise: 10000,
  };
  
  return tierLimits[context.tier] || tierLimits.starter;
}