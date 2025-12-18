# Referrals Collection Schema

## Phase 7B: Affiliates & Referrals

### Collections Overview

#### 1. `users` Collection (Extended)

Each user document now includes referral-related fields:

```typescript
{
  // Existing fields...
  email: string,
  role: 'admin' | 'user',
  subscriptionTier: 'starter' | 'pro' | 'team',
  
  // New referral fields
  referralCode: string,              // e.g., "STUDY-A3B7K"
  referredBy?: string,                // UID of user who referred them
  referredByCode?: string,            // Referral code used during signup
  referralCodeCreatedAt: Timestamp,
  
  referralStats: {
    totalReferrals: number,           // Total signups using this user's code
    successfulReferrals: number,      // Signups that converted to paid
    pendingRewards: number,           // Rewards waiting to be claimed
    totalRewardsEarned: number        // Lifetime rewards earned
  }
}
```

#### 2. `referrals` Collection (New)

Tracks individual referral relationships:

```typescript
{
  referrerId: string,                 // UID of user who made the referral
  referredUserId: string,             // UID of user who was referred
  referredUserEmail: string,          // Email of referred user
  referralCode: string,               // Code that was used
  status: 'pending' | 'converted' | 'rewarded',
  createdAt: Timestamp,               // When referral was created
  convertedAt: Timestamp | null,      // When referred user subscribed
  rewardedAt: Timestamp | null,       // When reward was given
  rewardType?: 'free_month' | 'credit',
  rewardAmount?: number               // Amount in cents if credit
}
```

**Status Flow:**
- `pending`: User signed up with referral code but hasn't subscribed
- `converted`: User subscribed (referrer eligible for reward)
- `rewarded`: Reward has been given to referrer

#### 3. `referral_rewards` Collection (New)

Tracks rewards given to referrers:

```typescript
{
  userId: string,                     // UID of user receiving reward
  referralId: string,                 // ID of referral that triggered reward
  rewardType: 'free_month' | 'credit',
  amount: number,                     // Amount in cents (for credits)
  status: 'pending' | 'applied' | 'failed',
  createdAt: Timestamp,
  appliedAt: Timestamp | null,
  stripeTransactionId?: string,       // If credit was applied via Stripe
  error?: string                      // If reward failed
}
```

### Firestore Security Rules

```javascript
match /referrals/{referralId} {
  // Users can read their own referrals (as referrer)
  allow read: if request.auth != null && 
    resource.data.referrerId == request.auth.uid;
  
  // Only server can write referrals
  allow write: if false;
}

match /referral_rewards/{rewardId} {
  // Users can read their own rewards
  allow read: if request.auth != null && 
    resource.data.userId == request.auth.uid;
  
  // Only server can write rewards
  allow write: if false;
}
```

### Indexes Required

```javascript
// Firestore indexes needed for queries

// 1. Find referrals by referrer
referrals:
  - referrerId (Ascending)
  - createdAt (Descending)

// 2. Find referrals by referred user
referrals:
  - referredUserId (Ascending)
  - status (Ascending)

// 3. Find users by referral code
users:
  - referralCode (Ascending)

// 4. Find pending rewards
referral_rewards:
  - userId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```

### Referral Flow

#### 1. User Shares Referral Code
```
User A → Gets referral code "STUDY-A3B7K"
       → Shares with User B
```

#### 2. New User Signs Up
```
User B → Signs up with code "STUDY-A3B7K"
       → referredByCode field set
       → onUserCreate function triggers
       → Creates referral record (status: pending)
       → Increments User A's totalReferrals
```

#### 3. Referred User Subscribes
```
User B → Subscribes to paid plan
       → Stripe webhook triggers
       → markReferralConverted() called
       → Referral status → converted
       → Increments User A's successfulReferrals
       → Creates reward record for User A
```

#### 4. Reward Applied
```
User A → Reward applied (free month or credit)
       → Referral status → rewarded
       → Reward status → applied
       → User A's totalRewardsEarned incremented
```

### Reward Types

#### Option 1: Free Month
- Extend subscription by 1 month
- No charge on next billing cycle
- Implemented via Stripe subscription schedule

#### Option 2: Stripe Credit
- Add credit to customer balance
- Applied to future invoices
- Implemented via Stripe customer balance transaction

### Anti-Abuse Measures

1. **Self-Referral Prevention**
   - Check referrerId !== referredUserId
   - Implemented in recordReferralSignup()

2. **Duplicate Prevention**
   - One referral per user (check by email/uid)
   - Prevent multiple signups with same code

3. **Rate Limiting**
   - Max 100 referrals per user per month
   - Flagged for review if exceeded

4. **Fraud Detection**
   - Track IP addresses
   - Flag suspicious patterns
   - Manual review for high-value referrers

### Analytics Queries

```javascript
// Top referrers
db.collection('users')
  .orderBy('referralStats.successfulReferrals', 'desc')
  .limit(10)

// Recent conversions
db.collection('referrals')
  .where('status', '==', 'converted')
  .orderBy('convertedAt', 'desc')
  .limit(50)

// Pending rewards
db.collection('referral_rewards')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'asc')

// Conversion rate by referrer
// Calculate: successfulReferrals / totalReferrals
```

### Migration Plan

1. **Deploy Schema**
   - Add fields to existing users
   - Create new collections
   - Deploy security rules

2. **Backfill Data**
   - Run generate-referral-codes.js
   - Generate codes for existing users

3. **Enable Feature**
   - Deploy UI components
   - Enable referral tracking
   - Monitor for issues

4. **Announce**
   - Email existing users
   - Add referral page to dashboard
   - Create marketing materials
