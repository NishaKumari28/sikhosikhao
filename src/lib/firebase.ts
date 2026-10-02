// src/lib/firebase.ts
// Firebase is initialised ONCE (singleton, lazy) and reads all keys from env vars.
// If the keys are not configured the module exports null-safe stubs so the rest
// of the app keeps working — Firebase features are simply disabled.

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "";

// ── Only initialise when a real API key is present ───────────────────────────
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (apiKey && apiKey.trim() !== "") {
  try {
    app = getApps().length === 0
      ? initializeApp({
          apiKey,
          authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })
      : getApp();
    auth = getAuth(app);
  } catch (e) {
    console.warn("[SikhoSikhao] Firebase init failed — running without Google Sign-in:", e);
    app  = null;
    auth = null;
  }
} else {
  // Keys not configured — Firebase disabled, localStorage auth still works
  if (typeof window !== "undefined") {
    console.info("[SikhoSikhao] Firebase env vars not set. Google Sign-in is disabled. Add them to .env.local to enable it.");
  }
}

export { app, auth };
export const isFirebaseConfigured = !!auth;
export default app;
