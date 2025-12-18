// Tier Badge Component - Shows user's current subscription tier
// Phase 7A: Pricing Tiers & Upsells

import { useRouter } from 'next/navigation';
import { PRICING_TIERS, SubscriptionTier } from '@/lib/pricingTiers';

interface TierBadgeProps {
  tier: SubscriptionTier;
  showUpgrade?: boolean;
}

export default function TierBadge({ tier, showUpgrade = true }: TierBadgeProps) {
  const router = useRouter();
  const tierConfig = PRICING_TIERS[tier];
  
  const colors = {
    starter: { bg: '#3b82f6', text: 'white' },
    pro: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: 'white' },
    team: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: 'white' }
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        background: colors[tier].bg,
        color: colors[tier].text,
        padding: '6px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {tier === 'team' && '👑'}
        {tier === 'pro' && '⭐'}
        {tier === 'starter' && '🚀'}
        {tierConfig.displayName}
      </div>
      
      {showUpgrade && tier !== 'team' && (
        <button
          onClick={() => router.push('/pricing')}
          style={{
            background: 'transparent',
            border: '2px solid #667eea',
            color: '#667eea',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Upgrade
        </button>
      )}
    </div>
  );
}
