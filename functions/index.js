const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret_key);

admin.initializeApp();
const db = admin.firestore();

// ============================================
// PRICING AND SUBSCRIPTIONS
// ============================================

// Stripe pricing tiers configuration
const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 2000, // $20.00 in cents
    priceId: 'price_1SgVx6CrvQO30f5t2L0b0em24', // StudyBuddy Starter
    features: {
      aiUsage: 'standard',
      voiceEnabled: false,
      adminTools: false,
      dataExport: false,
      aiLimit: 100
    }
  },
  pro: {
    name: 'Pro',
    price: 3900, // $39.00 in cents
    priceId: 'price_1SgVztCrvQO30f5t9FoGzwFy', // StudyBuddy Pro
    features: {
      aiUsage: 'higher',
      voiceEnabled: true,
      adminTools: false,
      dataExport: false,
      aiLimit: 500
    }
  },
  team: {
    name: 'Team',
    price: 7900, // $79.00 in cents
    priceId: 'price_1SgW1JCrvQO30f5t0rL4Oq5e', // StudyBuddy Team
    features: {
      aiUsage: 'highest',
      voiceEnabled: true,
      adminTools: true,
      dataExport: true,
      aiLimit: 2000
    }
  }
};

// Stripe webhook handler
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    await alertAdmin('Stripe webhook error', error.message);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleSubscriptionUpdate(subscription) {
  const customerId = subscription.customer;
  const status = subscription.status;
  const priceId = subscription.items.data[0].price.id;

  let tier = 'starter';
  for (const [key, value] of Object.entries(PRICING_TIERS)) {
    if (value.priceId === priceId) {
      tier = key;
      break;
    }
  }

  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error('User not found for customer:', customerId);
    return;
  }

  const userId = usersSnapshot.docs[0].id;

  await db.collection('users').doc(userId).update({
    subscriptionTier: tier,
    subscriptionStatus: status,
    subscriptionId: subscription.id,
    features: PRICING_TIERS[tier].features,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Updated subscription for user ${userId} to ${tier}`);
}

async function handleSubscriptionCancellation(subscription) {
  const customerId = subscription.customer;

  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) return;

  const userId = usersSnapshot.docs[0].id;

  await db.collection('users').doc(userId).update({
    subscriptionStatus: 'canceled',
    features: PRICING_TIERS.starter.features,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handlePaymentSuccess(invoice) {
  await db.collection('payments').add({
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_paid,
    status: 'succeeded',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function handlePaymentFailure(invoice) {
  await alertAdmin('Payment failed', `Invoice ${invoice.id} failed for customer ${invoice.customer}`);
  
  await db.collection('payments').add({
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amount: invoice.amount_due,
    status: 'failed',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { tier } = data;
  const userId = context.auth.uid;

  if (!PRICING_TIERS[tier]) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid pricing tier');
  }

  const userDoc = await db.collection('users').doc(userId).get();
  let customerId = userDoc.data()?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: context.auth.token.email,
      metadata: { userId }
    });
    customerId = customer.id;
    await db.collection('users').doc(userId).update({ stripeCustomerId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: PRICING_TIERS[tier].priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${data.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: data.cancelUrl
  });

  return { sessionId: session.id };
});

// ============================================
// AFFILIATES AND REFERRALS
// ============================================

exports.generateReferralCode = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();

  if (userDoc.data()?.referralCode) {
    return { referralCode: userDoc.data().referralCode };
  }

  const referralCode = generateUniqueCode(userId);

  await db.collection('users').doc(userId).update({
    referralCode,
    referralCount: 0,
    referralEarnings: 0
  });

  return { referralCode };
});

function generateUniqueCode(userId) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.trackReferral = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { referralCode } = data;
  const newUserId = context.auth.uid;

  const referrerSnapshot = await db.collection('users')
    .where('referralCode', '==', referralCode)
    .limit(1)
    .get();

  if (referrerSnapshot.empty) {
    throw new functions.https.HttpsError('not-found', 'Invalid referral code');
  }

  const referrerId = referrerSnapshot.docs[0].id;

  if (referrerId === newUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'Cannot refer yourself');
  }

  const newUserDoc = await db.collection('users').doc(newUserId).get();
  if (newUserDoc.data()?.referredBy) {
    throw new functions.https.HttpsError('already-exists', 'User already used a referral code');
  }

  await db.collection('referrals').add({
    referrerId,
    referredUserId: newUserId,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(newUserId).update({
    referredBy: referrerId
  });

  return { success: true };
});

exports.rewardReferral = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.subscriptionStatus && after.subscriptionStatus === 'active' && after.referredBy) {
      const referrerId = after.referredBy;
      const referredUserId = context.params.userId;

      const referralSnapshot = await db.collection('referrals')
        .where('referrerId', '==', referrerId)
        .where('referredUserId', '==', referredUserId)
        .limit(1)
        .get();

      if (!referralSnapshot.empty) {
        const referralId = referralSnapshot.docs[0].id;
        await db.collection('referrals').doc(referralId).update({
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const referrerDoc = await db.collection('users').doc(referrerId).get();
        const referrerData = referrerDoc.data();

        if (referrerData.stripeCustomerId) {
          await stripe.customers.createBalanceTransaction(referrerData.stripeCustomerId, {
            amount: -2000,
            currency: 'usd',
            description: 'Referral reward'
          });
        }

        await db.collection('users').doc(referrerId).update({
          referralCount: admin.firestore.FieldValue.increment(1),
          referralEarnings: admin.firestore.FieldValue.increment(20)
        });
      }
    }
  });

// ============================================
// ANALYTICS AND CHURN PREVENTION
// ============================================

exports.trackActivity = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { activityType, metadata } = data;
  const userId = context.auth.uid;

  await db.collection('analytics').add({
    userId,
    activityType,
    metadata,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  await db.collection('users').doc(userId).update({
    lastActivity: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

exports.detectChurnRisk = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const inactiveUsers = await db.collection('users')
    .where('lastActivity', '<', sevenDaysAgo)
    .where('subscriptionStatus', '==', 'active')
    .get();

  for (const doc of inactiveUsers.docs) {
    const userId = doc.id;
    
    await db.collection('users').doc(userId).update({
      churnRisk: true,
      churnRiskDetectedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await db.collection('notifications').add({
      userId,
      type: 'churn_prevention',
      title: 'We miss you!',
      message: 'Come back and continue your learning journey. We have new lessons waiting for you!',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });
  }

  return null;
});

exports.calculateAnalytics = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dailyActive = await db.collection('users')
    .where('lastActivity', '>=', oneDayAgo)
    .get();

  const weeklyActive = await db.collection('users')
    .where('lastActivity', '>=', oneWeekAgo)
    .get();

  const monthlyActive = await db.collection('users')
    .where('lastActivity', '>=', oneMonthAgo)
    .get();

  const completedLessons = await db.collection('analytics')
    .where('activityType', '==', 'lesson_completed')
    .where('timestamp', '>=', oneDayAgo)
    .get();

  const quizResults = await db.collection('analytics')
    .where('activityType', '==', 'quiz_completed')
    .where('timestamp', '>=', oneDayAgo)
    .get();

  let totalQuizScore = 0;
  quizResults.forEach(doc => {
    totalQuizScore += doc.data().metadata?.score || 0;
  });
  const avgQuizScore = quizResults.size > 0 ? totalQuizScore / quizResults.size : 0;

  await db.collection('metrics').add({
    date: admin.firestore.FieldValue.serverTimestamp(),
    dailyActiveUsers: dailyActive.size,
    weeklyActiveUsers: weeklyActive.size,
    monthlyActiveUsers: monthlyActive.size,
    lessonsCompleted: completedLessons.size,
    quizzesCompleted: quizResults.size,
    avgQuizScore
  });

  return null;
});

// ============================================
// VOICE INTERACTION
// ============================================

exports.processVoiceQuestion = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData.features?.voiceEnabled) {
    throw new functions.https.HttpsError('permission-denied', 'Voice features not available in your plan');
  }

  const settingsDoc = await db.collection('settings').doc('global').get();
  if (settingsDoc.data()?.voiceDisabled) {
    throw new functions.https.HttpsError('unavailable', 'Voice features are temporarily disabled');
  }

  const { audioMetadata, lessonId } = data;

  await db.collection('voiceInteractions').add({
    userId,
    lessonId,
    audioMetadata,
    type: 'question',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    transcription: 'Voice transcription would go here',
    success: true
  };
});

exports.generateVoiceResponse = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (!userData.features?.voiceEnabled) {
    throw new functions.https.HttpsError('permission-denied', 'Voice features not available in your plan');
  }

  const { text, lessonId } = data;

  await db.collection('voiceInteractions').add({
    userId,
    lessonId,
    text,
    type: 'response',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    audioUrl: 'placeholder-audio-url',
    success: true
  };
});

// ============================================
// SCALE AND SAFETY
// ============================================

exports.checkRateLimit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userId = context.auth.uid;
  const { action } = data;

  const userDoc = await db.collection('users').doc(userId).get();
  const tier = userDoc.data()?.subscriptionTier || 'starter';
  const aiLimit = PRICING_TIERS[tier].features.aiLimit;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentUsage = await db.collection('aiUsage')
    .where('userId', '==', userId)
    .where('timestamp', '>=', oneHourAgo)
    .get();

  if (recentUsage.size >= aiLimit) {
    throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded for your tier');
  }

  await db.collection('aiUsage').add({
    userId,
    action,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { allowed: true, remaining: aiLimit - recentUsage.size - 1 };
});

exports.trackAICosts = functions.firestore
  .document('aiUsage/{usageId}')
  .onCreate(async (snap, context) => {
    const usage = snap.data();
    const estimatedCost = 0.002;

    const today = new Date().toISOString().split('T')[0];
    const costDoc = db.collection('costs').doc(today);

    await costDoc.set({
      date: today,
      aiCost: admin.firestore.FieldValue.increment(estimatedCost),
      requestCount: admin.firestore.FieldValue.increment(1)
    }, { merge: true });

    const costData = (await costDoc.get()).data();
    if (costData.aiCost > 100) {
      await alertAdmin('AI cost spike', `Daily AI costs have reached ${costData.aiCost.toFixed(2)}`);
    }
  });

exports.queueBackgroundJob = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { jobType, jobData } = data;

  await db.collection('jobQueue').add({
    jobType,
    jobData,
    status: 'pending',
    userId: context.auth.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    retryCount: 0
  });

  return { success: true };
});

exports.processJobQueue = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  const pendingJobs = await db.collection('jobQueue')
    .where('status', '==', 'pending')
    .where('retryCount', '<', 3)
    .limit(10)
    .get();

  for (const doc of pendingJobs.docs) {
    const jobId = doc.id;
    const job = doc.data();

    try {
      await processJob(job);

      await db.collection('jobQueue').doc(jobId).update({
        status: 'completed',
        completedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);

      await db.collection('jobQueue').doc(jobId).update({
        status: 'failed',
        retryCount: admin.firestore.FieldValue.increment(1),
        lastError: error.message,
        lastAttempt: admin.firestore.FieldValue.serverTimestamp()
      });

      if (job.retryCount >= 2) {
        await alertAdmin('Job failed after retries', `Job ${jobId} of type ${job.jobType} failed after 3 attempts`);
      }
    }
  }

  return null;
});

async function processJob(job) {
  switch (job.jobType) {
    case 'generate_report':
      break;
    case 'process_lesson':
      break;
    default:
      throw new Error(`Unknown job type: ${job.jobType}`);
  }
}

// ============================================
// ADMIN EXTENSIONS
// ============================================

exports.grantCredit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.data()?.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { userId, creditAmount, reason } = data;

  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (userData.stripeCustomerId) {
    await stripe.customers.createBalanceTransaction(userData.stripeCustomerId, {
      amount: -creditAmount * 100,
      currency: 'usd',
      description: reason || 'Admin credit grant'
    });
  }

  await db.collection('adminActions').add({
    adminId: context.auth.uid,
    action: 'grant_credit',
    targetUserId: userId,
    amount: creditAmount,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

exports.toggleFeatureFlag = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.data()?.isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { flagName, enabled } = data;

  await db.collection('settings').doc('featureFlags').set({
    [flagName]: enabled,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedBy: context.auth.uid
  }, { merge: true });

  return { success: true };
});

exports.exportData = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  if (!callerDoc.data()?.features?.dataExport) {
    throw new functions.https.HttpsError('permission-denied', 'Data export not available in your plan');
  }

  const { exportType, startDate, endDate } = data;

  let exportData = [];

  switch (exportType) {
    case 'users':
      const users = await db.collection('users').get();
      exportData = users.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      break;
    case 'lessons':
      const lessons = await db.collection('lessons').get();
      exportData = lessons.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      break;
    case 'revenue':
      const payments = await db.collection('payments')
        .where('createdAt', '>=', new Date(startDate))
        .where('createdAt', '<=', new Date(endDate))
        .get();
      exportData = payments.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      break;
  }

  return { data: exportData };
});

async function alertAdmin(subject, message) {
  await db.collection('adminAlerts').add({
    subject,
    message,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    read: false
  });

  console.log(`ADMIN ALERT: ${subject} - ${message}`);
}