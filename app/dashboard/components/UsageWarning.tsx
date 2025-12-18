// Usage Warning Component - Shows when user is approaching tier limits
// Phase 7A: Pricing Tiers & Upsells

import { useRouter } from 'next/navigation';
import { PRICING_TIERS, SubscriptionTier } from '@/lib/pricingTiers';

interface UsageWarningProps {
  tier: SubscriptionTier;
  aiUsage: number;
  lessonCount?: number;
}

export default function UsageWarning({ tier, aiUsage, lessonCount = 0 }: UsageWarningProps) {
  const router = useRouter();
  const tierConfig = PRICING_TIERS[tier];
  const aiLimit = tierConfig.features.aiCallsPerMonth;
  const lessonLimit = tierConfig.features.maxLessons;
  
  const aiUsagePercent = (aiUsage / aiLimit) * 100;
  const lessonUsagePercent = lessonLimit === -1 ? 0 : (lessonCount / lessonLimit) * 100;
  
  const showAIWarning = aiUsagePercent >= 80;
  const showLessonWarning = lessonLimit !== -1 && lessonUsagePercent >= 80;
  
  if (!showAIWarning && !showLessonWarning) {
    return null;
  }

  return (
    <div style={{
      background: aiUsagePercent >= 100 || lessonUsagePercent >= 100 
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
            {aiUsagePercent >= 100 || lessonUsagePercent >= 100 ? '⚠️ Limit Reached' : '⚠️ Approaching Limit'}
          </div>
          
          {showAIWarning && (
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              AI Usage: {aiUsage} / {aiLimit} calls ({Math.round(aiUsagePercent)}%)
            </div>
          )}
          
          {showLessonWarning && (
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              Lessons: {lessonCount} / {lessonLimit} ({Math.round(lessonUsagePercent)}%)
            </div>
          )}
          
          <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '8px' }}>
            {aiUsagePercent >= 100 || lessonUsagePercent >= 100
              ? 'Upgrade to continue using StudyBuddy'
              : 'Consider upgrading for higher limits'}
          </div>
        </div>
        
        <button
          onClick={() => router.push('/pricing')}
          style={{
            background: 'white',
            color: aiUsagePercent >= 100 || lessonUsagePercent >= 100 ? '#ef4444' : '#f59e0b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            marginLeft: '16px',
            whiteSpace: 'nowrap'
          }}
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
