// CLIENT-SIDE AUTHENTICATION UTILITIES
// Handles authentication in client components without Next.js server dependencies

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { supabase } from './supabase/client'

// Types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'platform_admin' | 'store_owner' | 'customer' | 'support_agent'
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive'
  avatarUrl?: string
  createdAt: Date
  lastLoginAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-jwt-key'
)

class ClientAuthService {
  // Get auth token from localStorage/cookies
  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token') || null
  }

  // Set auth token
  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  }

  // Remove auth token
  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<any> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      return payload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // Login user via API
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const { user, token } = await response.json()
    this.setToken(token)
    
    return { user, token }
  }

  // Register user via API
  async register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: 'store_owner' | 'customer'
  }): Promise<{ user: User; token: string }> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const { user, token } = await response.json()
    this.setToken(token)
    
    return { user, token }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      this.removeToken()
    }
  }

  // Get current user from stored token
  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken() // Invalid token
        }
        return null
      }

      const { user } = await response.json()
      return user
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  // Check if user has required permissions
  hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole)
  }

  // Check if user is admin
  isAdmin(userRole: string): boolean {
    return userRole === 'platform_admin'
  }

  // Check authentication status
  async checkAuth(requiredRoles?: string[]): Promise<User | null> {
    const user = await this.getCurrentUser()
    
    if (!user) return null
    
    if (requiredRoles && !this.hasPermission(user.role, requiredRoles)) {
      throw new Error('Insufficient permissions')
    }

    return user
  }
}

// Export singleton instance
export const clientAuth = new ClientAuthService()

// React hook for authentication
export function useAuth() {
  return {
    login: clientAuth.login.bind(clientAuth),
    register: clientAuth.register.bind(clientAuth),
    logout: clientAuth.logout.bind(clientAuth),
    getCurrentUser: clientAuth.getCurrentUser.bind(clientAuth),
    checkAuth: clientAuth.checkAuth.bind(clientAuth),
    hasPermission: clientAuth.hasPermission.bind(clientAuth),
    isAdmin: clientAuth.isAdmin.bind(clientAuth)
  }
}