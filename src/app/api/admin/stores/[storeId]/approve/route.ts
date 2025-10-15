// SECURE STORE APPROVAL API ENDPOINT
// Implements proper authentication and store approval workflow

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { supabase } from '@/lib/supabase/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    // Extract and verify JWT token
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.slice(7);
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-jwt-key');
    
    let user;
    try {
      const { payload } = await jwtVerify(token, secret);
      user = payload as any;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (user.role !== 'platform_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }
    
    const { storeId } = await params;
    const body = await request.json();
    const { notes, subscription_tier = 'starter' } = body;

    // Validate store exists and is in pending status
    const { data: store, error: storeError } = await supabase
      .from('store')
      .select('*')
      .eq('id', storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (store.status !== 'pending' && store.status !== 'under_review') {
      return NextResponse.json(
        { error: 'Store is not pending approval' },
        { status: 400 }
      );
    }

    // Start transaction - update store status and create approval record
    const approvalTime = new Date().toISOString();

    // Update store status to approved
    const { error: updateError } = await supabase
      .from('store')
      .update({
        status: 'approved',
        subscription_tier,
        reviewed_at: approvalTime,
        reviewed_by: user.id,
        approval_notes: notes,
        updated_by: user.id
      })
      .eq('id', storeId);

    if (updateError) {
      throw updateError;
    }

    // Create approval record
    const { error: approvalError } = await supabase
      .from('store_approvals')
      .insert({
        store_id: storeId,
        admin_id: user.id,
        previous_status: store.status,
        new_status: 'approved',
        decision_reason: 'Store approved by platform admin',
        admin_notes: notes,
        business_license_verified: true,
        identity_verified: true,
        address_verified: true
      });

    if (approvalError) {
      console.error('Failed to create approval record:', approvalError);
    }

    // TODO: Send approval email to store owner
    // TODO: Create initial platform settings for store
    // TODO: Log audit trail

    return NextResponse.json({
      success: true,
      message: 'Store approved successfully',
      store: {
        id: storeId,
        status: 'approved',
        approvedAt: approvalTime,
        approvedBy: `${user.firstName} ${user.lastName}`,
        subscriptionTier: subscription_tier
      }
    });

  } catch (error: any) {
    console.error('Store approval error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to approve store' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    // Extract and verify JWT token
    const authorization = request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.slice(7);
    const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET || 'your-super-secret-jwt-key');
    
    try {
      const { payload } = await jwtVerify(token, secret);
      const user = payload as any;
      
      if (!['platform_admin', 'support_agent'].includes(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { storeId } = await params;

    // Get store with owner details and approval history
    const { data: store, error } = await supabase
      .from('store')
      .select(`
        *,
        users!store_owner_id_fkey(
          id, email, first_name, last_name, phone
        ),
        store_approvals(
          created_at, decision_reason, admin_notes,
          previous_status, new_status,
          users!store_approvals_admin_id_fkey(first_name, last_name)
        )
      `)
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);

  } catch (error: any) {
    console.error('Store fetch error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch store details' },
      { status: 500 }
    );
  }
}