// Referral Abuse Prevention - Rate limits and validation
// Phase 7B: Affiliates & Referrals

import { db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface AbuseCheckResult {
  allowed: boolean;
  reason?: string;
  flagged?: boolean;
}

// Configuration
const MAX_REFERRALS_PER_MONTH = 100;
const MAX_REFERRALS_PER_DAY = 10;
const MAX_REFERRALS_FROM_SAME_IP = 3;
const SUSPICIOUS_CONVERSION_RATE_THRESHOLD = 0.95; // 95%+ conversion is suspicious

/**
 * Check if a referral signup should be allowed
 */
export async function checkReferralAbuse(
  referralCode: string,
  newUserEmail: string,
  ipAddress?: string
): Promise<AbuseCheckResult> {
  try {
    // 1. Validate referral code format
    if (!isValidReferralCodeFormat(referralCode)) {
      return {
        allowed: false,
        reason: 'Invalid referral code format'
      };
    }

    // 2. Check if referral code exists
    const referrerQuery = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode.toUpperCase())
    );
    const referrerSnapshot = await getDocs(referrerQuery);
    
    if (referrerSnapshot.empty) {
      return {
        allowed: false,
        reason: 'Referral code not found'
      };
    }

    const referrerId = referrerSnapshot.docs[0].id;

    // 3. Check for duplicate email
    const duplicateCheck = await checkDuplicateEmail(newUserEmail);
    if (!duplicateCheck.allowed) {
      return duplicateCheck;
    }

    // 4. Check referrer's rate limits
    const rateLimitCheck = await checkReferrerRateLimits(referrerId);
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck;
    }

    // 5. Check IP-based abuse (if IP provided)
    if (ipAddress) {
      const ipCheck = await checkIPAbuse(referrerId, ipAddress);
      if (!ipCheck.allowed) {
        return ipCheck;
      }
    }

    // 6. Check for suspicious patterns
    const suspiciousCheck = await checkSuspiciousPatterns(referrerId);
    if (suspiciousCheck.flagged) {
      // Allow but flag for review
      await flagForReview(referrerId, 'Suspicious referral pattern detected');
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking referral abuse:', error);
    return {
      allowed: false,
      reason: 'Error validating referral'
    };
  }
}

/**
 * Validate referral code format
 */
function isValidReferralCodeFormat(code: string): boolean {
  // Format: STUDY-XXXXX (5 alphanumeric characters)
  const regex = /^STUDY-[A-Z0-9]{5}$/;
  return regex.test(code.toUpperCase());
}

/**
 * Check if email has already been used for a referral
 */
async function checkDuplicateEmail(email: string): Promise<AbuseCheckResult> {
  const referralsQuery = query(
    collection(db, 'referrals'),
    where('referredUserEmail', '==', email.toLowerCase())
  );
  
  const snapshot = await getDocs(referralsQuery);
  
  if (!snapshot.empty) {
    return {
      allowed: false,
      reason: 'This email has already been referred'
    };
  }
  
  return { allowed: true };
}

/**
 * Check referrer's rate limits
 */
async function checkReferrerRateLimits(referrerId: string): Promise<AbuseCheckResult> {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Check monthly limit
  const monthlyQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId),
    where('createdAt', '>=', monthAgo)
  );
  const monthlySnapshot = await getDocs(monthlyQuery);
  
  if (monthlySnapshot.size >= MAX_REFERRALS_PER_MONTH) {
    await flagForReview(referrerId, `Exceeded monthly referral limit: ${monthlySnapshot.size}`);
    return {
      allowed: false,
      reason: 'Monthly referral limit exceeded',
      flagged: true
    };
  }

  // Check daily limit
  const dailyQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId),
    where('createdAt', '>=', dayAgo)
  );
  const dailySnapshot = await getDocs(dailyQuery);
  
  if (dailySnapshot.size >= MAX_REFERRALS_PER_DAY) {
    return {
      allowed: false,
      reason: 'Daily referral limit exceeded. Please try again tomorrow.'
    };
  }

  return { allowed: true };
}

/**
 * Check for IP-based abuse
 */
async function checkIPAbuse(referrerId: string, ipAddress: string): Promise<AbuseCheckResult> {
  // Check how many referrals from this IP for this referrer
  const ipQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId),
    where('ipAddress', '==', ipAddress)
  );
  
  const snapshot = await getDocs(ipQuery);
  
  if (snapshot.size >= MAX_REFERRALS_FROM_SAME_IP) {
    await flagForReview(referrerId, `Multiple referrals from same IP: ${ipAddress}`);
    return {
      allowed: false,
      reason: 'Too many referrals from this location',
      flagged: true
    };
  }
  
  return { allowed: true };
}

/**
 * Check for suspicious patterns
 */
async function checkSuspiciousPatterns(referrerId: string): Promise<AbuseCheckResult> {
  const userRef = doc(db, 'users', referrerId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return { allowed: true };
  }
  
  const userData = userDoc.data();
  const stats = userData.referralStats;
  
  if (!stats || stats.totalReferrals === 0) {
    return { allowed: true };
  }
  
  // Check conversion rate (too high is suspicious)
  const conversionRate = stats.successfulReferrals / stats.totalReferrals;
  
  if (conversionRate >= SUSPICIOUS_CONVERSION_RATE_THRESHOLD && stats.totalReferrals >= 10) {
    return {
      allowed: true,
      flagged: true,
      reason: `Unusually high conversion rate: ${(conversionRate * 100).toFixed(1)}%`
    };
  }
  
  // Check for rapid signups (all within short time period)
  const recentQuery = query(
    collection(db, 'referrals'),
    where('referrerId', '==', referrerId)
  );
  const recentSnapshot = await getDocs(recentQuery);
  
  if (recentSnapshot.size >= 5) {
    const timestamps = recentSnapshot.docs
      .map(doc => doc.data().createdAt?.toDate?.())
      .filter(date => date)
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (timestamps.length >= 5) {
      const firstFive = timestamps.slice(0, 5);
      const timeSpan = firstFive[4].getTime() - firstFive[0].getTime();
      const hoursSpan = timeSpan / (1000 * 60 * 60);
      
      // If 5 referrals within 1 hour, flag as suspicious
      if (hoursSpan < 1) {
        return {
          allowed: true,
          flagged: true,
          reason: `Rapid referral signups: 5 within ${hoursSpan.toFixed(1)} hours`
        };
      }
    }
  }
  
  return { allowed: true };
}

/**
 * Flag a user for manual review
 */
async function flagForReview(userId: string, reason: string): Promise<void> {
  const flagRef = doc(collection(db, 'abuse_flags'));
  
  await setDoc(flagRef, {
    userId,
    type: 'referral_abuse',
    reason,
    status: 'pending',
    createdAt: serverTimestamp(),
    reviewedAt: null,
    reviewedBy: null,
    action: null
  });
  
  // Update user document
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    flaggedForReview: true,
    flagReason: reason,
    flaggedAt: serverTimestamp()
  });
}

/**
 * Get flagged users for admin review
 */
export async function getFlaggedUsers() {
  const flagsQuery = query(
    collection(db, 'abuse_flags'),
    where('status', '==', 'pending'),
    where('type', '==', 'referral_abuse')
  );
  
  const snapshot = await getDocs(flagsQuery);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

/**
 * Resolve an abuse flag
 */
export async function resolveAbuseFlag(
  flagId: string,
  action: 'approved' | 'banned' | 'warning',
  reviewedBy: string
): Promise<void> {
  const flagRef = doc(db, 'abuse_flags', flagId);
  const flagDoc = await getDoc(flagRef);
  
  if (!flagDoc.exists()) {
    throw new Error('Flag not found');
  }
  
  const flagData = flagDoc.data();
  
  // Update flag
  await updateDoc(flagRef, {
    status: 'resolved',
    action,
    reviewedBy,
    reviewedAt: serverTimestamp()
  });
  
  // Update user
  const userRef = doc(db, 'users', flagData.userId);
  
  if (action === 'banned') {
    await updateDoc(userRef, {
      referralsBanned: true,
      flaggedForReview: false
    });
  } else {
    await updateDoc(userRef, {
      flaggedForReview: false
    });
  }
}

/**
 * Check if user is banned from referrals
 */
export async function isUserBannedFromReferrals(userId: string): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return false;
  }
  
  return userDoc.data().referralsBanned === true;
}
