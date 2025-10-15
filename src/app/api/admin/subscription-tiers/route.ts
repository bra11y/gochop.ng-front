// ADMIN API FOR MANAGING SUBSCRIPTION TIERS
// Allows platform admin to update pricing that reflects across the platform

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase/client';

// GET - Retrieve all subscription tiers for admin management
export async function GET(request: NextRequest) {
  try {
    // Require platform admin authentication
    await requireAuth(['platform_admin']);

    const { data: tiers, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('sort_order');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: tiers
    });

  } catch (error: any) {
    console.error('Failed to fetch subscription tiers:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription tiers' },
      { status: 500 }
    );
  }
}

// POST - Create new subscription tier
export async function POST(request: NextRequest) {
  try {
    // Require platform admin authentication
    const user = await requireAuth(['platform_admin']);

    const body = await request.json();
    const { 
      name, 
      display_name, 
      price_monthly, 
      features, 
      limits, 
      commission_rate, 
      sort_order = 0 
    } = body;

    // Validate required fields
    if (!name || !display_name || price_monthly === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, display_name, price_monthly' },
        { status: 400 }
      );
    }

    // Create new tier
    const { data: tier, error } = await supabase
      .from('subscription_tiers')
      .insert({
        name: name.toLowerCase(),
        display_name,
        price_monthly,
        features: features || {},
        limits: limits || {},
        commission_rate: commission_rate || 0.15,
        sort_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'create_subscription_tier',
        details: { tier_id: tier.id, tier_name: tier.name },
        ip_address: request.ip
      });

    return NextResponse.json({
      success: true,
      data: tier,
      message: 'Subscription tier created successfully'
    });

  } catch (error: any) {
    console.error('Failed to create subscription tier:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription tier' },
      { status: 500 }
    );
  }
}

// PUT - Update existing subscription tier
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(['platform_admin']);

    const body = await request.json();
    const { 
      id,
      name, 
      display_name, 
      price_monthly, 
      features, 
      limits, 
      commission_rate, 
      sort_order,
      is_active 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Tier ID is required' },
        { status: 400 }
      );
    }

    // Update tier
    const { data: tier, error } = await supabase
      .from('subscription_tiers')
      .update({
        ...(name && { name: name.toLowerCase() }),
        ...(display_name && { display_name }),
        ...(price_monthly !== undefined && { price_monthly }),
        ...(features && { features }),
        ...(limits && { limits }),
        ...(commission_rate !== undefined && { commission_rate }),
        ...(sort_order !== undefined && { sort_order }),
        ...(is_active !== undefined && { is_active }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log admin action
    await supabase
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        action_type: 'update_subscription_tier',
        details: { tier_id: id, changes: body },
        ip_address: request.ip
      });

    // Trigger cache invalidation for frontend pricing
    await invalidatePricingCache();

    return NextResponse.json({
      success: true,
      data: tier,
      message: 'Subscription tier updated successfully'
    });

  } catch (error: any) {
    console.error('Failed to update subscription tier:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription tier' },
      { status: 500 }
    );
  }
}

// Helper function to invalidate pricing cache
async function invalidatePricingCache() {
  try {
    // In production, this would trigger cache invalidation
    // For now, we'll update a cache timestamp
    await supabase
      .from('platform_settings')
      .upsert({
        key: 'pricing_last_updated',
        value: `"${new Date().toISOString()}"`,
        description: 'Last time pricing was updated by admin'
      });
  } catch (error) {
    console.error('Failed to invalidate pricing cache:', error);
  }
}