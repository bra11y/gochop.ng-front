// ENTERPRISE-GRADE MIDDLEWARE FOR ROUTE PROTECTION
// Implements role-based access control with session management

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Define route patterns and required permissions
const PROTECTED_ROUTES = {
  '/admin': ['platform_admin', 'support_agent'],
  '/admin/stores': ['platform_admin'],
  '/admin/users': ['platform_admin'],
  '/admin/analytics': ['platform_admin', 'support_agent'],
  '/store/manage': ['store_owner', 'platform_admin'],
  '/api/admin': ['platform_admin'],
  '/api/stores/approve': ['platform_admin']
} as const

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register', 
  '/onboarding',
  '/api/auth',
  '/api/stores/public'
]

// JWT secret from environment
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

interface UserPayload {
  id: string
  email: string
  role: 'platform_admin' | 'store_owner' | 'customer' | 'support_agent'
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive'
  sessionId: string
}

// Verify JWT token and extract user data
async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch (error) {
    return null
  }
}

// Check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

// Get required roles for a protected route
function getRequiredRoles(pathname: string): string[] | null {
  for (const [pattern, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(pattern)) {
      return [...roles]
    }
  }
  return null
}

// Enhanced security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  // CSP for admin routes
  if (response.url.includes('/admin')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    )
  }
  
  return response
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return addSecurityHeaders(NextResponse.next())
  }

  // Check if route requires authentication
  const requiredRoles = getRequiredRoles(pathname)
  
  if (!requiredRoles) {
    // Route doesn't require specific permissions, but may need auth
    return addSecurityHeaders(NextResponse.next())
  }

  // Protected route - verify token
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify and validate token
  const user = await verifyToken(token)
  
  if (!user) {
    // Invalid token - redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return addSecurityHeaders(response)
  }

  // Check user status
  if (user.status !== 'active') {
    const response = NextResponse.redirect(new URL('/account-suspended', request.url))
    return addSecurityHeaders(response)
  }

  // Check role permissions
  if (!requiredRoles.includes(user.role)) {
    const response = NextResponse.redirect(new URL('/unauthorized', request.url))
    return addSecurityHeaders(response)
  }

  // Rate limiting for admin routes
  if (pathname.startsWith('/admin')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `admin_rate_limit:${ip}:${user.id}`
    
    // In production, implement Redis-based rate limiting
    // For now, add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', '99')
    response.headers.set('X-RateLimit-Reset', String(Date.now() + 3600000))
    
    return addSecurityHeaders(response)
  }

  // Add user context to request headers for API routes
  const response = NextResponse.next()
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', user.role)
  response.headers.set('x-session-id', user.sessionId)

  return addSecurityHeaders(response)
}

// Configure matcher for specific routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes that start with /api/auth (authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}