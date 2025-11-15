import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sign in with Google using Firebase Authentication
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create or update user profile in Firestore
    await getOrCreateUserProfile(user);
    
    return { user, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { user: null, error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve({ user, error: null });
    });
  });
};

/**
 * Get or create user profile in Firestore
 */
export const getOrCreateUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return { profile: { id: user.uid, ...userSnap.data() }, error: null };
    }

    // Create new user profile
    const now = new Date();
    const newProfile = {
      id: user.uid,
      email: user.email,
      full_name: user.displayName || user.email?.split('@')[0],
      avatar_url: user.photoURL,
      auth_provider: 'google',
      created_at: now,
      updated_at: now,
    };

    await setDoc(userRef, newProfile);
    return { profile: newProfile, error: null };
  } catch (error) {
    console.error('Error creating/fetching user profile:', error);
    return { profile: null, error };
  }
};

/**
 * Listen to authentication state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};