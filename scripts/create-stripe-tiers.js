// Script to create Stripe products and prices for StudyBuddy tiers
// Run this once to set up the pricing tiers in Stripe
// Usage: node scripts/create-stripe-tiers.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPricingTiers() {
  console.log('Creating StudyBuddy pricing tiers in Stripe...');

  try {
    // Create Starter tier
    const starterProduct = await stripe.products.create({
      name: 'StudyBuddy Starter',
      description: 'Perfect for individual students getting started',
      metadata: {
        tier: 'starter',
        aiCallsPerMonth: '100',
        maxLessons: '10',
      },
    });

    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 2000, // $20.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'starter',
      },
    });

    console.log('✓ Starter tier created');
    console.log(`  Product ID: ${starterProduct.id}`);
    console.log(`  Price ID: ${starterPrice.id}`);

    // Create Pro tier
    const proProduct = await stripe.products.create({
      name: 'StudyBuddy Pro',
      description: 'For serious learners who want voice interaction and higher limits',
      metadata: {
        tier: 'pro',
        aiCallsPerMonth: '500',
        maxLessons: '50',
        voiceEnabled: 'true',
      },
    });

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 3900, // $39.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'pro',
      },
    });

    console.log('✓ Pro tier created');
    console.log(`  Product ID: ${proProduct.id}`);
    console.log(`  Price ID: ${proPrice.id}`);

    // Create Team tier
    const teamProduct = await stripe.products.create({
      name: 'StudyBuddy Team',
      description: 'For teams and power users with admin tools and unlimited lessons',
      metadata: {
        tier: 'team',
        aiCallsPerMonth: '2000',
        maxLessons: 'unlimited',
        voiceEnabled: 'true',
        adminTools: 'true',
      },
    });

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 7900, // $79.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        tier: 'team',
      },
    });

    console.log('✓ Team tier created');
    console.log(`  Product ID: ${teamProduct.id}`);
    console.log(`  Price ID: ${teamPrice.id}`);

    console.log('\n=== Add these to your .env.local file ===');
    console.log(`NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=${teamPrice.id}`);
    console.log('\n=== Setup complete! ===');
  } catch (error) {
    console.error('Error creating pricing tiers:', error);
    process.exit(1);
  }
}

createPricingTiers();
