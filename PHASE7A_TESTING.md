# Phase 7A Testing Guide - Pricing Tiers & Upsells

## Overview
This document outlines the testing procedures for Phase 7A: Pricing Tiers & Upsells.

## Test Environment Setup

### 1. Stripe Configuration
- [ ] Create Stripe products and prices using `node scripts/create-stripe-tiers.js`
- [ ] Add price IDs to `.env.local`:
  ```
  NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=price_xxx
  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
  NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=price_xxx
  STRIPE_SECRET_KEY=sk_test_xxx
  STRIPE_WEBHOOK_SECRET=whsec_xxx
  ```
- [ ] Configure Stripe webhook endpoint: `/api/webhooks/stripe`
- [ ] Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### 2. Firestore Setup
- [ ] Ensure users collection has fields: `subscriptionTier`, `subscriptionStatus`, `aiUsageThisMonth`
- [ ] Create test users with different tiers:
  - Test user 1: Starter tier
  - Test user 2: Pro tier
  - Test user 3: Team tier

## Feature Testing

### Test 1: Pricing Page Display
**Objective:** Verify pricing page shows all tiers correctly

**Steps:**
1. Navigate to `/pricing`
2. Verify all three tiers are displayed (Starter, Pro, Team)
3. Verify pricing is correct ($20, $39, $79)
4. Verify feature lists are accurate
5. Verify "Most Popular" badge on Pro tier
6. Verify current tier is highlighted if user is logged in

**Expected Result:** All tiers display correctly with accurate information

---

### Test 2: AI Usage Gating - Starter Tier
**Objective:** Verify AI usage limits are enforced for Starter tier

**Steps:**
1. Log in as Starter tier user
2. Make AI calls (questions, summaries, quizzes)
3. Monitor `aiUsageThisMonth` counter in Firestore
4. Attempt to make 101st AI call (exceeds 100 limit)
5. Verify AIUsageGate modal appears
6. Verify upgrade prompt is shown

**Expected Result:** 
- AI calls 1-100: Allowed
- AI call 101+: Blocked with upgrade prompt

---

### Test 3: Voice Feature Gating
**Objective:** Verify voice features are gated by tier

**Steps:**
1. Log in as Starter tier user
2. Attempt to access voice features
3. Verify VoiceFeatureGate modal appears
4. Log in as Pro tier user
5. Verify voice features are accessible
6. Log in as Team tier user
7. Verify voice features are accessible

**Expected Result:**
- Starter: Voice blocked with upgrade prompt
- Pro: Voice enabled
- Team: Voice enabled

---

### Test 4: Admin Tools Gating
**Objective:** Verify admin tools are gated by tier

**Steps:**
1. Log in as Starter tier user
2. Attempt to access admin tools
3. Verify AdminToolsGate modal appears
4. Log in as Pro tier user
5. Verify admin tools are still blocked
6. Log in as Team tier user
7. Verify admin tools are accessible

**Expected Result:**
- Starter: Admin tools blocked
- Pro: Admin tools blocked
- Team: Admin tools enabled

---

### Test 5: Data Export Gating
**Objective:** Verify data export is gated by tier

**Steps:**
1. Log in as Starter tier user
2. Attempt to export data
3. Verify AdminToolsGate modal appears with data export message
4. Log in as Pro tier user
5. Verify data export is accessible
6. Log in as Team tier user
7. Verify data export is accessible

**Expected Result:**
- Starter: Data export blocked
- Pro: Data export enabled
- Team: Data export enabled

---

### Test 6: Lesson Limit Gating
**Objective:** Verify lesson limits are enforced by tier

**Steps:**
1. Log in as Starter tier user
2. Create 10 lessons (limit)
3. Attempt to create 11th lesson
4. Verify limit warning appears
5. Log in as Pro tier user
6. Create 50 lessons (limit)
7. Attempt to create 51st lesson
8. Verify limit warning appears
9. Log in as Team tier user
10. Create 100+ lessons
11. Verify no limit is enforced

**Expected Result:**
- Starter: Limited to 10 lessons
- Pro: Limited to 50 lessons
- Team: Unlimited lessons

---

### Test 7: Usage Warning Display
**Objective:** Verify usage warnings appear at 80% threshold

**Steps:**
1. Log in as Starter tier user
2. Make 80 AI calls (80% of 100 limit)
3. Verify UsageWarning component appears
4. Verify warning shows current usage and limit
5. Make 100 AI calls (100% of limit)
6. Verify warning changes to "Limit Reached"

**Expected Result:** Warning appears at 80% and updates at 100%

---

### Test 8: Tier Badge Display
**Objective:** Verify tier badge shows correctly

**Steps:**
1. Log in as Starter tier user
2. Verify badge shows "🚀 Starter" with upgrade button
3. Log in as Pro tier user
4. Verify badge shows "⭐ Pro" with upgrade button
5. Log in as Team tier user
6. Verify badge shows "👑 Team" without upgrade button

**Expected Result:** Badge displays correctly for each tier

---

### Test 9: Upgrade Flow
**Objective:** Verify upgrade from Starter to Pro

**Steps:**
1. Log in as Starter tier user
2. Navigate to `/pricing`
3. Click "Select Plan" on Pro tier
4. Verify Stripe checkout session is created
5. Complete payment in Stripe test mode
6. Verify webhook updates user tier to "pro"
7. Verify `aiUsageThisMonth` is reset to 0
8. Verify `subscriptionStatus` is "active"
9. Verify voice features are now accessible

**Expected Result:** User successfully upgrades to Pro tier

---

### Test 10: Downgrade Flow
**Objective:** Verify downgrade from Pro to Starter

**Steps:**
1. Log in as Pro tier user
2. Navigate to `/pricing`
3. Click "Select Plan" on Starter tier
4. Verify UpgradeDowngradeFlow modal appears
5. Review changes summary
6. Confirm downgrade
7. Verify Stripe subscription is updated
8. Verify webhook updates user tier to "starter" at next billing cycle
9. Verify voice features are disabled

**Expected Result:** User successfully downgrades to Starter tier

---

### Test 11: Stripe Webhook Events
**Objective:** Verify all webhook events are handled correctly

**Test Events:**
- [ ] `customer.subscription.created` - Creates user subscription record
- [ ] `customer.subscription.updated` - Updates tier and resets usage
- [ ] `customer.subscription.deleted` - Downgrades to starter
- [ ] `invoice.payment_succeeded` - Logs successful payment
- [ ] `invoice.payment_failed` - Updates status to past_due

**Expected Result:** All webhook events update Firestore correctly

---

### Test 12: Prorated Billing
**Objective:** Verify prorated charges on tier changes

**Steps:**
1. Subscribe to Starter tier ($20/month)
2. Wait 15 days (mid-cycle)
3. Upgrade to Pro tier ($39/month)
4. Verify prorated charge of ~$9.50 (half of $19 difference)
5. Verify next invoice is full $39

**Expected Result:** Prorated charges are calculated correctly

---

## Edge Cases

### Edge Case 1: Subscription Past Due
**Scenario:** Payment fails, subscription goes past_due

**Expected Behavior:**
- User retains current tier temporarily
- Warning message displayed
- Features remain accessible for grace period
- After grace period, downgrade to starter

### Edge Case 2: Subscription Canceled
**Scenario:** User cancels subscription

**Expected Behavior:**
- User retains access until end of billing period
- At end of period, downgrade to starter
- All premium features disabled

### Edge Case 3: Multiple Rapid Tier Changes
**Scenario:** User upgrades and downgrades multiple times

**Expected Behavior:**
- Each change is processed correctly
- Prorations are calculated accurately
- No data loss or corruption

---

## Performance Testing

### Load Test: Tier Checking
**Objective:** Verify tier checks don't slow down app

**Steps:**
1. Make 100 concurrent AI calls with tier checking
2. Measure response time
3. Verify no performance degradation

**Expected Result:** Tier checks add <50ms overhead

---

## Security Testing

### Security Test 1: Bypass Attempt
**Objective:** Verify users cannot bypass tier limits

**Steps:**
1. Attempt to call AI functions directly without tier check
2. Attempt to modify Firestore tier field from client
3. Attempt to replay old API requests

**Expected Result:** All bypass attempts fail

### Security Test 2: Webhook Verification
**Objective:** Verify webhook signature validation

**Steps:**
1. Send webhook request without signature
2. Send webhook request with invalid signature
3. Send webhook request with valid signature

**Expected Result:** Only valid signatures are accepted

---

## Rollback Plan

If critical issues are found:

1. **Immediate Actions:**
   - Disable tier enforcement in production
   - Set all users to highest tier temporarily
   - Investigate and fix issues

2. **Communication:**
   - Notify affected users
   - Provide timeline for resolution
   - Offer compensation if needed

3. **Recovery:**
   - Deploy fix
   - Re-enable tier enforcement
   - Monitor closely for 24 hours

---

## Sign-off

- [ ] All tests passed
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Documentation complete
- [ ] Ready for production deployment

**Tested by:** _________________
**Date:** _________________
**Approved by:** _________________
