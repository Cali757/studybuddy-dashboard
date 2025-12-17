'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ErrorLog {
  id: string;
  type: string;
  message: string;
  timestamp: any;
  userId?: string;
  functionName?: string;
  stack?: string;
  severity?: string;
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [filterType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const errorsRef = collection(db, 'errors');
      let q;
      
      if (filterType === 'all') {
        q = query(errorsRef, orderBy('timestamp', 'desc'), limit(100));
      } else {
        q = query(
          errorsRef,
          where('type', '==', filterType),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
      }
      
      const snapshot = await getDocs(q);
      
      const logsData: ErrorLog[] = [];
      snapshot.forEach((doc) => {
        logsData.push({
          id: doc.id,
          ...doc.data()
        } as ErrorLog);
      });
      
      setLogs(logsData);
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to fetch logs');
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

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'cloud_function':
      case 'function':
        return 'bg-blue-600/20 text-blue-300';
      case 'ai_failure':
      case 'ai':
        return 'bg-purple-600/20 text-purple-300';
      case 'stripe_webhook':
      case 'stripe':
        return 'bg-green-600/20 text-green-300';
      case 'auth':
        return 'bg-orange-600/20 text-orange-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'bg-red-600/20 text-red-300';
      case 'warning':
        return 'bg-yellow-600/20 text-yellow-300';
      case 'info':
        return 'bg-blue-600/20 text-blue-300';
      default:
        return 'bg-gray-600/20 text-gray-300';
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading logs...</div>
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

  // Calculate stats
  const cloudFunctionErrors = logs.filter(l => l.type?.toLowerCase().includes('function')).length;
  const aiFailures = logs.filter(l => l.type?.toLowerCase().includes('ai')).length;
  const stripeErrors = logs.filter(l => l.type?.toLowerCase().includes('stripe')).length;
  const criticalErrors = logs.filter(l => l.severity?.toLowerCase() === 'critical' || l.severity?.toLowerCase() === 'error').length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">System Logs & Errors</h2>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Total Errors</div>
          <div className="text-2xl font-bold text-white">{logs.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Cloud Functions</div>
          <div className="text-2xl font-bold text-blue-400">{cloudFunctionErrors}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">AI Failures</div>
          <div className="text-2xl font-bold text-purple-400">{aiFailures}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-400">{criticalErrors}</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterType('cloud_function')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'cloud_function'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Cloud Functions
        </button>
        <button
          onClick={() => setFilterType('ai_failure')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'ai_failure'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          AI Failures
        </button>
        <button
          onClick={() => setFilterType('stripe_webhook')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterType === 'stripe_webhook'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Stripe Webhooks
        </button>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="bg-gray-800 rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-700/50 transition-colors"
              onClick={() => toggleExpand(log.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                      {log.type || 'unknown'}
                    </span>
                    {log.severity && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                        {log.severity}
                      </span>
                    )}
                    {log.functionName && (
                      <span className="text-xs text-gray-400">
                        {log.functionName}
                      </span>
                    )}
                  </div>
                  <div className="text-gray-200 mb-1">{log.message}</div>
                  <div className="text-xs text-gray-400">
                    {formatDate(log.timestamp)}
                    {log.userId && ` • User: ${log.userId.substring(0, 8)}...`}
                  </div>
                </div>
                <div className="text-gray-400">
                  {expandedLog === log.id ? '▼' : '▶'}
                </div>
              </div>
            </div>
            
            {expandedLog === log.id && log.stack && (
              <div className="border-t border-gray-700 p-4 bg-gray-900">
                <div className="text-xs text-gray-400 mb-2 font-semibold">Stack Trace:</div>
                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {log.stack}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-4">✅</div>
          <div>No errors found. System is running smoothly!</div>
        </div>
      )}

      {/* Setup Note */}
      {logs.length === 0 && (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-xl">ℹ️</span>
            <div>
              <div className="text-blue-200 font-medium mb-1">Error Logging Setup</div>
              <div className="text-blue-300/80 text-sm">
                To track errors, ensure your Cloud Functions log errors to the 'errors' collection in Firestore.
                Each document should include: type, message, timestamp, severity, functionName, userId, and stack fields.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
