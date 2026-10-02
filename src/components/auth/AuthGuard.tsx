"use client";
// ─────────────────────────────────────────────────────────────────────────────
//  AuthGuard.tsx
//  Wrap any page/layout with this component to require authentication.
//  Redirects to /auth/login?redirect=... if the user is not signed in via
//  Firebase AND has no localStorage session.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { getStoredUser } from "@/lib/auth";
import { Loader2, BookOpen, Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect if not authenticated. Defaults to /auth/login */
  redirectTo?: string;
  /** Custom title for the authentication requirement screen */
  title?: string;
}

export default function AuthGuard({
  children,
  redirectTo = "/auth/login",
  title = "Authentication Required",
}: AuthGuardProps) {
  const { firebaseUser, loading } = useFirebaseAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const localUser = typeof window !== "undefined" ? getStoredUser() : null;
  const isAuthenticated = !!firebaseUser || !!localUser;

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`${redirectTo}${redirectParam}`);
    }
  }, [mounted, loading, isAuthenticated, router, redirectTo, pathname]);

  // Loading spinner while checking auth status
  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#07080e] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/40 animate-pulse">
          <BookOpen size={22} className="text-white" />
        </div>
        <Loader2 size={20} className="text-violet-400 animate-spin" />
        <p className="text-sm text-slate-500">Checking credentials…</p>
      </div>
    );
  }

  // Not authenticated barrier while router redirects to /auth/login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080e] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shadow-xl mb-2">
          <Lock size={26} className="text-violet-400" />
        </div>
        <h2 className="text-xl font-bold text-white font-heading">{title}</h2>
        <p className="text-sm text-slate-400 max-w-sm">
          Please log in or create an account to access books, chapters, and the community library.
        </p>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          <Loader2 size={15} className="text-violet-400 animate-spin" />
          <span>Redirecting to secure login...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
