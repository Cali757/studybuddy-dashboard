// Referral System - Generate and manage referral codes
// Phase 7B: Affiliates & Referrals

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, increment, serverTimestamp } from 'firebase/firestore';

/**
 * Generate a unique referral code for a user
 * Format: STUDY-XXXXX (5 random alphanumeric characters)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = 'STUDY-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create referral code for a user if they don't have one
 */
export async function createReferralCode(uid: string): Promise<string> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  
  // If user already has a referral code, return it
  if (userData.referralCode) {
    return userData.referralCode;
  }
  
  // Generate unique code
  let code = generateReferralCode();
  let isUnique = false;
  
  // Ensure code is unique
  while (!isUnique) {
    const existingQuery = query(
      collection(db, 'users'),
      where('referralCode', '==', code)
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (existingDocs.empty) {
      isUnique = true;
    } else {
      code = generateReferralCode();
    }
  }
  
  // Save code to user document
  await updateDoc(userRef, {
    referralCode: code,
    referralStats: {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingRewards: 0,
      totalRewardsEarned: 0
    }
  });
  
  return code;
}

/**
 * Get user's referral code (create if doesn't exist)
 */
export async function getUserReferralCode(uid: string): Promise<string> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userDoc.data();
  
  if (userData.referralCode) {
    return userData.referralCode;
  }
  
  // Create new code if doesn't exist
  return await createReferralCode(uid);
}

/**
 * Validate a referral code
 */
export async function validateReferralCode(code: string): Promise<{ valid: boolean; referrerId?: string }> {
  if (!code || code.length < 5) {
    return { valid: false };
  }
  
  const usersQuery = query(
    collection(db, 'users'),
    where('referralCode', '==', code.toUpperCase())
  );
  
  const querySnapshot = await getDocs(usersQuery);
  
  if (querySnapshot.empty) {
    return { valid: false };
  }
  
  const referrerDoc = querySnapshot.docs[0];
  return { valid: true, referrerId: referrerDoc.id };
}

/**
 * Record a referral signup
 */
export async function recordReferralSignup(referralCode: string, newUserId: string, newUserEmail: string): Promise<void> {
  const validation = await validateReferralCode(referralCode);
  
  if (!validation.valid || !validation.referrerId) {
    throw new Error('Invalid referral code');
  }
  
  // Prevent self-referral
  if (validation.referrerId === newUserId) {
    throw new Error('Cannot refer yourself');
  }
  
  // Create referral record
  const referralRef = doc(collection(db, 'referrals'));
  await setDoc(referralRef, {
    referrerId: validation.referrerId,
    referredUserId: newUserId,
    referredUserEmail: newUserEmail,
    referralCode: referralCode.toUpperCase(),
    status: 'pending', // pending, converted, rewarded
    createdAt: serverTimestamp(),
    convertedAt: null,
    rewardedAt: null
  });
  
  // Update referrer's stats
  const referrerRef = doc(db, 'users', validation.referrerId);
  await updateDoc(referrerRef, {
    'referralStats.totalReferrals': increment(1)
  });
  
  // Add referral info to new user
  const newUserRef = doc(db, 'users', newUserId);
  await updateDoc(newUserRef, {
    referredBy: validation.referrerId,
    referralCode: referralCode.toUpperCase()
  });
}

/**
 * Mark referral as converted (when referred user subscribes)
 */
export async function markReferralConverted(referredUserId: string): Promise<void> {
  // Find referral record
  const referralsQuery = query(
    collection(db, 'referrals'),
    where('referredUserId', '==', referredUserId),
    where('status', '==', 'pending')
  );
  
  const querySnapshot = await getDocs(referralsQuery);
  
  if (querySnapshot.empty) {
    return; // No pending referral found
  }
  
  const referralDoc = querySnapshot.docs[0];
  const referralData = referralDoc.data();
  
  // Update referral status
  await updateDoc(doc(db, 'referrals', referralDoc.id), {
    status: 'converted',
    convertedAt: serverTimestamp()
  });
  
  // Update referrer's stats
  const referrerRef = doc(db, 'users', referralData.referrerId);
  await updateDoc(referrerRef, {
    'referralStats.successfulReferrals': increment(1),
    'referralStats.pendingRewards': increment(1)
  });
}

/**
 * Get user's referral stats
 */
export async function getReferralStats(uid: string) {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return null;
  }
  
  const userData = userDoc.data();
  return userData.referralStats || {
    totalReferrals: 0,
    successfulReferrals: 0,
    pendingRewards: 0,
    totalRewardsEarned: 0
  };
}

/**
 * Get user's referral history
 */
export async function getReferralHistory(uid: string) {
  const referralsQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', uid)
  );
  
  const querySnapshot = await getDocs(referralsQuery);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
