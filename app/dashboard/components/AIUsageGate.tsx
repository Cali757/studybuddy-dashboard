// AI Usage Gate Component - Shows upgrade prompt when limit is reached
// Phase 7A: Pricing Tiers & Upsells

import { useRouter } from 'next/navigation';
import { SubscriptionTier, PRICING_TIERS } from '@/lib/pricingTiers';

interface AIUsageGateProps {
  tier: SubscriptionTier;
  currentUsage: number;
  onClose?: () => void;
}

export default function AIUsageGate({ tier, currentUsage, onClose }: AIUsageGateProps) {
  const router = useRouter();
  const tierConfig = PRICING_TIERS[tier];
  const limit = tierConfig.features.aiCallsPerMonth;
  
  const nextTier = tier === 'starter' ? 'pro' : 'team';
  const nextTierConfig = PRICING_TIERS[nextTier];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          🚨
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          AI Usage Limit Reached
        </h2>
        
        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          You've used <strong>{currentUsage} of {limit}</strong> AI calls this month on your <strong>{tierConfig.displayName}</strong> plan.
        </p>
        
        {/* Upgrade Benefits */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Upgrade to {nextTierConfig.displayName} and get:
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            <div style={{ marginBottom: '8px' }}>
              ✓ <strong>{nextTierConfig.features.aiCallsPerMonth}</strong> AI calls/month
            </div>
            {nextTierConfig.features.voiceEnabled && !tierConfig.features.voiceEnabled && (
              <div style={{ marginBottom: '8px' }}>
                ✓ <strong>Voice interaction</strong> with StudyBuddy
              </div>
            )}
            {nextTierConfig.features.dataExport && !tierConfig.features.dataExport && (
              <div style={{ marginBottom: '8px' }}>
                ✓ <strong>Data export</strong> capabilities
              </div>
            )}
            <div style={{ marginBottom: '8px' }}>
              ✓ <strong>{nextTierConfig.features.maxLessons === -1 ? 'Unlimited' : nextTierConfig.features.maxLessons}</strong> lessons
            </div>
          </div>
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Upgrade Now
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: 'white',
                color: '#6b7280',
                border: '2px solid #e5e7eb',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
