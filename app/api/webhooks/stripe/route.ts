// Stripe Webhook Handler - Handle subscription events and tier changes
// Phase 7A: Pricing Tiers & Upsells

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getTierFromPrice } from '@/lib/pricingTiers';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }
  
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const status = subscription.status;

  // Get tier from price ID
  const tier = getTierFromPrice(priceId);

  if (!tier) {
    console.error('Unknown price ID:', priceId);
    return;
  }

  // Find user by Stripe customer ID
  const userRef = doc(db, 'users', customerId); // Assuming customerId maps to uid
  
  // Update user's subscription tier and status
  await updateDoc(userRef, {
    subscriptionTier: tier,
    subscriptionStatus: status,
    stripeCustomerId: customerId,
    stripePriceId: priceId,
    subscriptionId: subscription.id,
    lastUpdated: serverTimestamp(),
  });

  // Reset AI usage counter on tier change
  if (status === 'active') {
    await updateDoc(userRef, {
      aiUsageThisMonth: 0,
    });
  }

  console.log(`Updated subscription for customer ${customerId} to tier ${tier}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const userRef = doc(db, 'users', customerId);
  
  // Update user's subscription status
  await updateDoc(userRef, {
    subscriptionStatus: 'canceled',
    subscriptionTier: 'starter', // Downgrade to starter on cancellation
    lastUpdated: serverTimestamp(),
  });

  console.log(`Subscription canceled for customer ${customerId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // Log successful payment
  await setDoc(doc(db, 'payments', invoice.id), {
    customerId,
    subscriptionId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    invoiceId: invoice.id,
    createdAt: serverTimestamp(),
  });

  console.log(`Payment succeeded for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  // Log failed payment
  await setDoc(doc(db, 'payments', invoice.id), {
    customerId,
    subscriptionId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    invoiceId: invoice.id,
    createdAt: serverTimestamp(),
  });

  // Update user status to past_due
  const userRef = doc(db, 'users', customerId);
  await updateDoc(userRef, {
    subscriptionStatus: 'past_due',
    lastUpdated: serverTimestamp(),
  });

  console.log(`Payment failed for customer ${customerId}`);
}
