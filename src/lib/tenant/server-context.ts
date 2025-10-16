import { headers } from 'next/headers';
import { cache } from 'react';

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
 * Server-side tenant context getter (for use in Server Components)
 * 
 * Uses React cache() to prevent duplicate fetches within the same request.
 * In production, this should be backed by Redis for performance.
 */
export const getServerTenantContext = cache(async (): Promise<TenantContext> => {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id') || 'default';
    const tenantSlug = headersList.get('x-tenant-slug') || 'default';
    const strategy = (headersList.get('x-tenant-strategy') || 'default') as TenantContext['strategy'];

    // For development/demo, return enriched context based on tenant ID
    if (tenantId === 'default') {
      return DEFAULT_TENANT;
    }

    // In production, this would fetch from cache/database
    const tenant = await fetchTenantConfig(tenantId);
    
    return {
      ...DEFAULT_TENANT,
      ...tenant,
      tenantId,
      tenantSlug,
      strategy,
    };
  } catch (error) {
    console.error('Failed to get tenant context:', error);
    return DEFAULT_TENANT;
  }
});

/**
 * Fetch tenant configuration from database/cache
 * 
 * This function will be enhanced with proper caching in Phase 1.
 * For now, it provides a basic implementation for development.
 */
async function fetchTenantConfig(tenantId: string): Promise<Partial<TenantContext>> {
  // TODO: Replace with actual database/cache lookup
  // For now, return mock data based on tenant ID patterns
  
  if (tenantId.includes('pro')) {
    return {
      tier: 'pro',
      limits: {
        products: 1000,
        orders: 10000,
        storage: 10000,
        bandwidth: 100,
        api_calls: 100000,
      },
      features: [
        'advanced_analytics',
        'custom_domain',
        'api_access',
        'priority_support',
        'white_label',
      ],
    };
  }

  if (tenantId.includes('growth')) {
    return {
      tier: 'growth',
      limits: {
        products: 200,
        orders: 2000,
        storage: 1000,
        bandwidth: 10,
        api_calls: 10000,
      },
      features: [
        'advanced_analytics',
        'custom_domain',
        'email_support',
      ],
    };
  }

  // Default to starter tier
  return {
    tier: 'starter',
    limits: DEFAULT_TENANT.limits,
    features: DEFAULT_TENANT.features,
  };
}

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