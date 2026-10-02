"use client";
import { useState, useMemo, useEffect } from "react";
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
  User,
  AtSign,
  CheckCircle2,
  Check,
  ShieldCheck,
  Zap,
  Tags,
} from "lucide-react";
import AuthBanner from "@/components/auth/AuthBanner";
import { setStoredUser, UserProfile } from "@/lib/auth";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

const AVAILABLE_TOPICS = [
  "Next.js",
  "Python",
  "React",
  "Java",
  "DSA",
  "AI & ML",
  "Node.js",
  "TypeScript",
  "System Design",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Firebase auth
  const { firebaseUser } = useFirebaseAuth();

  // Redirect to target destination or dashboard if Firebase user signs in
  useEffect(() => {
    if (firebaseUser) {
      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      router.push(redirect || "/dashboard");
    }
  }, [firebaseUser, router]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    agreeTerms: true,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Next.js",
    "Python",
    "DSA",
  ]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { score: 0, label: "None", color: "bg-slate-700" };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
    if (score === 2 || score === 3)
      return { score: 2, label: "Medium", color: "bg-amber-500", text: "text-amber-400" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-400" };
  }, [form.password]);

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.username.trim() || form.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!form.agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));

    const cleanUsername = form.username.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const initials = form.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newUser: UserProfile = {
      id: Date.now().toString(),
      name: form.name.trim(),
      username: cleanUsername,
      email: form.email.toLowerCase().trim(),
      avatar: initials || "SS",
      role: "USER",
      bio: `Tech enthusiast & creator passionate about ${selectedInterests.slice(0, 2).join(" & ") || "learning"}.`,
      booksCount: 0,
      joinedAt: "Just now",
      interests: selectedInterests,
    };

    setStoredUser(newUser);
    setLoading(false);
    setSuccessMsg(`Welcome to SikhoSikhao, ${newUser.name}! Your account is ready.`);

    setTimeout(() => {
      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      router.push(redirect || "/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#07080e] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="orb w-96 h-96 bg-violet-900/25 -top-24 -right-24 pointer-events-none" />
      <div className="orb w-80 h-80 bg-cyan-900/20 bottom-0 left-0 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Dual Layout Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch relative z-10">
        {/* Left Side: Rich Visual Showcase */}
        <div className="lg:col-span-6 flex">
          <AuthBanner mode="register" />
        </div>

        {/* Right Side: Registration Card */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 xl:p-10 shadow-2xl shadow-black/80">
            {/* Header / Brand & Switcher */}
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
                <Link
                  href="/auth/login"
                  className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-600 text-white shadow-sm">
                  Register
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1.5">
                Create Free Account 🚀
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Start reading guides, taking interactive notes, or drafting your first tech handbook.
              </p>
            </div>

            {/* Privilege Callout */}
            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-5">
              <Sparkles size={16} className="text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Dual Creator & Reader Privileges
                </p>
                <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                  Every account can both read and publish books, create chapters, and generate AI notes.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 mb-4 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle size={15} className="flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 mb-4 text-xs text-emerald-300 animate-in fade-in">
                <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      placeholder="e.g. Arjun Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input-field pl-11 pr-4"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Username</span>
                    <span className="text-[10px] text-violet-400 font-mono">
                      @{form.username || "username"}
                    </span>
                  </label>
                  <div className="relative">
                    <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="register-username"
                      type="text"
                      required
                      placeholder="arjun_codes"
                      value={form.username}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                        })
                      }
                      className="input-field pl-11 pr-4"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="arjun@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field pl-11 pr-4"
                  />
                </div>
              </div>

              {/* Password & Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Create Password</label>
                  {form.password && (
                    <span className={`text-[10px] font-semibold ${passwordStrength.text}`}>
                      Strength: {passwordStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min 8 characters (letters & numbers)"
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

                {/* Strength Meter Bar */}
                {form.password && (
                  <div className="grid grid-cols-3 gap-1.5 mt-2">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        passwordStrength.score >= 1 ? passwordStrength.color : "bg-white/10"
                      }`}
                    />
                    <div
                      className={`h-1 rounded-full transition-all ${
                        passwordStrength.score >= 2 ? passwordStrength.color : "bg-white/10"
                      }`}
                    />
                    <div
                      className={`h-1 rounded-full transition-all ${
                        passwordStrength.score >= 3 ? passwordStrength.color : "bg-white/10"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Topics / Interests Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tags size={13} className="text-violet-400" />
                    Topics you want to learn & write about
                  </span>
                  <span className="text-[10px] text-slate-500">Pick any</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TOPICS.map((topic) => {
                    const isSelected = selectedInterests.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleInterest(topic)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                          isSelected
                            ? "bg-violet-600/25 border-violet-500/40 text-violet-200 shadow-sm"
                            : "bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {isSelected && <Check size={11} className="text-violet-400" />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-600 focus:ring-violet-500 mt-0.5"
                  />
                  <span className="text-xs text-slate-400 leading-normal">
                    I agree to the{" "}
                    <span className="text-violet-400 hover:underline">Terms of Service</span> and{" "}
                    <span className="text-violet-400 hover:underline">Community Guidelines</span>.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !!successMsg}
                id="register-submit-btn"
                className="btn-primary w-full justify-center py-3 text-sm font-semibold mt-2 shadow-lg shadow-violet-600/30"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating your account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <p className="text-center text-xs text-slate-400 mt-6 pt-5 border-t border-white/[0.08]">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-violet-400 hover:text-violet-300 font-semibold underline-offset-4 hover:underline"
              >
                Log in here
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
    </div>
  );
}
