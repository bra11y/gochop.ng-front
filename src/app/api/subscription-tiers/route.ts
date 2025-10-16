// PUBLIC API FOR SUBSCRIPTION PRICING
// Used by homepage and other public pages to display current pricing

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Cache settings
const CACHE_DURATION = 300; // 5 minutes
let cachedTiers: any = null;
let cacheExpiry = 0;

export async function GET(request: NextRequest) {
  try {
    const now = Date.now();
    
    // Check if we have valid cached data
    if (cachedTiers && now < cacheExpiry) {
      return NextResponse.json({
        success: true,
        data: cachedTiers,
        cached: true
      });
    }

    // Fetch active subscription tiers from database
    const { data: tiers, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      throw error;
    }

    // Transform database format to frontend format
    const formattedTiers = (tiers as any[])?.map((tier: any) => ({
      id: tier.name,
      name: tier.display_name,
      price_monthly: tier.price_monthly,
      price_yearly: tier.price_monthly * 10, // 2 months discount
      description: tier.features?.description || `Perfect for ${tier.display_name.toLowerCase()} level businesses`,
      features: Array.isArray(tier.features?.list) ? tier.features.list : [
        tier.limits?.max_products > 0 ? `Up to ${tier.limits.max_products} products` : 'Unlimited products',
        tier.limits?.max_orders_per_month > 0 ? `Up to ${tier.limits.max_orders_per_month} orders/month` : 'Unlimited orders',
        tier.features?.analytics ? 'Advanced analytics' : 'Basic analytics',
        tier.features?.support || 'Email support'
      ],
      limits: {
        products: tier.limits?.max_products || -1,
        storage_gb: tier.limits?.storage_gb || 10,
        monthly_orders: tier.limits?.max_orders_per_month || -1,
        custom_domain: tier.features?.custom_domain || false,
        analytics: tier.features?.analytics || false,
        whatsapp_integration: tier.features?.whatsapp || false,
        priority_support: tier.features?.priority_support || false
      },
      target_audience: tier.features?.target_audience || 'Growing businesses',
      popular: tier.name === 'growth' // Mark growth as popular by default
    }));

    // Cache the results
    cachedTiers = formattedTiers;
    cacheExpiry = now + (CACHE_DURATION * 1000);

    const response = NextResponse.json({
      success: true,
      data: formattedTiers,
      last_updated: new Date().toISOString()
    });

    // Set cache headers
    response.headers.set('Cache-Control', `public, max-age=${CACHE_DURATION}, stale-while-revalidate=60`);
    response.headers.set('X-Cache', 'MISS');

    return response;

  } catch (error: any) {
    console.error('Failed to fetch subscription tiers:', error);
    
    // Return fallback pricing if database fails
    const fallbackTiers = [
      {
        id: 'starter',
        name: 'Starter',
        price_monthly: 0,
        price_yearly: 0,
        description: 'Perfect for new businesses getting started',
        features: [
          'Up to 50 products',
          'Basic store customization',
          'Community support'
        ],
        limits: {
          products: 50,
          storage_gb: 1,
          monthly_orders: 100,
          custom_domain: false,
          analytics: false,
          whatsapp_integration: false,
          priority_support: false
        },
        target_audience: 'Students, home bakers, small vendors'
      },
      {
        id: 'growth',
        name: 'Growth',
        price_monthly: 2500,
        price_yearly: 25000,
        description: 'For growing businesses ready to scale',
        features: [
          'Up to 500 products',
          'Advanced store layouts',
          'WhatsApp Business integration',
          'Email support'
        ],
        limits: {
          products: 500,
          storage_gb: 5,
          monthly_orders: 1000,
          custom_domain: true,
          analytics: true,
          whatsapp_integration: true,
          priority_support: false
        },
        target_audience: 'Small businesses, local shops',
        popular: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: fallbackTiers,
      fallback: true,
      error: 'Using fallback pricing due to database error'
    });
  }
}