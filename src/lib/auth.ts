"use client";

import { auth } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Force the account selection screen every time
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    
    // If we're in a client component, redirect to dashboard
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
    
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Error signing in with Google', error);
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out', error);
    return { error };
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 