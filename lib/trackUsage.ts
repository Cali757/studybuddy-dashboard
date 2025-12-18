import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function trackUsage(
  userId: string,
  feature: string,
  metadata?: Record<string, any>
) {
  try {
    await addDoc(collection(db, 'UsageTracking'), {
      userId,
      feature,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
}
