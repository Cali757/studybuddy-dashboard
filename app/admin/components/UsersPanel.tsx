'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: any;
  lastActive?: any;
  subscriptionStatus?: string;
}

export default function UsersPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const usersData: User[] = [];
      snapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        } as User);
      });
      
      setUsers(usersData);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: 'admin' });
      alert('User promoted to admin successfully');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Error promoting user:', err);
      alert('Failed to promote user: ' + err.message);
    }
  };

  const demoteFromAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to demote this admin to user?')) {
      return;
    }
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: 'user' });
      alert('Admin demoted to user successfully');
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.error('Error demoting user:', err);
      alert('Failed to demote user: ' + err.message);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firestore Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString();
      }
      // Handle regular Date
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      // Handle timestamp number
      if (typeof timestamp === 'number') {
        return new Date(timestamp).toLocaleDateString();
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading users...</div>
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Users ({users.length})</h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-300 font-medium">Email</th>
              <th className="text-left p-3 text-gray-300 font-medium">Role</th>
              <th className="text-left p-3 text-gray-300 font-medium">Signup Date</th>
              <th className="text-left p-3 text-gray-300 font-medium">Last Active</th>
              <th className="text-left p-3 text-gray-300 font-medium">Subscription</th>
              <th className="text-left p-3 text-gray-300 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="p-3 text-gray-200">{user.email}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'bg-gray-600/20 text-gray-300'
                    }`}
                  >
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="p-3 text-gray-400">{formatDate(user.createdAt)}</td>
                <td className="p-3 text-gray-400">{formatDate(user.lastActive)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.subscriptionStatus === 'active'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-gray-600/20 text-gray-400'
                    }`}
                  >
                    {user.subscriptionStatus || 'none'}
                  </span>
                </td>
                <td className="p-3">
                  {user.role === 'admin' ? (
                    <button
                      onClick={() => demoteFromAdmin(user.id)}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded transition-colors"
                    >
                      Demote
                    </button>
                  ) : (
                    <button
                      onClick={() => promoteToAdmin(user.id)}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No users found
        </div>
      )}
    </div>
  );
}
