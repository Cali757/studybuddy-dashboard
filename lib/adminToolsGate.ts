// Admin Tools Gating - Enforce tier requirements for admin tools
// Phase 7A: Pricing Tiers & Upsells

import { checkAdminToolsAccess, checkDataExportAccess } from './tierChecks';
import { PRICING_TIERS } from './pricingTiers';

export interface AdminToolsGateResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  requiredTier?: string;
}

/**
 * Gate admin tools based on user's tier
 * Call this before showing admin tools features
 */
export async function gateAdminTools(uid: string): Promise<AdminToolsGateResult> {
  const accessCheck = await checkAdminToolsAccess(uid);
  
  if (!accessCheck.allowed) {
    return {
      allowed: false,
      reason: accessCheck.reason || 'Admin tools require Team tier',
      upgradeRequired: true,
      requiredTier: 'team'
    };
  }
  
  return { allowed: true };
}

/**
 * Gate data export based on user's tier
 * Call this before allowing data export
 */
export async function gateDataExport(uid: string): Promise<AdminToolsGateResult> {
  const accessCheck = await checkDataExportAccess(uid);
  
  if (!accessCheck.allowed) {
    return {
      allowed: false,
      reason: accessCheck.reason || 'Data export requires Pro or Team tier',
      upgradeRequired: true,
      requiredTier: 'pro'
    };
  }
  
  return { allowed: true };
}

/**
 * Check if admin tools are available for a tier
 */
export function areAdminToolsAvailableForTier(tier: 'starter' | 'pro' | 'team'): boolean {
  return PRICING_TIERS[tier].features.adminTools;
}

/**
 * Check if data export is available for a tier
 */
export function isDataExportAvailableForTier(tier: 'starter' | 'pro' | 'team'): boolean {
  return PRICING_TIERS[tier].features.dataExport;
}
