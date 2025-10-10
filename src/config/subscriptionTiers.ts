export interface SubscriptionTier {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  description: string;
  features: string[];
  limits: {
    products: number;
    storage_gb: number;
    monthly_orders: number;
    custom_domain: boolean;
    analytics: boolean;
    whatsapp_integration: boolean;
    priority_support: boolean;
  };
  target_audience: string;
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 0,
    price_yearly: 0,
    description: 'Perfect for new businesses getting started',
    features: [
      'Up to 50 products',
      'Basic store customization',
      'Mobile-optimized storefront',
      'Direct bank transfer payments',
      'Basic analytics',
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
    target_audience: 'Students, home bakers, small vendors',
  },
  {
    id: 'growth',
    name: 'Growth',
    price_monthly: 2500, // ₦2,500 (~$3)
    price_yearly: 25000, // ₦25,000 (~$30/year)
    description: 'For growing businesses ready to scale',
    features: [
      'Up to 500 products',
      'Advanced store layouts',
      'WhatsApp Business integration',
      'Advanced analytics',
      'Custom domain support',
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
  },
  {
    id: 'pro',
    name: 'Professional',
    price_monthly: 5000, // ₦5,000 (~$6)
    price_yearly: 50000, // ₦50,000 (~$60/year)
    description: 'Advanced features for established businesses',
    features: [
      'Unlimited products',
      'Custom branding & themes',
      'API access',
      'Inventory management',
      'Multi-location support',
      'Priority support'
    ],
    limits: {
      products: -1, // Unlimited
      storage_gb: 20,
      monthly_orders: 5000,
      custom_domain: true,
      analytics: true,
      whatsapp_integration: true,
      priority_support: true
    },
    target_audience: 'Restaurants, supermarkets, growing retailers'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: 15000, // ₦15,000 (~$18)
    price_yearly: 150000, // ₦150,000 (~$180/year)
    description: 'Full-scale solution for large operations',
    features: [
      'Everything in Professional',
      'White-label solution',
      'Advanced integrations',
      'Dedicated account manager',
      'Custom development',
      '24/7 phone support'
    ],
    limits: {
      products: -1,
      storage_gb: 100,
      monthly_orders: -1, // Unlimited
      custom_domain: true,
      analytics: true,
      whatsapp_integration: true,
      priority_support: true
    },
    target_audience: 'Large retailers, franchise operations'
  }
];

export const getTierByGrowthStage = (
  monthlyOrders: number,
  productCount: number
): SubscriptionTier => {
  if (monthlyOrders < 100 && productCount < 50) {
    return SUBSCRIPTION_TIERS[0]; // Starter
  } else if (monthlyOrders < 1000 && productCount < 500) {
    return SUBSCRIPTION_TIERS[1]; // Growth
  } else if (monthlyOrders < 5000) {
    return SUBSCRIPTION_TIERS[2]; // Pro
  } else {
    return SUBSCRIPTION_TIERS[3]; // Enterprise
  }
};

export const getUpgradeRecommendation = (
  currentTier: string,
  usage: {
    products: number;
    monthlyOrders: number;
    storageUsed: number;
  }
): { shouldUpgrade: boolean; recommendedTier?: SubscriptionTier; reason?: string } => {
  const current = SUBSCRIPTION_TIERS.find(t => t.id === currentTier);
  if (!current) return { shouldUpgrade: false };

  // Check if hitting limits
  const productLimit = current.limits.products;
  const orderLimit = current.limits.monthly_orders;
  const storageLimit = current.limits.storage_gb;

  if (
    (productLimit > 0 && usage.products >= productLimit * 0.8) ||
    (orderLimit > 0 && usage.monthlyOrders >= orderLimit * 0.8) ||
    usage.storageUsed >= storageLimit * 0.8
  ) {
    const recommended = getTierByGrowthStage(usage.monthlyOrders, usage.products);
    return {
      shouldUpgrade: true,
      recommendedTier: recommended,
      reason: 'You\'re approaching your current plan limits'
    };
  }

  return { shouldUpgrade: false };
};