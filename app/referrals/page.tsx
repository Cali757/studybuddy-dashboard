'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { getUserReferralCode, getReferralStats, getReferralHistory } from '@/lib/referrals';
import { getPendingRewards, claimAllRewards } from '@/lib/referralRewards';
import { useRequireAuth } from '@/lib/useRequireAuth';

export default function ReferralsPage() {
  const { loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.push('/login');
        return;
      }

      setUser(authUser);
      await loadReferralData(authUser.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadReferralData = async (uid: string) => {
    try {
      const [code, statsData, historyData, rewardsData] = await Promise.all([
        getUserReferralCode(uid),
        getReferralStats(uid),
        getReferralHistory(uid),
        getPendingRewards(uid)
      ]);

      setReferralCode(code);
      setStats(statsData);
      setHistory(historyData);
      setPendingRewards(rewardsData);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimRewards = async () => {
    if (!user) return;
    
    setClaiming(true);
    try {
      const result = await claimAllRewards(user.uid);
      
      if (result.successful > 0) {
        alert(`Successfully claimed ${result.successful} reward(s)!`);
        await loadReferralData(user.uid);
      }
      
      if (result.failed > 0) {
        alert(`Failed to claim ${result.failed} reward(s). Please try again later.`);
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    } finally {
      setClaiming(false);
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
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Back to Dashboard
          </button>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '8px'
          }}>
            🎁 Referral Program
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
            Earn rewards by inviting friends to StudyBuddy
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Referrals</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats?.totalReferrals || 0}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Successful Conversions</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
              {stats?.successfulReferrals || 0}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending Rewards</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats?.pendingRewards || 0}
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Earned</div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>
              ${((stats?.totalRewardsEarned || 0) / 100).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
            Your Referral Code
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
            Share this code with friends. When they sign up and subscribe, you both get rewarded!
          </p>

          <div style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#667eea',
              letterSpacing: '4px',
              fontFamily: 'monospace'
            }}>
              {referralCode}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleCopyCode}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                background: 'white',
                color: '#667eea',
                border: '2px solid #667eea',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🔗 Copy Link
            </button>
          </div>
        </div>

        {/* Claim Rewards */}
        {pendingRewards.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '40px',
            color: 'white',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              🎉 You have {pendingRewards.length} reward(s) ready to claim!
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '20px' }}>
              Claim your rewards now to add credits to your account.
            </p>
            <button
              onClick={handleClaimRewards}
              disabled={claiming}
              style={{
                background: 'white',
                color: '#10b981',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: claiming ? 'not-allowed' : 'pointer',
                opacity: claiming ? 0.6 : 1
              }}
            >
              {claiming ? 'Claiming...' : 'Claim All Rewards'}
            </button>
          </div>
        )}

        {/* Referral History */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
            Referral History
          </h2>

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <div style={{ fontSize: '16px' }}>No referrals yet</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>Start sharing your code to earn rewards!</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#6b7280' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((referral, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                        {referral.referredUserEmail}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          background: referral.status === 'rewarded' ? '#d1fae5' :
                                     referral.status === 'converted' ? '#fef3c7' : '#f3f4f6',
                          color: referral.status === 'rewarded' ? '#065f46' :
                                referral.status === 'converted' ? '#92400e' : '#6b7280'
                        }}>
                          {referral.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {referral.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
