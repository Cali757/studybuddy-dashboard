'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isAdmin } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';
import UsersPanel from './components/UsersPanel';
import RevenuePanel from './components/RevenuePanel';
import AIUsagePanel from './components/AIUsagePanel';
import LessonsPanel from './components/LessonsPanel';
import LogsPanel from './components/LogsPanel';
import ControlPanel from './components/ControlPanel';

export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait for auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
            // Not logged in - redirect to login
            router.push('/login');
            return;
          }

          // Check if user is admin
          const adminStatus = await isAdmin(user);
          
          if (!adminStatus) {
            // Not an admin - redirect to home
            router.push('/');
            return;
          }

          // User is admin - allow access
          setIsAdminUser(true);
          setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f7fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          <p style={{ fontSize: '18px', color: '#718096' }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2d3748',
        color: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>🛡️ StudyBuddy Admin</h1>
          <p style={{ fontSize: '14px', margin: '5px 0 0 0', opacity: 0.8 }}>System Control & Monitoring</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="/dashboard" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Student View</a>
          <button style={{
            backgroundColor: '#e53e3e',
            color: 'white',
            padding: '8px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'users', label: '👥 Users', icon: '👥' },
            { id: 'revenue', label: '💰 Revenue', icon: '💰' },
            { id: 'ai-usage', label: '🤖 AI Usage', icon: '🤖' },
            { id: 'lessons', label: '📚 Lessons', icon: '📚' },
            { id: 'logs', label: '📋 Logs', icon: '📋' },
            { id: 'controls', label: '⚙️ Controls', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#667eea' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#4a5568',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '500px'
        }}>
          {activeTab === 'users' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>👥 User Management</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>Monitor and manage user accounts</p>
              <UsersPanel />
            </div>
          )}

          {activeTab === 'revenue' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>💰 Revenue Analytics</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>Track subscriptions and revenue</p>
              <RevenuePanel />
            </div>
          )}

          {activeTab === 'ai-usage' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>🤖 AI Usage & Costs</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>Monitor AI calls and token usage</p>
              <AIUsagePanel />
            </div>
          )}

          {activeTab === 'lessons' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>📚 Lesson Management</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>Monitor lesson ingestion and processing</p>
              <LessonsPanel />
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>📋 System Logs & Errors</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>View system errors and logs</p>
              <LogsPanel />
            </div>
          )}

          {activeTab === 'controls' && (
            <div>
              <h2 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '20px' }}>⚙️ System Controls</h2>
              <p style={{ color: '#718096', marginBottom: '30px' }}>Critical system kill switches</p>
              <ControlPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
