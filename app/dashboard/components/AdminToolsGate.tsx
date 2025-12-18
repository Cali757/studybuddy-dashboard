// Admin Tools Gate Component - Shows upgrade prompt for admin tools
// Phase 7A: Pricing Tiers & Upsells

import { useRouter } from 'next/navigation';
import { SubscriptionTier, PRICING_TIERS } from '@/lib/pricingTiers';

interface AdminToolsGateProps {
  tier: SubscriptionTier;
  feature: 'adminTools' | 'dataExport';
  onClose?: () => void;
}

export default function AdminToolsGate({ tier, feature, onClose }: AdminToolsGateProps) {
  const router = useRouter();
  const tierConfig = PRICING_TIERS[tier];
  const requiredTier = feature === 'adminTools' ? 'team' : 'pro';
  const requiredConfig = PRICING_TIERS[requiredTier];

  const featureInfo = {
    adminTools: {
      icon: '🛠️',
      title: 'Admin Tools Locked',
      description: 'Advanced admin tools are available on the Team plan.',
      features: [
        { icon: '📊', text: 'Advanced analytics dashboard' },
        { icon: '👥', text: 'Team management tools' },
        { icon: '📄', text: 'Bulk operations' },
        { icon: '⚙️', text: 'Custom configurations' }
      ]
    },
    dataExport: {
      icon: '📥',
      title: 'Data Export Locked',
      description: 'Data export is available on Pro and Team plans.',
      features: [
        { icon: '💾', text: 'Export all your lessons' },
        { icon: '📝', text: 'Export notes and summaries' },
        { icon: '📊', text: 'Export quiz results' },
        { icon: '📁', text: 'Multiple export formats' }
      ]
    }
  };

  const info = featureInfo[feature];

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
          {info.icon}
        </div>
        
        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {info.title}
        </h2>
        
        {/* Message */}
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          textAlign: 'center',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {info.description}
        </p>
        
        {/* Features List */}
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
            Unlock these features:
          </div>
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            {info.features.map((feat, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                {feat.icon} <strong>{feat.text}</strong>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pricing Info */}
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
          padding: '16px',
          background: requiredTier === 'team' 
            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '4px' }}>Upgrade to {requiredConfig.displayName}</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>${requiredConfig.price}/month</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            {requiredConfig.features.aiCallsPerMonth} AI calls + 
            {requiredConfig.features.maxLessons === -1 ? ' unlimited' : ` ${requiredConfig.features.maxLessons}`} lessons
          </div>
        </div>
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => router.push('/pricing')}
            style={{
              flex: 1,
              background: requiredTier === 'team'
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Upgrade to {requiredConfig.displayName}
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
