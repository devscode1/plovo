"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { displayName?: string | null; photoURL?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (firebaseUser: User) => {
    try {
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || null,
          photoURL: firebaseUser.photoURL || null,
          createdAt: new Date(),
        };
        await setDoc(docRef, newProfile);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Always sync the session cookie with the latest token
        const token = await firebaseUser.getIdToken(true);
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
        await fetchProfile(firebaseUser);
      } else {
        document.cookie = `__session=; path=/; max-age=0; path=/`;
        setProfile(null);
      }
      setLoading(false);
    });

    // Proactively refresh the token every 5 minutes to prevent expiry
    const refreshInterval = setInterval(async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const token = await currentUser.getIdToken(true);
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
      }
    }, 5 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(userCredential.user, { displayName });
    const token = await userCredential.user.getIdToken();
    document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Lax`;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    document.cookie = `__session=; path=/; max-age=0`;
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data: { displayName?: string | null; photoURL?: string | null }) => {
    if (!user) return;

    const updates: { displayName?: string | null; photoURL?: string | null } = {};
    if (data.displayName !== undefined) updates.displayName = data.displayName ?? null;
    if (data.photoURL !== undefined) updates.photoURL = data.photoURL ?? null;

    await firebaseUpdateProfile(user, updates);

    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { ...updates }, { merge: true });

    if (data.displayName !== undefined) {
      setProfile((prev) => prev ? { ...prev, displayName: data.displayName ?? null } : null);
    }
    if (data.photoURL !== undefined) {
      setProfile((prev) => prev ? { ...prev, photoURL: data.photoURL ?? null } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, resetPassword, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
