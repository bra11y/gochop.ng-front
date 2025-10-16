import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getServerTenantContext } from '@/lib/tenant/server-context';

/**
 * Tenant Database Router
 * 
 * This class implements database sharding and tenant-aware routing
 * following Shopify's multi-tenant architecture patterns.
 * 
 * Features:
 * - Consistent hashing for tenant-to-shard mapping
 * - Connection pooling per shard
 * - Automatic tenant context injection
 * - Failover support (future enhancement)
 */
export class TenantDatabaseRouter {
  private shards: Map<string, SupabaseClient>;
  private defaultShard: SupabaseClient;

  constructor() {
    // Initialize database shards
    // For now, we use a single Supabase instance
    // In production, this would map to multiple database shards
    this.defaultShard = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.shards = new Map([
      ['shard-1', this.defaultShard],
      // Future shards would be added here:
      // ['shard-2', createClient(SHARD_2_URL, SHARD_2_KEY)],
      // ['shard-3', createClient(SHARD_3_URL, SHARD_3_KEY)],
    ]);
  }

  /**
   * Get the appropriate database shard for a tenant
   * 
   * Uses consistent hashing to ensure the same tenant always
   * maps to the same shard, enabling proper data locality.
   */
  getShardForTenant(tenantId: string): SupabaseClient {
    // For development, always use default shard
    if (process.env.NODE_ENV === 'development') {
      return this.defaultShard;
    }

    // Consistent hashing algorithm
    const shardKey = this.hashTenantToShard(tenantId);
    const shard = this.shards.get(shardKey);
    
    if (!shard) {
      console.warn(`Shard ${shardKey} not found for tenant ${tenantId}, falling back to default`);
      return this.defaultShard;
    }
    
    return shard;
  }

  /**
   * Hash tenant ID to determine shard assignment
   * 
   * This implements a simple modulo-based sharding strategy.
   * In production, consider using consistent hashing algorithms
   * like jump hash or ring hash for better distribution.
   */
  private hashTenantToShard(tenantId: string): string {
    // Simple hash function for tenant ID
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      const char = tenantId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Map to shard index
    const shardIndex = Math.abs(hash) % this.shards.size;
    return `shard-${shardIndex + 1}`;
  }

  /**
   * Execute a query with automatic tenant context
   * 
   * This method ensures that all database queries are executed
   * with the proper tenant context, enabling row-level security.
   */
  async executeWithTenantContext<T>(
    tenantId: string,
    queryFn: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const shard = this.getShardForTenant(tenantId);
    
    // In the future, we could set tenant context at the connection level
    // For now, RLS policies handle tenant isolation
    return await queryFn(shard);
  }

  /**
   * Get all shards (useful for migrations and maintenance)
   */
  getAllShards(): SupabaseClient[] {
    return Array.from(this.shards.values());
  }

  /**
   * Health check for all shards
   */
  async healthCheck(): Promise<{ shard: string; healthy: boolean; latency: number }[]> {
    const results = [];
    
    for (const [shardName, client] of this.shards) {
      const start = Date.now();
      let healthy = false;
      
      try {
        // Simple health check query
        await client.from('store').select('count', { count: 'exact', head: true });
        healthy = true;
      } catch (error) {
        console.error(`Health check failed for ${shardName}:`, error);
      }
      
      const latency = Date.now() - start;
      results.push({ shard: shardName, healthy, latency });
    }
    
    return results;
  }
}

// Singleton instance for the application
export const tenantRouter = new TenantDatabaseRouter();

/**
 * Convenience function to get tenant-aware Supabase client
 * 
 * This is the main function that application code should use
 * to get a properly configured database client.
 */
export async function getTenantDatabase(): Promise<SupabaseClient> {
  try {
    const context = await getServerTenantContext();
    return tenantRouter.getShardForTenant(context.tenantId);
  } catch (error) {
    console.error('Failed to get tenant database:', error);
    // Fallback to default shard
    return tenantRouter.getShardForTenant('default');
  }
}

/**
 * Enhanced query wrapper that includes tenant context and monitoring
 * 
 * This function adds automatic tenant context, query monitoring,
 * and error handling to all database operations.
 */
export async function executeWithMonitoring<T>(
  operation: string,
  queryFn: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  const context = await getServerTenantContext();
  
  try {
    const client = await getTenantDatabase();
    const result = await queryFn(client);
    
    // Log successful operation
    const duration = Date.now() - startTime;
    console.log(`DB Operation: ${operation} | Tenant: ${context.tenantId} | Duration: ${duration}ms`);
    
    return result;
  } catch (error) {
    // Log failed operation
    const duration = Date.now() - startTime;
    console.error(`DB Error: ${operation} | Tenant: ${context.tenantId} | Duration: ${duration}ms`, error);
    
    throw error;
  }
}

/**
 * Batch operation support for multiple tenants
 * 
 * This is useful for system-wide operations like migrations
 * or analytics that need to operate across all tenants.
 */
export async function executeBatchOperation<T>(
  _operation: string,
  queryFn: (client: SupabaseClient, shardName: string) => Promise<T>
): Promise<{ shard: string; result: T | null; error: string | null }[]> {
  const results = [];
  
  for (const [shardName, client] of tenantRouter['shards']) {
    try {
      const result = await queryFn(client, shardName);
      results.push({ shard: shardName, result, error: null });
    } catch (error) {
      results.push({ 
        shard: shardName, 
        result: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return results;
}