// API Route to update user subscription
// Phase 7A: Pricing Tiers & Upsells

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/firebase';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }
    
    // Get the authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetTier, priceId, subscriptionId } = body;

    if (!priceId || !subscriptionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations', // Charge/credit prorated amount
    });

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
