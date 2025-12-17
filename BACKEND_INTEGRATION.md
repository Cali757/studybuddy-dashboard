# Backend Integration Guide for System Kill Switches

This document explains how to integrate the admin dashboard kill switches into your backend Cloud Functions.

## Overview

The admin dashboard provides three critical kill switches:
- **AI System** (`aiEnabled`): Controls all AI features
- **Billing System** (`billingEnabled`): Controls Stripe and payment processing
- **Lesson Ingestion** (`ingestEnabled`): Controls lesson uploads and processing

These flags are stored in Firestore at `system/config` and should be checked before executing critical operations.

## Frontend Integration (Next.js)

For frontend API routes or server actions, use the provided utility functions:

```typescript
import { isAIEnabled, isBillingEnabled, isIngestEnabled } from '@/lib/systemConfig';

// Example: AI endpoint
export async function POST(request: Request) {
  // Check if AI is enabled
  if (!(await isAIEnabled())) {
    return Response.json(
      { error: 'AI features are currently disabled' },
      { status: 503 }
    );
  }
  
  // Proceed with AI processing...
}

// Example: Lesson upload endpoint
export async function POST(request: Request) {
  // Check if ingestion is enabled
  if (!(await isIngestEnabled())) {
    return Response.json(
      { error: 'Lesson uploads are currently disabled' },
      { status: 503 }
    );
  }
  
  // Proceed with lesson processing...
}
```

## Cloud Functions Integration (Firebase)

For Firebase Cloud Functions, check the config at the start of each function:

```javascript
const admin = require('firebase-admin');
const functions = require('firebase-functions');

// Helper function to get system config
async function getSystemConfig() {
  try {
    const configDoc = await admin.firestore()
      .collection('system')
      .doc('config')
      .get();
    
    if (configDoc.exists) {
      return configDoc.data();
    }
    
    // Default to all enabled
    return {
      aiEnabled: true,
      billingEnabled: true,
      ingestEnabled: true
    };
  } catch (error) {
    console.error('Error fetching system config:', error);
    // On error, default to enabled to avoid breaking functionality
    return {
      aiEnabled: true,
      billingEnabled: true,
      ingestEnabled: true
    };
  }
}

// Example: AI Summary Function
exports.generateSummary = functions.https.onCall(async (data, context) => {
  // Check if AI is enabled
  const config = await getSystemConfig();
  if (!config.aiEnabled) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'AI features are currently disabled by system administrator'
    );
  }
  
  // Proceed with AI processing...
});

// Example: Lesson Ingestion Function
exports.processLesson = functions.firestore
  .document('lessons/{lessonId}')
  .onCreate(async (snap, context) => {
    // Check if ingestion is enabled
    const config = await getSystemConfig();
    if (!config.ingestEnabled) {
      console.log('Lesson ingestion disabled, skipping processing');
      await snap.ref.update({
        status: 'disabled',
        error: 'Lesson ingestion is currently disabled'
      });
      return;
    }
    
    // Proceed with lesson processing...
  });

// Example: Stripe Webhook Handler
exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  // Check if billing is enabled
  const config = await getSystemConfig();
  if (!config.billingEnabled) {
    console.log('Billing disabled, ignoring webhook');
    res.status(503).send('Billing system is currently disabled');
    return;
  }
  
  // Proceed with webhook processing...
});
```

## Caching Recommendations

To avoid excessive Firestore reads:

1. **Cache the config** for 1-5 minutes in your Cloud Functions
2. **Use Firebase Realtime Database** for faster reads if needed
3. **Set up a Firestore trigger** to invalidate caches when config changes

Example caching in Cloud Functions:

```javascript
let configCache = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 1 minute

async function getSystemConfig() {
  const now = Date.now();
  
  if (configCache && (now - lastFetch) < CACHE_DURATION) {
    return configCache;
  }
  
  const configDoc = await admin.firestore()
    .collection('system')
    .doc('config')
    .get();
  
  configCache = configDoc.exists ? configDoc.data() : {
    aiEnabled: true,
    billingEnabled: true,
    ingestEnabled: true
  };
  
  lastFetch = now;
  return configCache;
}
```

## Testing Kill Switches

1. **Test AI Kill Switch**:
   - Disable AI in admin dashboard
   - Try to generate a summary or ask a question
   - Should receive error message

2. **Test Billing Kill Switch**:
   - Disable billing in admin dashboard
   - Try to subscribe or process payment
   - Should receive error message

3. **Test Ingestion Kill Switch**:
   - Disable ingestion in admin dashboard
   - Try to upload a lesson or sync from Google Drive
   - Should receive error message

## Error Messages

Provide clear error messages to users when features are disabled:

```typescript
const ERROR_MESSAGES = {
  aiDisabled: 'AI features are temporarily unavailable. Please try again later.',
  billingDisabled: 'Payment processing is temporarily unavailable. Please try again later.',
  ingestDisabled: 'Lesson uploads are temporarily unavailable. Please try again later.'
};
```

## Monitoring

Log when operations are blocked by kill switches:

```javascript
if (!config.aiEnabled) {
  console.warn('AI operation blocked by kill switch', {
    userId: context.auth?.uid,
    operation: 'generateSummary',
    timestamp: new Date().toISOString()
  });
}
```

## Security Rules

Ensure only admins can modify the system config:

```javascript
match /system/{document} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```
