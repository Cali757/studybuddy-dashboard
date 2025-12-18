// Admin Referrals Panel - View and manage referrals
// Phase 7B: Affiliates & Referrals

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

export default function ReferralsPanel() {
  const [loading, setLoading] = useState(true);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    convertedReferrals: 0,
    pendingRewards: 0,
    totalRewardsGiven: 0
  });

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      // Get top referrers
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('referralStats.successfulReferrals', 'desc'),
        limit(10)
      );
      const usersSnapshot = await getDocs(usersQuery);
      const referrersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTopReferrers(referrersData);

      // Get recent referrals
      const referralsQuery = query(
        collection(db, 'referrals'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      const referralsSnapshot = await getDocs(referralsQuery);
      const referralsData = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentReferrals(referralsData);

      // Calculate stats
      const allReferralsQuery = query(collection(db, 'referrals'));
      const allReferralsSnapshot = await getDocs(allReferralsQuery);
      
      const convertedQuery = query(
        collection(db, 'referrals'),
        where('status', '==', 'converted')
      );
      const convertedSnapshot = await getDocs(convertedQuery);

      const rewardsQuery = query(collection(db, 'referral_rewards'));
      const rewardsSnapshot = await getDocs(rewardsQuery);
      
      let totalRewards = 0;
      let pendingCount = 0;
      rewardsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'applied') {
          totalRewards += data.amount || 0;
        } else if (data.status === 'pending') {
          pendingCount++;
        }
      });

      setStats({
        totalReferrals: allReferralsSnapshot.size,
        convertedReferrals: convertedSnapshot.size,
        pendingRewards: pendingCount,
        totalRewardsGiven: totalRewards
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading referral data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#6b7280' }}>Loading referral data...</div>;
  }

  return (
    <div>
      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Referrals</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
            {stats.totalReferrals}
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Converted</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {stats.convertedReferrals}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {stats.totalReferrals > 0 ? `${((stats.convertedReferrals / stats.totalReferrals) * 100).toFixed(1)}%` : '0%'} conversion
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Pending Rewards</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.pendingRewards}
          </div>
        </div>

        <div style={{
          background: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Rewards Given</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
            ${(stats.totalRewardsGiven / 100).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Top Referrers */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            🏆 Top Referrers
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Rank</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Code</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Converted</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Earned</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((user, idx) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {user.referralCode}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                    {user.referralStats?.totalReferrals || 0}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
                    {user.referralStats?.successfulReferrals || 0}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#667eea', fontWeight: 'bold' }}>
                    ${((user.referralStats?.totalRewardsEarned || 0) / 100).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Referrals */}
      <div style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            🕒 Recent Referrals
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Referred User</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Code Used</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReferrals.map((referral) => (
                <tr key={referral.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                    {referral.referredUserEmail}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                    {referral.referralCode}
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
      </div>
    </div>
  );
}
