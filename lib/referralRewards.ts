// Referral Rewards System - Handle reward distribution
// Phase 7B: Affiliates & Referrals

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export type RewardType = 'free_month' | 'credit';
export type RewardStatus = 'pending' | 'applied' | 'failed';

interface RewardConfig {
  type: RewardType;
  amount?: number; // Amount in cents for credit
}

// Default reward: $20 credit (one month of Starter tier)
const DEFAULT_REWARD: RewardConfig = {
  type: 'credit',
  amount: 2000 // $20 in cents
};

/**
 * Create a reward for a successful referral
 */
export async function createReferralReward(
  userId: string,
  referralId: string,
  rewardConfig: RewardConfig = DEFAULT_REWARD
): Promise<string> {
  const rewardRef = doc(collection(db, 'referral_rewards'));
  
  await setDoc(rewardRef, {
    userId,
    referralId,
    rewardType: rewardConfig.type,
    amount: rewardConfig.amount || 0,
    status: 'pending',
    createdAt: serverTimestamp(),
    appliedAt: null,
    stripeTransactionId: null,
    error: null
  });
  
  return rewardRef.id;
}

/**
 * Apply a credit reward to user's Stripe account
 */
export async function applyStripeCredit(
  userId: string,
  rewardId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's Stripe customer ID
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const stripeCustomerId = userData.stripeCustomerId;
    
    if (!stripeCustomerId) {
      throw new Error('User has no Stripe customer ID');
    }
    
    // Create customer balance transaction (credit)
    const balanceTransaction = await stripe.customers.createBalanceTransaction(
      stripeCustomerId,
      {
        amount: -amount, // Negative amount = credit
        currency: 'usd',
        description: `Referral reward credit`
      }
    );
    
    // Update reward record
    const rewardRef = doc(db, 'referral_rewards', rewardId);
    await updateDoc(rewardRef, {
      status: 'applied',
      appliedAt: serverTimestamp(),
      stripeTransactionId: balanceTransaction.id
    });
    
    // Update user's reward stats
    await updateDoc(userRef, {
      'referralStats.pendingRewards': increment(-1),
      'referralStats.totalRewardsEarned': increment(amount)
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error applying Stripe credit:', error);
    
    // Update reward record with error
    const rewardRef = doc(db, 'referral_rewards', rewardId);
    await updateDoc(rewardRef, {
      status: 'failed',
      error: error.message
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Apply a free month reward by extending subscription
 */
export async function applyFreeMonth(
  userId: string,
  rewardId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's Stripe subscription
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;
    
    if (!subscriptionId) {
      throw new Error('User has no active subscription');
    }
    
    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Calculate new billing date (add 1 month)
    const currentPeriodEnd = subscription.current_period_end;
    const newPeriodEnd = currentPeriodEnd + (30 * 24 * 60 * 60); // Add 30 days
    
    // Update subscription to extend billing period
    await stripe.subscriptions.update(subscriptionId, {
      trial_end: newPeriodEnd,
      proration_behavior: 'none'
    });
    
    // Update reward record
    const rewardRef = doc(db, 'referral_rewards', rewardId);
    await updateDoc(rewardRef, {
      status: 'applied',
      appliedAt: serverTimestamp()
    });
    
    // Update user's reward stats
    await updateDoc(userRef, {
      'referralStats.pendingRewards': increment(-1),
      'referralStats.totalRewardsEarned': increment(2000) // Track as $20 value
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error applying free month:', error);
    
    // Update reward record with error
    const rewardRef = doc(db, 'referral_rewards', rewardId);
    await updateDoc(rewardRef, {
      status: 'failed',
      error: error.message
    });
    
    return { success: false, error: error.message };
  }
}

/**
 * Process a pending reward
 */
export async function processReward(rewardId: string): Promise<{ success: boolean; error?: string }> {
  const rewardRef = doc(db, 'referral_rewards', rewardId);
  const rewardDoc = await getDoc(rewardRef);
  
  if (!rewardDoc.exists()) {
    return { success: false, error: 'Reward not found' };
  }
  
  const rewardData = rewardDoc.data();
  
  if (rewardData.status !== 'pending') {
    return { success: false, error: 'Reward already processed' };
  }
  
  if (rewardData.rewardType === 'credit') {
    return await applyStripeCredit(rewardData.userId, rewardId, rewardData.amount);
  } else if (rewardData.rewardType === 'free_month') {
    return await applyFreeMonth(rewardData.userId, rewardId);
  }
  
  return { success: false, error: 'Unknown reward type' };
}

/**
 * Get pending rewards for a user
 */
export async function getPendingRewards(userId: string) {
  const rewardsQuery = query(
    collection(db, 'referral_rewards'),
    where('userId', '==', userId),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(rewardsQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Get all rewards for a user
 */
export async function getUserRewards(userId: string) {
  const rewardsQuery = query(
    collection(db, 'referral_rewards'),
    where('userId', '==', userId)
  );
  
  const querySnapshot = await getDocs(rewardsQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Claim all pending rewards for a user
 */
export async function claimAllRewards(userId: string): Promise<{ 
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}> {
  const pendingRewards = await getPendingRewards(userId);
  
  let successful = 0;
  let failed = 0;
  const errors: string[] = [];
  
  for (const reward of pendingRewards) {
    const result = await processReward(reward.id);
    
    if (result.success) {
      successful++;
    } else {
      failed++;
      if (result.error) {
        errors.push(result.error);
      }
    }
  }
  
  return {
    total: pendingRewards.length,
    successful,
    failed,
    errors
  };
}
