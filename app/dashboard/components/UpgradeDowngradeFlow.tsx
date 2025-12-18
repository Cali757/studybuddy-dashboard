// Upgrade/Downgrade Flow Component
// Phase 7A: Pricing Tiers & Upsells

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionTier, PRICING_TIERS } from '@/lib/pricingTiers';

interface UpgradeDowngradeFlowProps {
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  onClose: () => void;
}

export default function UpgradeDowngradeFlow({ currentTier, targetTier, onClose }: UpgradeDowngradeFlowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentConfig = PRICING_TIERS[currentTier];
  const targetConfig = PRICING_TIERS[targetTier];
  
  const isUpgrade = targetConfig.price > currentConfig.price;
  const isDowngrade = targetConfig.price < currentConfig.price;
  const priceDiff = Math.abs(targetConfig.price - currentConfig.price);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement Stripe subscription update
      // This will call a Cloud Function or API route to update the subscription
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTier,
          priceId: targetConfig.stripePriceId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      
      // Redirect to success page or refresh
      router.push('/dashboard?subscription=updated');
    } catch (err) {
      setError('Failed to update subscription. Please try again.');
      console.error('Subscription update error:', err);
    } finally {
      setLoading(false);
    }
  };

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
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Title */}
        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          {isUpgrade ? '⬆️ Upgrade' : isDowngrade ? '⬇️ Downgrade' : 'Change'} Your Plan
        </h2>
        
        {/* Current vs Target */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '20px',
          marginBottom: '24px',
          alignItems: 'center'
        }}>
          {/* Current Plan */}
          <div style={{
            background: '#f3f4f6',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Current</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              {currentConfig.displayName}
            </div>
            <div style={{ fontSize: '18px', color: '#4b5563' }}>${currentConfig.price}/mo</div>
          </div>
          
          {/* Arrow */}
          <div style={{ fontSize: '24px', color: '#6b7280' }}>
            →
          </div>
          
          {/* Target Plan */}
          <div style={{
            background: isUpgrade ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f3f4f6',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            color: isUpgrade ? 'white' : '#1f2937'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>New Plan</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
              {targetConfig.displayName}
            </div>
            <div style={{ fontSize: '18px' }}>${targetConfig.price}/mo</div>
          </div>
        </div>
        
        {/* Changes Summary */}
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>
            What changes:
          </div>
          
          <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
            <span style={{ color: isUpgrade ? '#10b981' : '#ef4444' }}>
              {isUpgrade ? '↑' : '↓'}
            </span>
            {' '}AI Calls: {currentConfig.features.aiCallsPerMonth} → <strong>{targetConfig.features.aiCallsPerMonth}</strong>/month
          </div>
          
          <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
            <span style={{ color: isUpgrade ? '#10b981' : '#ef4444' }}>
              {isUpgrade ? '↑' : '↓'}
            </span>
            {' '}Lessons: {currentConfig.features.maxLessons === -1 ? 'Unlimited' : currentConfig.features.maxLessons} → <strong>{targetConfig.features.maxLessons === -1 ? 'Unlimited' : targetConfig.features.maxLessons}</strong>
          </div>
          
          {targetConfig.features.voiceEnabled !== currentConfig.features.voiceEnabled && (
            <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
              {targetConfig.features.voiceEnabled ? '✓ Voice features enabled' : '✗ Voice features disabled'}
            </div>
          )}
          
          {targetConfig.features.dataExport !== currentConfig.features.dataExport && (
            <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
              {targetConfig.features.dataExport ? '✓ Data export enabled' : '✗ Data export disabled'}
            </div>
          )}
          
          {targetConfig.features.adminTools !== currentConfig.features.adminTools && (
            <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
              {targetConfig.features.adminTools ? '✓ Admin tools enabled' : '✗ Admin tools disabled'}
            </div>
          )}
        </div>
        
        {/* Billing Info */}
        <div style={{
          background: isUpgrade ? '#ecfdf5' : '#fef3c7',
          border: `1px solid ${isUpgrade ? '#10b981' : '#f59e0b'}`,
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#1f2937' }}>
            {isUpgrade && (
              <>
                <strong>Billing:</strong> You'll be charged a prorated amount of <strong>${priceDiff}</strong> for the remainder of this billing period.
              </>
            )}
            {isDowngrade && (
              <>
                <strong>Billing:</strong> Your new rate of <strong>${targetConfig.price}/month</strong> will take effect at the start of your next billing cycle.
              </>
            )}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px',
            color: '#991b1b',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              flex: 1,
              background: isUpgrade 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : '#6b7280',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Processing...' : `Confirm ${isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Change'}`}
          </button>
          
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              background: 'white',
              color: '#6b7280',
              border: '2px solid #e5e7eb',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
