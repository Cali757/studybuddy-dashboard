import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface UserRole {
  email: string;
  role: 'admin' | 'user';
  createdAt?: any;
  lastActive?: any;
  hasOnboarded?: boolean;
}

/**
 * Check if the current user is an admin
 * @param user - Firebase Auth user
 * @returns Promise<boolean> - true if user is admin, false otherwise
 */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data() as UserRole;
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user role from Firestore
 * @param uid - User ID
 * @returns Promise<UserRole | null> - User role data or null
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

/**
 * Wait for auth state to be ready
 * @returns Promise<User | null> - Current user or null
 */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
