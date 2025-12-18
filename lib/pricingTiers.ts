// Pricing Tiers Configuration for StudyBuddy
// Phase 7A: Pricing Tiers & Upsells

export type SubscriptionTier = 'starter' | 'pro' | 'team';

export interface TierConfig {
  name: string;
  displayName: string;
  price: number;
  stripePriceId: string; // To be filled with actual Stripe price IDs
  features: {
    aiCallsPerMonth: number;
    voiceEnabled: boolean;
    adminTools: boolean;
    dataExport: boolean;
    maxLessons: number;
    prioritySupport: boolean;
  };
  description: string;
}

export const PRICING_TIERS: Record<SubscriptionTier, TierConfig> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    price: 20,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '',
    features: {
      aiCallsPerMonth: 100,
      voiceEnabled: false,
      adminTools: false,
      dataExport: false,
      maxLessons: 10,
      prioritySupport: false,
    },
    description: 'Perfect for individual students getting started',
  },
  pro: {
    name: 'pro',
    displayName: 'Pro',
    price: 39,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: {
      aiCallsPerMonth: 500,
      voiceEnabled: true,
      adminTools: false,
      dataExport: true,
      maxLessons: 50,
      prioritySupport: true,
    },
    description: 'For serious learners who want voice interaction and higher limits',
  },
  team: {
    name: 'team',
    displayName: 'Team',
    price: 79,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID || '',
    features: {
      aiCallsPerMonth: 2000,
      voiceEnabled: true,
      adminTools: true,
      dataExport: true,
      maxLessons: -1, // unlimited
      prioritySupport: true,
    },
    description: 'For teams and power users with admin tools and unlimited lessons',
  },
};

// Helper function to get tier configuration
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return PRICING_TIERS[tier];
}

// Helper function to check if a feature is available for a tier
export function hasFeature(
  tier: SubscriptionTier,
  feature: keyof TierConfig['features']
): boolean {
  return PRICING_TIERS[tier].features[feature] as boolean;
}

// Helper function to get AI call limit for a tier
export function getAICallLimit(tier: SubscriptionTier): number {
  return PRICING_TIERS[tier].features.aiCallsPerMonth;
}

// Helper function to get max lessons for a tier
export function getMaxLessons(tier: SubscriptionTier): number {
  return PRICING_TIERS[tier].features.maxLessons;
}

// Helper function to check if user can perform action based on usage
export function canPerformAICall(
  tier: SubscriptionTier,
  currentUsage: number
): boolean {
  const limit = getAICallLimit(tier);
  return currentUsage < limit;
}

// Helper function to get tier from price
export function getTierFromPrice(priceId: string): SubscriptionTier | null {
  for (const [tier, config] of Object.entries(PRICING_TIERS)) {
    if (config.stripePriceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

// Default tier for new users
export const DEFAULT_TIER: SubscriptionTier = 'starter';
