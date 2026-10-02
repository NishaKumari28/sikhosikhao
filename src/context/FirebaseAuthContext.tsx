"use client";
// ─────────────────────────────────────────────────────────────────────────────
//  FirebaseAuthContext.tsx
//  Provides: loginWithGoogle(), logout(), useFirebaseAuth()
//  Safe to use even when Firebase is NOT configured — all methods no-op
//  and firebaseUser stays null, falling back to localStorage auth.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createContext, useContext, useEffect, useState,
  useCallback, ReactNode,
} from "react";
import {
  User, onAuthStateChanged, signInWithPopup,
  signOut, GoogleAuthProvider,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import { setStoredUser, clearStoredUser, UserProfile } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FirebaseAuthContextType {
  firebaseUser:    User | null | undefined; // undefined = still loading
  userProfile:     UserProfile | null | undefined;
  loading:         boolean;
  firebaseEnabled: boolean;               // false when keys are not set
  loginWithGoogle: () => Promise<void>;
  logout:          () => Promise<void>;
  authError:       string;
  clearError:      () => void;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

// ─── Error mapper ─────────────────────────────────────────────────────────────
function getFriendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/popup-closed-by-user":
      "Sign-in cancelled — the popup was closed. Please try again.",
    "auth/popup-blocked":
      "Your browser blocked the sign-in popup. Please allow popups for this site.",
    "auth/network-request-failed":
      "Network error. Please check your connection and try again.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/account-exists-with-different-credential":
      "An account with this email already exists using a different sign-in method.",
    "auth/cancelled-popup-request":
      "Another sign-in popup is already open. Please close it and try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/invalid-api-key":
      "Firebase is not configured yet. Add your Firebase API keys to .env.local to enable Google Sign-in.",
  };
  return map[code] ?? "An unexpected error occurred. Please try again.";
}

// ─── Firebase user → local UserProfile ───────────────────────────────────────
function toUserProfile(fbUser: User): UserProfile {
  const nameParts = (fbUser.displayName ?? "User").split(" ");
  const initials  = nameParts.map((n) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
  return {
    id:         fbUser.uid,
    name:       fbUser.displayName ?? "User",
    username:   (fbUser.email ?? fbUser.uid).split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_"),
    email:      fbUser.email ?? "",
    avatar:     initials,
    avatarUrl:  fbUser.photoURL ?? undefined,
    role:       "USER",
    bio:        "Signed in via Google on SikhoSikhao.",
    booksCount: 0,
    joinedAt:   "Just now",
    interests:  ["Programming", "Tech"],
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(
    isFirebaseConfigured ? undefined : null  // skip "loading" state if Firebase is off
  );
  const [loading,   setLoading]   = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState("");

  const userProfile = firebaseUser ? toUserProfile(firebaseUser) : (firebaseUser as null | undefined);

  // Subscribe to auth state only when Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setLoading(false);
      if (user) setStoredUser(toUserProfile(user));
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setAuthError(
        "Firebase is not configured. Add your Firebase API keys to .env.local to enable Google Sign-in."
      );
      return;
    }
    setAuthError("");
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    try {
      const result = await signInWithPopup(auth, provider);
      setStoredUser(toUserProfile(result.user));
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setAuthError(getFriendlyError(code));
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError("");
    try {
      if (isFirebaseConfigured && auth) await signOut(auth);
      clearStoredUser();
      setFirebaseUser(null);
    } catch {
      setAuthError("Failed to sign out. Please try again.");
    }
  }, []);

  return (
    <FirebaseAuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        firebaseEnabled: isFirebaseConfigured,
        loginWithGoogle,
        logout,
        authError,
        clearError: () => setAuthError(""),
      }}
    >
      {children}
    </FirebaseAuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useFirebaseAuth(): FirebaseAuthContextType {
  const ctx = useContext(FirebaseAuthContext);
  if (!ctx) throw new Error("useFirebaseAuth must be used inside <FirebaseAuthProvider>");
  return ctx;
}
