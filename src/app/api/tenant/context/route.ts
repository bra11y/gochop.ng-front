import { NextRequest, NextResponse } from 'next/server';
import { getServerTenantContext } from '@/lib/tenant/server-context';

/**
 * Tenant Context API Endpoint
 * 
 * This endpoint provides a way to test and debug tenant context extraction.
 * It returns the current tenant information based on the request headers
 * injected by the middleware.
 */
export async function GET(request: NextRequest) {
  try {
    // Get tenant context from middleware headers
    const tenantContext = await getServerTenantContext();
    
    // Get original request information for debugging
    const originalHeaders = {
      'x-tenant-id': request.headers.get('x-tenant-id'),
      'x-tenant-slug': request.headers.get('x-tenant-slug'),
      'x-tenant-strategy': request.headers.get('x-tenant-strategy'),
      'x-original-pathname': request.headers.get('x-original-pathname'),
      'x-original-hostname': request.headers.get('x-original-hostname'),
      'x-api-tenant-context': request.headers.get('x-api-tenant-context'),
    };

    // Return comprehensive tenant information
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      tenant: tenantContext,
      headers: originalHeaders,
      request: {
        url: request.url,
        method: request.method,
        pathname: request.nextUrl.pathname,
        hostname: request.headers.get('host'),
      }
    });
  } catch (error) {
    console.error('Tenant context API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Health check endpoint for tenant routing
 * 
 * This can be used by monitoring systems to verify
 * that tenant context is working correctly.
 */
export async function HEAD(request: NextRequest) {
  try {
    const context = await getServerTenantContext();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Tenant-Health': 'OK',
        'X-Tenant-ID': context.tenantId,
        'X-Tenant-Tier': context.tier,
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'X-Tenant-Health': 'ERROR',
      },
    });
  }
}