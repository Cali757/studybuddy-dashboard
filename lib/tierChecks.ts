// Tier checking utilities for feature gating
// Phase 7A: Pricing Tiers & Upsells

import { db } from './firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { SubscriptionTier, hasFeature, canPerformAICall, getMaxLessons } from './pricingTiers';

export interface UsageCheck {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

/**
 * Check if user can make an AI call based on their tier and current usage
 */
export async function checkAIUsage(uid: string): Promise<UsageCheck> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const tier = (userData.subscriptionTier || 'starter') as SubscriptionTier;
    const currentUsage = userData.aiUsageThisMonth || 0;

    const allowed = canPerformAICall(tier, currentUsage);

    if (!allowed) {
      return {
        allowed: false,
        reason: 'AI usage limit reached for your tier',
        currentUsage,
        limit: getMaxLessons(tier)
      };
    }

    return { allowed: true, currentUsage };
  } catch (error) {
    console.error('Error checking AI usage:', error);
    return { allowed: false, reason: 'Error checking usage' };
  }
}

/**
 * Increment AI usage counter for a user
 */
export async function incrementAIUsage(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      aiUsageThisMonth: increment(1)
    });
  } catch (error) {
    console.error('Error incrementing AI usage:', error);
  }
}

/**
 * Check if user can access voice features
 */
export async function checkVoiceAccess(uid: string): Promise<UsageCheck> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const tier = (userData.subscriptionTier || 'starter') as SubscriptionTier;

    const voiceEnabled = hasFeature(tier, 'voiceEnabled');

    if (!voiceEnabled) {
      return {
        allowed: false,
        reason: 'Voice features require Pro or Team tier'
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking voice access:', error);
    return { allowed: false, reason: 'Error checking access' };
  }
}

/**
 * Check if user can create more lessons
 */
export async function checkLessonLimit(uid: string): Promise<UsageCheck> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const tier = (userData.subscriptionTier || 'starter') as SubscriptionTier;
    const maxLessons = getMaxLessons(tier);

    // If unlimited (-1), always allow
    if (maxLessons === -1) {
      return { allowed: true };
    }

    // Count user's lessons
    const lessonsSnapshot = await getDoc(doc(db, 'users', uid, 'lessons', 'count'));
    const currentLessons = lessonsSnapshot.exists() ? lessonsSnapshot.data().count : 0;

    if (currentLessons >= maxLessons) {
      return {
        allowed: false,
        reason: 'Lesson limit reached for your tier',
        currentUsage: currentLessons,
        limit: maxLessons
      };
    }

    return { allowed: true, currentUsage: currentLessons, limit: maxLessons };
  } catch (error) {
    console.error('Error checking lesson limit:', error);
    return { allowed: false, reason: 'Error checking limit' };
  }
}

/**
 * Check if user can access admin tools
 */
export async function checkAdminToolsAccess(uid: string): Promise<UsageCheck> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const tier = (userData.subscriptionTier || 'starter') as SubscriptionTier;

    const adminToolsEnabled = hasFeature(tier, 'adminTools');

    if (!adminToolsEnabled) {
      return {
        allowed: false,
        reason: 'Admin tools require Team tier'
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking admin tools access:', error);
    return { allowed: false, reason: 'Error checking access' };
  }
}

/**
 * Check if user can export data
 */
export async function checkDataExportAccess(uid: string): Promise<UsageCheck> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return { allowed: false, reason: 'User not found' };
    }

    const userData = userDoc.data();
    const tier = (userData.subscriptionTier || 'starter') as SubscriptionTier;

    const dataExportEnabled = hasFeature(tier, 'dataExport');

    if (!dataExportEnabled) {
      return {
        allowed: false,
        reason: 'Data export requires Pro or Team tier'
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking data export access:', error);
    return { allowed: false, reason: 'Error checking access' };
  }
}

/**
 * Get user's current tier and usage stats
 */
export async function getUserTierInfo(uid: string) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      tier: (userData.subscriptionTier || 'starter') as SubscriptionTier,
      aiUsageThisMonth: userData.aiUsageThisMonth || 0,
      subscriptionStatus: userData.subscriptionStatus || 'active'
    };
  } catch (error) {
    console.error('Error getting user tier info:', error);
    return null;
  }
}
