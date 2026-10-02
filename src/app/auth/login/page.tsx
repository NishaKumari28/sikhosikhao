"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import AuthBanner from "@/components/auth/AuthBanner";
import ForgotPasswordModal from "@/components/auth/ForgotPasswordModal";
import OtpVerificationModal from "@/components/auth/OtpVerificationModal";
import {
  DEMO_ACCOUNTS,
  setStoredUser,
  UserProfile,
  findUserByIdentifier,
  generateOtpForUser,
} from "@/lib/auth";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "", rememberMe: true });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // OTP 2-Factor state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [pendingLoginUser, setPendingLoginUser] = useState<UserProfile | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Firebase auth
  const { firebaseUser } = useFirebaseAuth();

  // Redirect to target destination or dashboard if Firebase user signs in
  useEffect(() => {
    if (firebaseUser) {
      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      router.push(redirect || "/dashboard");
    }
  }, [firebaseUser, router]);

  // Quick fill demo account
  const handleQuickFill = () => {
    const account = DEMO_ACCOUNTS.demouser;
    setForm({
      identifier: account.email,
      password: account.password,
      rememberMe: true,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.identifier.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    // Lookup user in registered users registry or demo accounts
    const existing = findUserByIdentifier(form.identifier);

    let loggedInUser: UserProfile;

    if (existing) {
      loggedInUser = existing;
    } else {
      // Create complete, non-anonymous profile for new credentials
      const extractedUsername = form.identifier.includes("@")
        ? form.identifier.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_")
        : form.identifier;
      const prettyName = extractedUsername.charAt(0).toUpperCase() + extractedUsername.slice(1);
      loggedInUser = {
        id: `user_${Date.now()}`,
        name: prettyName,
        username: extractedUsername.toLowerCase(),
        email: form.identifier.includes("@") ? form.identifier : `${extractedUsername}@sikhosikhao.app`,
        avatar: extractedUsername.slice(0, 2).toUpperCase(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(extractedUsername)}`,
        role: "USER",
        bio: "Passionate developer & creator on SikhoSikhao.",
        booksCount: 0,
        joinedAt: "Just now",
        interests: ["Next.js", "Python", "DSA"],
        isVerified: true,
      };
    }

    // Generate 6-digit OTP code for this user's email
    const otp = generateOtpForUser(loggedInUser.email);
    setPendingLoginUser(loggedInUser);
    setGeneratedOtp(otp);
    setLoading(false);

    // Trigger OTP Verification Modal
    setIsOtpModalOpen(true);
  };

  const handleOtpSuccess = () => {
    if (!pendingLoginUser) return;
    setStoredUser(pendingLoginUser);
    setIsOtpModalOpen(false);
    setSuccessMsg(`Identity verified successfully! Welcome back, ${pendingLoginUser.name}. Redirecting to dashboard...`);

    setTimeout(() => {
      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      router.push(redirect || "/dashboard");
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#07080e] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="orb w-96 h-96 bg-violet-900/25 -top-24 -left-24 pointer-events-none" />
      <div className="orb w-80 h-80 bg-cyan-900/20 bottom-0 right-0 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Main Dual Grid Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        {/* Left Side: Rich Visual Banner */}
        <div className="lg:col-span-6 flex">
          <AuthBanner mode="login" />
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 xl:p-10 shadow-2xl shadow-black/80">
            {/* Brand Logo & Heading */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#0a0c16] rounded-[11px] flex items-center justify-center">
                    <BookOpen size={18} className="text-violet-300" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-lg leading-none">
                    <span className="text-white">Sikho</span>
                    <span className="gradient-text">Sikhao</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">
                    Account Portal
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 text-white shadow-sm">
                  Log In
                </span>
                <Link
                  href="/auth/register"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1.5">
                Welcome back! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Log in to resume your reading progress, edit books, and view chapter notes.
              </p>
            </div>

            {/* Quick Demo Fill Pills */}
            <div className="mb-6 p-3 rounded-2xl bg-violet-500/5 border border-violet-500/15">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-violet-400" />
                  1-Click Instant Demo Login
                </span>
                <span className="text-[10px] text-slate-500">Click to autofill</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] hover:bg-violet-600/15 border border-white/[0.08] hover:border-violet-500/30 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                    DU
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-slate-200 group-hover:text-violet-300">🚀 Demo User</div>
                    <div className="text-[10px] text-slate-500">demo@sikhosikhao.app · demo1234</div>
                  </div>
                </div>
                <div className="text-[10px] text-violet-400 font-medium group-hover:text-violet-300">Autofill →</div>
              </button>
            </div>





            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 mb-4 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Email or Username</span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. demo@sikhosikhao.app</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    placeholder="Enter email or username"
                    value={form.identifier}
                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                    className="input-field pl-11 pr-4"
                  />
                  
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember me toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-400">Remember me for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !!successMsg}
                id="login-submit-btn"
                className="btn-primary w-full justify-center py-3 text-sm font-semibold mt-2 shadow-lg shadow-violet-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>Log In to Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Switch */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-5 border-t border-white/[0.08]">
              Don't have an account on SikhoSikhao?{" "}
              <Link
                href="/auth/register"
                className="text-violet-400 hover:text-violet-300 font-semibold underline-offset-4 hover:underline"
              >
                Create a Free Account
              </Link>
            </p>
          </div>

          {/* Quick Back to Home */}
          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
            >
              ← Back to SikhoSikhao Home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={form.identifier.includes("@") ? form.identifier : ""}
      />

      {/* 2-Factor OTP Verification Modal */}
      {pendingLoginUser && (
        <OtpVerificationModal
          isOpen={isOtpModalOpen}
          email={pendingLoginUser.email}
          userName={pendingLoginUser.name}
          initialOtp={generatedOtp}
          onSuccess={handleOtpSuccess}
          onClose={() => setIsOtpModalOpen(false)}
        />
      )}
    </div>
  );
}
