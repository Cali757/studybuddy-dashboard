'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RevenueStats {
  totalSubscribers: number;
  activeSubscribers: number;
  canceledSubscribers: number;
  mrr: number;
}

export default function RevenuePanel() {
  const [stats, setStats] = useState<RevenueStats>({
    totalSubscribers: 0,
    activeSubscribers: 0,
    canceledSubscribers: 0,
    mrr: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all users with subscription data
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      let activeCount = 0;
      let canceledCount = 0;
      let totalMRR = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const subscriptionStatus = data.subscriptionStatus;
        const subscriptionPrice = data.subscriptionPrice || 0;
        
        if (subscriptionStatus === 'active') {
          activeCount++;
          totalMRR += subscriptionPrice;
        } else if (subscriptionStatus === 'canceled') {
          canceledCount++;
        }
      });
      
      setStats({
        totalSubscribers: activeCount + canceledCount,
        activeSubscribers: activeCount,
        canceledSubscribers: canceledCount,
        mrr: totalMRR
      });
    } catch (err: any) {
      console.error('Error fetching revenue data:', err);
      setError(err.message || 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading revenue data...</div>
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
        <h2 className="text-xl font-semibold text-white">Revenue Overview</h2>
        <button
          onClick={fetchRevenueData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Subscribers */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total Subscribers</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalSubscribers}</div>
          <div className="text-xs opacity-75 mt-2">All time</div>
        </div>

        {/* Active Subscribers */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Active Subscribers</span>
            <span className="text-2xl">✅</span>
          </div>
          <div className="text-3xl font-bold">{stats.activeSubscribers}</div>
          <div className="text-xs opacity-75 mt-2">Currently paying</div>
        </div>

        {/* Canceled Subscribers */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Canceled</span>
            <span className="text-2xl">❌</span>
          </div>
          <div className="text-3xl font-bold">{stats.canceledSubscribers}</div>
          <div className="text-xs opacity-75 mt-2">Churned users</div>
        </div>

        {/* Monthly Recurring Revenue */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">MRR</span>
            <span className="text-2xl">💰</span>
          </div>
          <div className="text-3xl font-bold">${stats.mrr.toFixed(2)}</div>
          <div className="text-xs opacity-75 mt-2">Monthly recurring</div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Retention Rate */}
          <div>
            <div className="text-gray-400 text-sm mb-1">Retention Rate</div>
            <div className="text-2xl font-bold text-white">
              {stats.totalSubscribers > 0
                ? ((stats.activeSubscribers / stats.totalSubscribers) * 100).toFixed(1)
                : 0}%
            </div>
          </div>

          {/* Churn Rate */}
          <div>
            <div className="text-gray-400 text-sm mb-1">Churn Rate</div>
            <div className="text-2xl font-bold text-white">
              {stats.totalSubscribers > 0
                ? ((stats.canceledSubscribers / stats.totalSubscribers) * 100).toFixed(1)
                : 0}%
            </div>
          </div>

          {/* Average Revenue Per User */}
          <div>
            <div className="text-gray-400 text-sm mb-1">ARPU</div>
            <div className="text-2xl font-bold text-white">
              ${stats.activeSubscribers > 0
                ? (stats.mrr / stats.activeSubscribers).toFixed(2)
                : '0.00'}
            </div>
          </div>
        </div>
      </div>

      {/* Note about Stripe Integration */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-500 text-xl">⚠️</span>
          <div>
            <div className="text-yellow-200 font-medium mb-1">Stripe Integration Required</div>
            <div className="text-yellow-300/80 text-sm">
              For accurate revenue tracking, ensure Stripe webhook data is being synced to the users collection.
              Current data is based on subscriptionStatus and subscriptionPrice fields in Firestore.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
