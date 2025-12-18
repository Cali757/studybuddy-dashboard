import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () =>
  signInWithPopup(auth, googleProvider);

export const signUpWithEmail = (
  email: string,
  password: string
) =>
  createUserWithEmailAndPassword(auth, email, password);

export const signInWithEmail = (
  email: string,
  password: string
) =>
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const isAdmin = async (user: any) => {
  // Placeholder admin check - always returns false for now
  return false;
};
