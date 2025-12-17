'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AIUsageStats {
  summaryCalls: number;
  qaCalls: number;
  quizCalls: number;
  totalCalls: number;
  estimatedTokens: number;
  estimatedCost: number;
}

interface AIUsageLog {
  id: string;
  type: string;
  timestamp: any;
  userId: string;
  tokensUsed?: number;
  model?: string;
}

export default function AIUsagePanel() {
  const [stats, setStats] = useState<AIUsageStats>({
    summaryCalls: 0,
    qaCalls: 0,
    quizCalls: 0,
    totalCalls: 0,
    estimatedTokens: 0,
    estimatedCost: 0
  });
  const [recentLogs, setRecentLogs] = useState<AIUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAIUsageData();
  }, []);

  const fetchAIUsageData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from ai_usage collection
      const aiUsageRef = collection(db, 'ai_usage');
      const snapshot = await getDocs(aiUsageRef);
      
      let summaryCalls = 0;
      let qaCalls = 0;
      let quizCalls = 0;
      let totalTokens = 0;
      const logs: AIUsageLog[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const type = data.type || 'unknown';
        
        // Count by type
        if (type === 'summary' || type === 'summarize') {
          summaryCalls++;
        } else if (type === 'qa' || type === 'question') {
          qaCalls++;
        } else if (type === 'quiz' || type === 'quiz_generation') {
          quizCalls++;
        }
        
        // Sum tokens
        if (data.tokensUsed) {
          totalTokens += data.tokensUsed;
        }
        
        // Add to logs
        logs.push({
          id: doc.id,
          type: type,
          timestamp: data.timestamp,
          userId: data.userId || 'unknown',
          tokensUsed: data.tokensUsed,
          model: data.model
        });
      });
      
      // Sort logs by timestamp (most recent first)
      logs.sort((a, b) => {
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        const aTime = a.timestamp.toMillis ? a.timestamp.toMillis() : a.timestamp;
        const bTime = b.timestamp.toMillis ? b.timestamp.toMillis() : b.timestamp;
        return bTime - aTime;
      });
      
      const totalCalls = summaryCalls + qaCalls + quizCalls;
      
      // Estimate cost (rough estimate: $0.002 per 1K tokens for GPT-3.5)
      const estimatedCost = (totalTokens / 1000) * 0.002;
      
      setStats({
        summaryCalls,
        qaCalls,
        quizCalls,
        totalCalls,
        estimatedTokens: totalTokens,
        estimatedCost
      });
      
      setRecentLogs(logs.slice(0, 20)); // Keep only 20 most recent
      
    } catch (err: any) {
      console.error('Error fetching AI usage data:', err);
      setError(err.message || 'Failed to fetch AI usage data');
    } finally {
      setLoading(false);
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
        <div className="text-gray-400">Loading AI usage data...</div>
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
        <h2 className="text-xl font-semibold text-white">AI Usage & Costs</h2>
        <button
          onClick={fetchAIUsageData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Summary Calls */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Summary Calls</span>
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-3xl font-bold">{stats.summaryCalls.toLocaleString()}</div>
          <div className="text-xs opacity-75 mt-2">Lesson summaries</div>
        </div>

        {/* Q&A Calls */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Q&A Calls</span>
            <span className="text-2xl">💬</span>
          </div>
          <div className="text-3xl font-bold">{stats.qaCalls.toLocaleString()}</div>
          <div className="text-xs opacity-75 mt-2">Student questions</div>
        </div>

        {/* Quiz Generation */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Quiz Generation</span>
            <span className="text-2xl">📋</span>
          </div>
          <div className="text-3xl font-bold">{stats.quizCalls.toLocaleString()}</div>
          <div className="text-xs opacity-75 mt-2">Quizzes created</div>
        </div>

        {/* Total Calls */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Total Calls</span>
            <span className="text-2xl">🤖</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalCalls.toLocaleString()}</div>
          <div className="text-xs opacity-75 mt-2">All AI requests</div>
        </div>
      </div>

      {/* Cost Metrics */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Estimated Tokens */}
          <div>
            <div className="text-gray-400 text-sm mb-1">Total Tokens Used</div>
            <div className="text-2xl font-bold text-white">
              {stats.estimatedTokens.toLocaleString()}
            </div>
          </div>

          {/* Estimated Cost */}
          <div>
            <div className="text-gray-400 text-sm mb-1">Estimated Cost</div>
            <div className="text-2xl font-bold text-green-400">
              ${stats.estimatedCost.toFixed(2)}
            </div>
          </div>

          {/* Average Cost Per Call */}
          <div>
            <div className="text-gray-400 text-sm mb-1">Avg Cost Per Call</div>
            <div className="text-2xl font-bold text-white">
              ${stats.totalCalls > 0 ? (stats.estimatedCost / stats.totalCalls).toFixed(4) : '0.0000'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent AI Calls</h3>
        {recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-3 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Timestamp</th>
                  <th className="text-left p-3 text-gray-300 font-medium">User ID</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Tokens</th>
                  <th className="text-left p-3 text-gray-300 font-medium">Model</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.type === 'summary' || log.type === 'summarize'
                          ? 'bg-blue-600/20 text-blue-300'
                          : log.type === 'qa' || log.type === 'question'
                          ? 'bg-green-600/20 text-green-300'
                          : 'bg-purple-600/20 text-purple-300'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-sm">{formatDate(log.timestamp)}</td>
                    <td className="p-3 text-gray-400 text-sm font-mono">{log.userId.substring(0, 8)}...</td>
                    <td className="p-3 text-gray-300">{log.tokensUsed?.toLocaleString() || 'N/A'}</td>
                    <td className="p-3 text-gray-400 text-sm">{log.model || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No AI usage logs found. The ai_usage collection may be empty.
          </div>
        )}
      </div>

      {/* Setup Note */}
      {stats.totalCalls === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-500 text-xl">⚠️</span>
            <div>
              <div className="text-yellow-200 font-medium mb-1">AI Usage Tracking Setup Required</div>
              <div className="text-yellow-300/80 text-sm">
                To track AI usage, ensure your Cloud Functions log AI calls to the 'ai_usage' collection in Firestore.
                Each document should include: type, timestamp, userId, tokensUsed, and model fields.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
