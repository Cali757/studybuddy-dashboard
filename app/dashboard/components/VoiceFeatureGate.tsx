// Voice Feature Gate Component - Shows upgrade prompt for voice features
// Phase 7A & 7D: Pricing Tiers & Voice Features

import { useRouter } from 'next/navigation';
import { SubscriptionTier, PRICING_TIERS } from '@/lib/pricingTiers';

interface VoiceFeatureGateProps {
  tier: SubscriptionTier;
  onClose?: () => void;
}

export default function VoiceFeatureGate({ tier, onClose }: VoiceFeatureGateProps) {
  const router = useRouter();
  const tierConfig = PRICING_TIERS[tier];
  const proConfig = PRICING_TIERS.pro;

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
          🎤
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          Voice Features Locked
        </h2>
        
        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Voice interaction with StudyBuddy is available on <strong>Pro</strong> and <strong>Team</strong> plans.
        </p>
        
        {/* Voice Features List */}
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
            Unlock voice features:
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            <div style={{ marginBottom: '8px' }}>
              🎤 <strong>Ask questions</strong> using your voice
            </div>
            <div style={{ marginBottom: '8px' }}>
              🔊 <strong>Listen to summaries</strong> and explanations
            </div>
            <div style={{ marginBottom: '8px' }}>
              📝 <strong>Review quizzes</strong> with voice feedback
            </div>
            <div style={{ marginBottom: '8px' }}>
              ⚡ <strong>Faster learning</strong> on the go
            </div>
          </div>
        </div>
        
        {/* Pricing Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>Upgrade to Pro</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${proConfig.price}/month</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>+ {proConfig.features.aiCallsPerMonth} AI calls/month</div>
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
            Upgrade to Pro
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
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
