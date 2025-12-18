'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { PRICING_TIERS, SubscriptionTier } from '@/lib/pricingTiers';
import { getUserRole } from '@/lib/auth';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userData = await getUserRole(authUser.uid);
        if (userData?.subscriptionTier) {
          setCurrentTier(userData.subscriptionTier as SubscriptionTier);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPlan = async (tier: SubscriptionTier) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      
      const result = await createCheckoutSession({
        tier,
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing`
      });
      
      const { sessionId } = result.data as { sessionId: string };
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(m => m.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!));
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px'
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Unlock the full power of AI-driven learning with StudyBuddy
          </p>
        </div>

        {/* Pricing Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {Object.entries(PRICING_TIERS).map(([key, tier]) => {
            const isCurrentTier = currentTier === key;
            const isPro = key === 'pro';

            return (
              <div
                key={key}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '40px 30px',
                  boxShadow: isPro ? '0 20px 60px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.2)',
                  transform: isPro ? 'scale(1.05)' : 'scale(1)',
                  border: isPro ? '3px solid #667eea' : 'none',
                  position: 'relative'
                }}
              >
                {isPro && (
                  <div style={{
                    position: 'absolute',
                    top: '-15px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    MOST POPULAR
                  </div>
                )}

                {isCurrentTier && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: '#10b981',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    CURRENT PLAN
                  </div>
                )}

                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '8px'
                }}>
                  {tier.displayName}
                </h3>

                <p style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  marginBottom: '24px',
                  minHeight: '40px'
                }}>
                  {tier.description}
                </p>

                <div style={{ marginBottom: '30px' }}>
                  <span style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    ${tier.price}
                  </span>
                  <span style={{
                    fontSize: '18px',
                    color: '#6b7280'
                  }}>
                    /month
                  </span>
                </div>

                <button
                  onClick={() => handleSelectPlan(key as SubscriptionTier)}
                  disabled={isCurrentTier}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: isCurrentTier ? 'not-allowed' : 'pointer',
                    background: isCurrentTier
                      ? '#e5e7eb'
                      : isPro
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : '#667eea',
                    color: 'white',
                    marginBottom: '30px',
                    opacity: isCurrentTier ? 0.6 : 1
                  }}
                >
                  {isCurrentTier ? 'Current Plan' : 'Select Plan'}
                </button>

                {/* Features List */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>
                      {tier.features.aiCallsPerMonth} AI calls/month
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#10b981', marginRight: '8px' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>
                      {tier.features.maxLessons === -1 ? 'Unlimited' : tier.features.maxLessons} lessons
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: tier.features.voiceEnabled ? '#10b981' : '#d1d5db', marginRight: '8px' }}>
                      {tier.features.voiceEnabled ? '✓' : '✗'}
                    </span>
                    <span style={{ color: tier.features.voiceEnabled ? '#4b5563' : '#9ca3af' }}>
                      Voice interaction
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: tier.features.dataExport ? '#10b981' : '#d1d5db', marginRight: '8px' }}>
                      {tier.features.dataExport ? '✓' : '✗'}
                    </span>
                    <span style={{ color: tier.features.dataExport ? '#4b5563' : '#9ca3af' }}>
                      Data export
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: tier.features.adminTools ? '#10b981' : '#d1d5db', marginRight: '8px' }}>
                      {tier.features.adminTools ? '✓' : '✗'}
                    </span>
                    <span style={{ color: tier.features.adminTools ? '#4b5563' : '#9ca3af' }}>
                      Admin tools
                    </span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: tier.features.prioritySupport ? '#10b981' : '#d1d5db', marginRight: '8px' }}>
                      {tier.features.prioritySupport ? '✓' : '✗'}
                    </span>
                    <span style={{ color: tier.features.prioritySupport ? '#4b5563' : '#9ca3af' }}>
                      Priority support
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back to Dashboard */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid white',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
