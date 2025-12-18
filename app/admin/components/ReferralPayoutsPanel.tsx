// Admin Referral Payouts Panel - Manage and process referral rewards
// Phase 7B: Affiliates & Referrals

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, where, doc, updateDoc } from 'firebase/firestore';
import { processReward } from '@/lib/referralRewards';

export default function ReferralPayoutsPanel() {
  const [loading, setLoading] = useState(true);
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);
  const [appliedRewards, setAppliedRewards] = useState<any[]>([]);
  const [failedRewards, setFailedRewards] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'applied' | 'failed'>('pending');

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      // Get pending rewards
      const pendingQuery = query(
        collection(db, 'referral_rewards'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = await Promise.all(
        pendingSnapshot.docs.map(async (rewardDoc) => {
          const reward = { id: rewardDoc.id, ...rewardDoc.data() };
          // Get user email
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', reward.userId)));
          const userEmail = userDoc.docs[0]?.data()?.email || 'Unknown';
          return { ...reward, userEmail };
        })
      );
      setPendingRewards(pendingData);

      // Get applied rewards
      const appliedQuery = query(
        collection(db, 'referral_rewards'),
        where('status', '==', 'applied'),
        orderBy('appliedAt', 'desc')
      );
      const appliedSnapshot = await getDocs(appliedQuery);
      const appliedData = await Promise.all(
        appliedSnapshot.docs.map(async (rewardDoc) => {
          const reward = { id: rewardDoc.id, ...rewardDoc.data() };
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', reward.userId)));
          const userEmail = userDoc.docs[0]?.data()?.email || 'Unknown';
          return { ...reward, userEmail };
        })
      );
      setAppliedRewards(appliedData);

      // Get failed rewards
      const failedQuery = query(
        collection(db, 'referral_rewards'),
        where('status', '==', 'failed'),
        orderBy('createdAt', 'desc')
      );
      const failedSnapshot = await getDocs(failedQuery);
      const failedData = await Promise.all(
        failedSnapshot.docs.map(async (rewardDoc) => {
          const reward = { id: rewardDoc.id, ...rewardDoc.data() };
          const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', reward.userId)));
          const userEmail = userDoc.docs[0]?.data()?.email || 'Unknown';
          return { ...reward, userEmail };
        })
      );
      setFailedRewards(failedData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading rewards data:', error);
      setLoading(false);
    }
  };

  const handleProcessReward = async (rewardId: string) => {
    setProcessing(rewardId);
    try {
      const result = await processReward(rewardId);
      
      if (result.success) {
        alert('Reward processed successfully!');
        await loadRewardsData();
      } else {
        alert(`Failed to process reward: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error processing reward:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRetryFailed = async (rewardId: string) => {
    setProcessing(rewardId);
    try {
      // Reset status to pending
      await updateDoc(doc(db, 'referral_rewards', rewardId), {
        status: 'pending',
        error: null
      });
      
      // Try processing again
      const result = await processReward(rewardId);
      
      if (result.success) {
        alert('Reward processed successfully!');
        await loadRewardsData();
      } else {
        alert(`Failed to process reward: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error retrying reward:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#6b7280' }}>Loading payouts data...</div>;
  }

  const currentRewards = activeTab === 'pending' ? pendingRewards :
                        activeTab === 'applied' ? appliedRewards : failedRewards;

  return (
    <div>
      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>Pending Payouts</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#78350f' }}>
            {pendingRewards.length}
          </div>
          <div style={{ fontSize: '12px', color: '#92400e', marginTop: '4px' }}>
            ${(pendingRewards.reduce((sum, r) => sum + (r.amount || 0), 0) / 100).toFixed(2)} total
          </div>
        </div>

        <div style={{
          background: '#d1fae5',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #10b981'
        }}>
          <div style={{ fontSize: '14px', color: '#065f46', marginBottom: '8px' }}>Applied Payouts</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#047857' }}>
            {appliedRewards.length}
          </div>
          <div style={{ fontSize: '12px', color: '#065f46', marginTop: '4px' }}>
            ${(appliedRewards.reduce((sum, r) => sum + (r.amount || 0), 0) / 100).toFixed(2)} total
          </div>
        </div>

        <div style={{
          background: '#fee2e2',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #ef4444'
        }}>
          <div style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px' }}>Failed Payouts</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7f1d1d' }}>
            {failedRewards.length}
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '4px' }}>
            Requires attention
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'pending' ? '#667eea' : '#6b7280',
            fontWeight: activeTab === 'pending' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Pending ({pendingRewards.length})
        </button>
        <button
          onClick={() => setActiveTab('applied')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'applied' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'applied' ? '#667eea' : '#6b7280',
            fontWeight: activeTab === 'applied' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Applied ({appliedRewards.length})
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'failed' ? '3px solid #667eea' : '3px solid transparent',
            color: activeTab === 'failed' ? '#667eea' : '#6b7280',
            fontWeight: activeTab === 'failed' ? 'bold' : 'normal',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Failed ({failedRewards.length})
        </button>
      </div>

      {/* Rewards Table */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        {currentRewards.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No {activeTab} rewards
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>User</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Date</th>
                  {activeTab === 'failed' && (
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Error</th>
                  )}
                  {activeTab === 'pending' && (
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Action</th>
                  )}
                  {activeTab === 'failed' && (
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Action</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentRewards.map((reward) => (
                  <tr key={reward.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                      {reward.userEmail}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        background: reward.rewardType === 'credit' ? '#dbeafe' : '#fef3c7',
                        color: reward.rewardType === 'credit' ? '#1e40af' : '#92400e'
                      }}>
                        {reward.rewardType === 'credit' ? 'Credit' : 'Free Month'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: 'bold' }}>
                      ${((reward.amount || 0) / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                      {reward.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    {activeTab === 'failed' && (
                      <td style={{ padding: '12px', fontSize: '12px', color: '#ef4444', maxWidth: '200px' }}>
                        {reward.error || 'Unknown error'}
                      </td>
                    )}
                    {activeTab === 'pending' && (
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleProcessReward(reward.id)}
                          disabled={processing === reward.id}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: processing === reward.id ? 'not-allowed' : 'pointer',
                            opacity: processing === reward.id ? 0.6 : 1
                          }}
                        >
                          {processing === reward.id ? 'Processing...' : 'Process'}
                        </button>
                      </td>
                    )}
                    {activeTab === 'failed' && (
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleRetryFailed(reward.id)}
                          disabled={processing === reward.id}
                          style={{
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: processing === reward.id ? 'not-allowed' : 'pointer',
                            opacity: processing === reward.id ? 0.6 : 1
                          }}
                        >
                          {processing === reward.id ? 'Retrying...' : 'Retry'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
