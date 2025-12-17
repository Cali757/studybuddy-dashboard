'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SystemConfig {
  aiEnabled: boolean;
  billingEnabled: boolean;
  ingestEnabled: boolean;
  lastUpdated?: any;
  updatedBy?: string;
}

export default function ControlPanel() {
  const [config, setConfig] = useState<SystemConfig>({
    aiEnabled: true,
    billingEnabled: true,
    ingestEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const configRef = doc(db, 'system', 'config');
      const configDoc = await getDoc(configRef);
      
      if (configDoc.exists()) {
        const data = configDoc.data() as SystemConfig;
        setConfig({
          aiEnabled: data.aiEnabled ?? true,
          billingEnabled: data.billingEnabled ?? true,
          ingestEnabled: data.ingestEnabled ?? true,
          lastUpdated: data.lastUpdated,
          updatedBy: data.updatedBy
        });
      } else {
        // Initialize with default values
        const defaultConfig: SystemConfig = {
          aiEnabled: true,
          billingEnabled: true,
          ingestEnabled: true,
          lastUpdated: new Date(),
          updatedBy: 'system'
        };
        await setDoc(configRef, defaultConfig);
        setConfig(defaultConfig);
      }
    } catch (err: any) {
      console.error('Error fetching config:', err);
      setError(err.message || 'Failed to fetch system configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateFlag = async (flag: keyof SystemConfig, value: boolean) => {
    const flagName = flag as string;
    
    if (!confirm(`Are you sure you want to ${value ? 'ENABLE' : 'DISABLE'} ${flagName}? This will affect all users immediately.`)) {
      return;
    }
    
    try {
      setSaving(flagName);
      
      const configRef = doc(db, 'system', 'config');
      const updates = {
        [flag]: value,
        lastUpdated: new Date(),
        updatedBy: 'admin' // In production, use actual admin user ID
      };
      
      await updateDoc(configRef, updates);
      
      setConfig(prev => ({
        ...prev,
        [flag]: value,
        lastUpdated: new Date()
      }));
      
      alert(`${flagName} has been ${value ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: any) {
      console.error(`Error updating ${flagName}:`, err);
      alert(`Failed to update ${flagName}: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleString();
      }
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleString();
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading system configuration...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">System Control Panel</h2>
        <button
          onClick={fetchConfig}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-red-500 text-2xl">⚠️</span>
          <div>
            <div className="text-red-200 font-bold mb-1">CRITICAL SYSTEM CONTROLS</div>
            <div className="text-red-300/80 text-sm">
              These kill switches affect all users immediately. Only disable features if there is a critical issue.
              All changes are logged and will affect production instantly.
            </div>
          </div>
        </div>
      </div>

      {/* Control Switches */}
      <div className="space-y-4">
        {/* AI System Control */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤖</span>
                <h3 className="text-xl font-semibold text-white">AI System</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.aiEnabled
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                }`}>
                  {config.aiEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Controls all AI features including summaries, Q&A, and quiz generation.
                Disabling this will prevent all AI API calls.
              </p>
            </div>
            <div className="ml-6">
              <button
                onClick={() => updateFlag('aiEnabled', !config.aiEnabled)}
                disabled={saving === 'aiEnabled'}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  config.aiEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving === 'aiEnabled' ? 'Updating...' : config.aiEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Billing System Control */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💳</span>
                <h3 className="text-xl font-semibold text-white">Billing System</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.billingEnabled
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                }`}>
                  {config.billingEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Controls Stripe integration and subscription processing.
                Disabling this will prevent new subscriptions and payment processing.
              </p>
            </div>
            <div className="ml-6">
              <button
                onClick={() => updateFlag('billingEnabled', !config.billingEnabled)}
                disabled={saving === 'billingEnabled'}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  config.billingEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving === 'billingEnabled' ? 'Updating...' : config.billingEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Lesson Ingestion Control */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📚</span>
                <h3 className="text-xl font-semibold text-white">Lesson Ingestion</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  config.ingestEnabled
                    ? 'bg-green-600/20 text-green-300'
                    : 'bg-red-600/20 text-red-300'
                }`}>
                  {config.ingestEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Controls lesson upload and Google Drive ingestion.
                Disabling this will prevent users from adding new lessons.
              </p>
            </div>
            <div className="ml-6">
              <button
                onClick={() => updateFlag('ingestEnabled', !config.ingestEnabled)}
                disabled={saving === 'ingestEnabled'}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  config.ingestEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving === 'ingestEnabled' ? 'Updating...' : config.ingestEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="text-sm text-gray-400">
          <strong>Last Updated:</strong> {formatDate(config.lastUpdated)}
          {config.updatedBy && <span> by {config.updatedBy}</span>}
        </div>
      </div>

      {/* Implementation Note */}
      <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-400 text-xl">ℹ️</span>
          <div>
            <div className="text-blue-200 font-medium mb-1">Backend Integration Required</div>
            <div className="text-blue-300/80 text-sm">
              For these kill switches to work, your Cloud Functions must check the system/config document before executing.
              Example: Before processing AI requests, check if aiEnabled is true in Firestore.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
