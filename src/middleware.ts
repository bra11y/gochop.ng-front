import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Tenant Context Middleware
 * 
 * This middleware implements multi-tenant architecture by extracting tenant information
 * from the request URL and injecting it into headers for downstream consumption.
 * 
 * Supports both:
 * 1. Subdomain-based routing: store1.gochop.ng
 * 2. Path-based routing: gochop.ng/store1
 * 
 * Based on Shopify's multi-tenant architecture patterns.
 */
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  
  let tenantId: string | null = null;
  let tenantSlug: string | null = null;
  let routingStrategy: 'subdomain' | 'path' | 'default' = 'default';

  // Strategy 1: Subdomain-based tenant extraction (store1.gochop.ng)
  if (hostname.includes('.gochop.ng') && !hostname.startsWith('www.')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'gochop' && subdomain !== 'api') {
      tenantId = subdomain;
      tenantSlug = subdomain;
      routingStrategy = 'subdomain';
    }
  }

  // Strategy 2: Path-based tenant extraction (/store-slug)
  if (!tenantId) {
    const pathMatch = pathname.match(/^\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const potentialSlug = pathMatch[1];
      
      // Skip system routes
      const systemRoutes = [
        'api', '_next', 'favicon.ico', 'robots.txt', 'sitemap.xml',
        'onboarding', 'start-free', 'login', 'signup', 'admin'
      ];
      
      if (!systemRoutes.includes(potentialSlug)) {
        tenantId = potentialSlug;
        tenantSlug = potentialSlug;
        routingStrategy = 'path';
      }
    }
  }

  // Create request headers for tenant context
  const requestHeaders = new Headers(request.headers);
  
  // Inject tenant context into headers
  requestHeaders.set('x-tenant-id', tenantId || 'default');
  requestHeaders.set('x-tenant-slug', tenantSlug || 'default');
  requestHeaders.set('x-tenant-strategy', routingStrategy);
  requestHeaders.set('x-original-pathname', pathname);
  requestHeaders.set('x-original-hostname', hostname);

  // Add tenant context for API routes
  if (pathname.startsWith('/api')) {
    requestHeaders.set('x-api-tenant-context', JSON.stringify({
      tenantId: tenantId || 'default',
      tenantSlug: tenantSlug || 'default',
      strategy: routingStrategy,
      timestamp: Date.now()
    }));
  }

  // For subdomain routing, rewrite URLs to internal paths
  if (routingStrategy === 'subdomain' && tenantSlug) {
    // Rewrite subdomain.gochop.ng/path to gochop.ng/tenant-slug/path
    url.pathname = `/${tenantSlug}${pathname}`;
    url.hostname = 'gochop.ng';
    
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For all other requests, just pass through with tenant headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware configuration
 * 
 * This matcher ensures the middleware runs on all relevant routes
 * while excluding static assets and system files.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. _next/static (static files)
     * 2. _next/image (image optimization files)
     * 3. favicon.ico (favicon file)
     * 4. public files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};