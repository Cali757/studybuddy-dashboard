// Script to generate referral codes for existing users
// Run this once to backfill referral codes for users who don't have them
// Usage: node scripts/generate-referral-codes.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'STUDY-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function isCodeUnique(code) {
  const snapshot = await db.collection('users')
    .where('referralCode', '==', code)
    .limit(1)
    .get();
  return snapshot.empty;
}

async function generateUniqueReferralCode() {
  let code = generateReferralCode();
  let attempts = 0;
  
  while (attempts < 10) {
    if (await isCodeUnique(code)) {
      return code;
    }
    code = generateReferralCode();
    attempts++;
  }
  
  return `STUDY-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}

async function generateReferralCodesForUsers() {
  console.log('Generating referral codes for existing users...');
  
  try {
    // Get all users without referral codes
    const usersSnapshot = await db.collection('users').get();
    let processed = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      processed++;
      const userData = userDoc.data();
      
      if (userData.referralCode) {
        console.log(`User ${userDoc.id} already has code: ${userData.referralCode}`);
        skipped++;
        continue;
      }
      
      const referralCode = await generateUniqueReferralCode();
      
      await userDoc.ref.update({
        referralCode: referralCode,
        referralStats: {
          totalReferrals: 0,
          successfulReferrals: 0,
          pendingRewards: 0,
          totalRewardsEarned: 0
        },
        referralCodeCreatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✓ Generated code ${referralCode} for user ${userDoc.id}`);
      updated++;
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total users processed: ${processed}`);
    console.log(`Users updated: ${updated}`);
    console.log(`Users skipped (already had code): ${skipped}`);
    console.log('\n=== Complete! ===');
    
    process.exit(0);
  } catch (error) {
    console.error('Error generating referral codes:', error);
    process.exit(1);
  }
}

generateReferralCodesForUsers();
