// ENTERPRISE AUTHENTICATION SYSTEM
// Implements secure JWT-based authentication with role management

import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
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

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: 'store_owner' | 'customer'
}

export interface AuthSession {
  user: User
  sessionId: string
  expiresAt: Date
}

// Constants
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key'
)
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

class AuthService {
  // Hash password with bcrypt
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Generate JWT token
  async generateToken(payload: any, expiresIn = SESSION_DURATION): Promise<string> {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Date.now() + expiresIn)
      .sign(JWT_SECRET)
    
    return jwt
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

  // Check if user account is locked
  async isAccountLocked(userId: string): Promise<boolean> {
    const { data: user } = await supabase
      .from('users')
      .select('login_attempts, locked_until')
      .eq('id', userId)
      .single()

    if (!user) return false

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return true
    }

    return user.login_attempts >= MAX_LOGIN_ATTEMPTS
  }

  // Update login attempts
  async updateLoginAttempts(userId: string, success: boolean): Promise<void> {
    if (success) {
      // Reset attempts on successful login
      await supabase
        .from('users')
        .update({
          login_attempts: 0,
          locked_until: null,
          last_login_at: new Date().toISOString()
        })
        .eq('id', userId)
    } else {
      // Increment attempts and potentially lock account
      const { data: user } = await supabase
        .from('users')
        .select('login_attempts')
        .eq('id', userId)
        .single()

      const newAttempts = (user?.login_attempts || 0) + 1
      const updates: any = { login_attempts: newAttempts }

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        updates.locked_until = new Date(Date.now() + LOCKOUT_DURATION).toISOString()
      }

      await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email.toLowerCase())
      .single()

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role || 'customer',
        status: 'pending_verification'
      })
      .select(`
        id, email, first_name, last_name, role, status, 
        avatar_url, created_at, last_login_at
      `)
      .single()

    if (error || !user) {
      throw new Error('Failed to create user account')
    }

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token_hash: await this.hashPassword(sessionId),
        expires_at: expiresAt.toISOString()
      })

    // Generate JWT
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId
    })

    const formattedUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatar_url,
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined
    }

    return { user: formattedUser, token }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const { email, password } = credentials

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, password_hash, first_name, last_name, role, status,
        avatar_url, created_at, last_login_at, login_attempts, locked_until
      `)
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      throw new Error('Invalid email or password')
    }

    // Check if account is locked
    if (await this.isAccountLocked(user.id)) {
      throw new Error('Account is temporarily locked due to too many failed attempts')
    }

    // Check if user is active
    if (user.status !== 'active' && user.status !== 'pending_verification') {
      throw new Error('Account is suspended or inactive')
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password_hash)
    
    if (!isValidPassword) {
      await this.updateLoginAttempts(user.id, false)
      throw new Error('Invalid email or password')
    }

    // Update login success
    await this.updateLoginAttempts(user.id, true)

    // Create session
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        token_hash: await this.hashPassword(sessionId),
        expires_at: expiresAt.toISOString()
      })

    // Generate JWT
    const token = await this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      sessionId
    })

    const formattedUser: User = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatar_url,
      createdAt: new Date(user.created_at),
      lastLoginAt: new Date()
    }

    return { user: formattedUser, token }
  }

  // Logout user
  async logout(sessionId?: string): Promise<void> {
    if (sessionId) {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
    }
  }

  // Get current user from token
  async getCurrentUser(token: string): Promise<User | null> {
    try {
      const payload = await this.verifyToken(token)
      
      // Verify session is still active
      const { data: session } = await supabase
        .from('user_sessions')
        .select('id, expires_at, is_active')
        .eq('user_id', payload.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!session || new Date(session.expires_at) < new Date()) {
        return null
      }

      // Get fresh user data
      const { data: user } = await supabase
        .from('users')
        .select(`
          id, email, first_name, last_name, role, status,
          avatar_url, created_at, last_login_at
        `)
        .eq('id', payload.id)
        .single()

      if (!user) return null

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        createdAt: new Date(user.created_at),
        lastLoginAt: user.last_login_at ? new Date(user.last_login_at) : undefined
      }
    } catch (error) {
      return null
    }
  }

  // Set auth cookie
  setAuthCookie(token: string): void {
    const cookieStore = cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/'
    })
  }

  // Remove auth cookie
  removeAuthCookie(): void {
    const cookieStore = cookies()
    cookieStore.delete('auth_token')
  }

  // Check permissions
  hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole)
  }

  // Check if user is admin
  isAdmin(userRole: string): boolean {
    return userRole === 'platform_admin'
  }

  // Clean up expired sessions
  async cleanupExpiredSessions(): Promise<void> {
    await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString())
  }
}

// Export singleton instance
export const authService = new AuthService()

// Helper functions for server components
export async function getServerUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null
  
  return authService.getCurrentUser(token)
}

export async function requireAuth(requiredRoles?: string[]): Promise<User> {
  const user = await getServerUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }

  if (requiredRoles && !authService.hasPermission(user.role, requiredRoles)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

// Client-side auth context helper
export function createAuthContext() {
  return {
    login: authService.login.bind(authService),
    register: authService.register.bind(authService),
    logout: authService.logout.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    hasPermission: authService.hasPermission.bind(authService),
    isAdmin: authService.isAdmin.bind(authService)
  }
}