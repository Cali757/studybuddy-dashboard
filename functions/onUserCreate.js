// Cloud Function: Generate referral code on user creation
// Phase 7B: Affiliates & Referrals

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Generate a unique referral code
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STUDY-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if referral code is unique
 */
async function isCodeUnique(code) {
  const snapshot = await db.collection('users')
    .where('referralCode', '==', code)
    .limit(1)
    .get();
  return snapshot.empty;
}

/**
 * Generate unique referral code
 */
async function generateUniqueReferralCode() {
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    if (await isCodeUnique(code)) {
      return code;
    }
    code = generateReferralCode();
    attempts++;
  }
  
  // Fallback: add timestamp if can't find unique code
  return `STUDY-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

/**
 * Triggered when a new user is created
 * Generates a unique referral code for the user
 */
exports.onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const userData = snap.data();
    
    try {
      // Check if user already has a referral code
      if (userData.referralCode) {
        console.log(`User ${userId} already has referral code: ${userData.referralCode}`);
        return null;
      }
      
      // Generate unique referral code
      const referralCode = await generateUniqueReferralCode();
      
      // Update user document with referral code and stats
      await snap.ref.update({
        referralCode: referralCode,
        referralStats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingRewards: 0,
          totalRewardsEarned: 0
        },
        referralCodeCreatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Generated referral code ${referralCode} for user ${userId}`);
      
      // If user was referred by someone, record the referral
      if (userData.referredByCode) {
        await recordReferral(userData.referredByCode, userId, userData.email);
      }
      
      return null;
    } catch (error) {
      console.error('Error generating referral code:', error);
      // Don't throw - we don't want to block user creation
      return null;
    }
  });

/**
 * Record a referral when a new user signs up with a referral code
 */
async function recordReferral(referralCode, newUserId, newUserEmail) {
  try {
    // Find referrer by code
    const referrerSnapshot = await db.collection('users')
      .where('referralCode', '==', referralCode.toUpperCase())
      .limit(1)
      .get();
    
    if (referrerSnapshot.empty) {
      console.log(`Referral code ${referralCode} not found`);
      return;
    }
    
    const referrerDoc = referrerSnapshot.docs[0];
    const referrerId = referrerDoc.id;
    
    // Prevent self-referral
    if (referrerId === newUserId) {
      console.log('Self-referral prevented');
      return;
    }
    
    // Create referral record
    await db.collection('referrals').add({
      referrerId: referrerId,
      referredUserId: newUserId,
      referredUserEmail: newUserEmail,
      referralCode: referralCode.toUpperCase(),
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      convertedAt: null,
      rewardedAt: null
    });
    
    // Update referrer's stats
    await db.collection('users').doc(referrerId).update({
      'referralStats.totalReferrals': admin.firestore.FieldValue.increment(1)
    });
    
    console.log(`Recorded referral: ${referrerId} referred ${newUserId}`);
  } catch (error) {
    console.error('Error recording referral:', error);
  }
}
