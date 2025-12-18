// AI Usage Gating - Enforce tier limits on AI calls
// Phase 7A: Pricing Tiers & Upsells

import { checkAIUsage, incrementAIUsage } from './tierChecks';
import { PRICING_TIERS } from './pricingTiers';

export interface AIGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  currentUsage?: number;
  limit?: number;
}

/**
 * Gate AI calls based on user's tier and usage
 * Call this before any AI operation
 */
export async function gateAICall(uid: string): Promise<AIGateResult> {
  const usageCheck = await checkAIUsage(uid);
  
  if (!usageCheck.allowed) {
    return {
      allowed: false,
      reason: usageCheck.reason || 'AI usage limit reached',
      upgradeRequired: true,
      currentUsage: usageCheck.currentUsage,
      limit: usageCheck.limit
    };
  }
  
  return { allowed: true };
}

/**
 * Record an AI call and increment usage counter
 * Call this after a successful AI operation
 */
export async function recordAICall(uid: string): Promise<void> {
  await incrementAIUsage(uid);
}

/**
 * Get user's AI usage status
 */
export async function getAIUsageStatus(uid: string) {
  const usageCheck = await checkAIUsage(uid);
  return {
    currentUsage: usageCheck.currentUsage || 0,
    limit: usageCheck.limit,
    remaining: usageCheck.limit ? usageCheck.limit - (usageCheck.currentUsage || 0) : 0,
    percentUsed: usageCheck.limit ? ((usageCheck.currentUsage || 0) / usageCheck.limit) * 100 : 0
  };
}
