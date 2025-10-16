import { TenantContext, DEFAULT_TENANT } from '@/lib/tenant/context';

/**
 * Client-side tenant context hook
 * 
 * For use in client components where we need tenant information.
 * This should be used sparingly and cached appropriately.
 */
export function useTenantContext(): TenantContext {
  // In client components, we'll need to fetch this via API
  // For now, return a basic implementation
  const tenantSlug = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1] || 'default'
    : 'default';

  return {
    tenantId: tenantSlug,
    tenantSlug,
    strategy: 'path' as const,
    tier: 'starter' as const,
    limits: DEFAULT_TENANT.limits,
    features: DEFAULT_TENANT.features,
    status: 'active' as const,
    subscription: DEFAULT_TENANT.subscription,
  };
}

// Re-export utilities from context module
export { 
  hasTenantFeature, 
  checkTenantLimit, 
  getTenantRateLimit 
} from '@/lib/tenant/context';