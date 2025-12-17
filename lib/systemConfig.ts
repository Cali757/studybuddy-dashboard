import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

interface SystemConfig {
  aiEnabled: boolean;
  billingEnabled: boolean;
  ingestEnabled: boolean;
}

let cachedConfig: SystemConfig | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 60000; // 1 minute cache

/**
 * Fetches the system configuration from Firestore
 * Uses caching to avoid excessive reads
 */
export async function getSystemConfig(): Promise<SystemConfig> {
  const now = Date.now();
  
  // Return cached config if still valid
  if (cachedConfig && (now - lastFetch) < CACHE_DURATION) {
    return cachedConfig;
  }
  
  try {
    const configRef = doc(db, 'system', 'config');
    const configDoc = await getDoc(configRef);
    
    if (configDoc.exists()) {
      const data = configDoc.data();
      cachedConfig = {
        aiEnabled: data.aiEnabled ?? true,
        billingEnabled: data.billingEnabled ?? true,
        ingestEnabled: data.ingestEnabled ?? true
      };
      lastFetch = now;
      return cachedConfig;
    }
    
    // Default to all enabled if config doesn't exist
    return {
      aiEnabled: true,
      billingEnabled: true,
      ingestEnabled: true
    };
  } catch (error) {
    console.error('Error fetching system config:', error);
    // On error, default to all enabled to avoid breaking functionality
    return {
      aiEnabled: true,
      billingEnabled: true,
      ingestEnabled: true
    };
  }
}

/**
 * Checks if AI features are enabled
 */
export async function isAIEnabled(): Promise<boolean> {
  const config = await getSystemConfig();
  return config.aiEnabled;
}

/**
 * Checks if billing features are enabled
 */
export async function isBillingEnabled(): Promise<boolean> {
  const config = await getSystemConfig();
  return config.billingEnabled;
}

/**
 * Checks if lesson ingestion is enabled
 */
export async function isIngestEnabled(): Promise<boolean> {
  const config = await getSystemConfig();
  return config.ingestEnabled;
}

/**
 * Clears the cached config (useful for testing or forcing a refresh)
 */
export function clearConfigCache(): void {
  cachedConfig = null;
  lastFetch = 0;
}
