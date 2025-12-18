// Voice Feature Gating - Enforce tier requirements for voice features
// Phase 7A & 7D: Pricing Tiers & Voice Features

import { checkVoiceAccess } from './tierChecks';
import { PRICING_TIERS } from './pricingTiers';

export interface VoiceGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  requiredTier?: string;
}

/**
 * Gate voice features based on user's tier
 * Call this before enabling voice interaction
 */
export async function gateVoiceFeature(uid: string): Promise<VoiceGateResult> {
  const accessCheck = await checkVoiceAccess(uid);
  
  if (!accessCheck.allowed) {
    return {
      allowed: false,
      reason: accessCheck.reason || 'Voice features require Pro or Team tier',
      upgradeRequired: true,
      requiredTier: 'pro'
    };
  }
  
  return { allowed: true };
}

/**
 * Check if voice features are available for a tier
 */
export function isVoiceAvailableForTier(tier: 'starter' | 'pro' | 'team'): boolean {
  return PRICING_TIERS[tier].features.voiceEnabled;
}
