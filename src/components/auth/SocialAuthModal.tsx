"use client";
import { useState, useEffect } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  Mail,
  User,
  ChevronRight,
  Plus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  setStoredUser,
  UserProfile,
  getRegisteredUsers,
  registerOrUpdateUser,
} from "@/lib/auth";
import { useRouter } from "next/navigation";

interface SocialAuthModalProps {
  provider: "google" | null;
  mode: "login" | "register";
  onClose: () => void;
}

interface GoogleAccountItem {
  email: string;
  name: string;
  avatar: string;
  avatarColor: string;
  avatarUrl?: string;
}

const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    email: "arjun.sharma.dev@gmail.com",
    name: "Arjun Sharma",
    avatar: "AS",
    avatarColor: "from-blue-500 to-cyan-400",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma",
  },
  {
    email: "priya.codes@gmail.com",
    name: "Priya Verma",
    avatar: "PV",
    avatarColor: "from-pink-500 to-rose-400",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerma",
  },
];

export default function SocialAuthModal({
  provider,
  mode,
  onClose,
}: SocialAuthModalProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<GoogleAccountItem[]>(DEFAULT_GOOGLE_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<GoogleAccountItem | null>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  // Load existing registered accounts from system
  useEffect(() => {
    if (typeof window === "undefined") return;
    const registered = getRegisteredUsers();
    const systemGoogleAccounts: GoogleAccountItem[] = registered
      .filter((u) => u.email.includes("@"))
      .map((u) => {
        const initials = u.name
          .split(" ")
          .map((n) => n[0] ?? "")
          .join("")
          .slice(0, 2)
          .toUpperCase() || "GU";
        return {
          email: u.email,
          name: u.name,
          avatar: initials,
          avatarColor: "from-violet-500 to-indigo-500",
          avatarUrl: u.avatarUrl,
        };
      });

    // Merge without duplicates
    const combined = [...DEFAULT_GOOGLE_ACCOUNTS];
    systemGoogleAccounts.forEach((sysAcc) => {
      if (!combined.some((c) => c.email.toLowerCase() === sysAcc.email.toLowerCase())) {
        combined.push(sysAcc);
      }
    });

    setAccounts(combined);
  }, []);

  if (!provider) return null;

  const googleIcon = (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );

  // Auto-fetch data and register immediately upon selection
  const handleSelectAccount = async (account: GoogleAccountItem) => {
    setSelectedAccount(account);
    setLoading(true);
    setLoadingMessage(`Authenticating ${account.name}...`);

    await new Promise((r) => setTimeout(r, 600));
    setLoadingMessage("Fetching Google profile & registering account...");

    const username = account.email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toLowerCase();
    const initials = account.avatar || account.name.slice(0, 2).toUpperCase();

    const fullProfile: UserProfile = {
      id: `google_${username}_${Date.now()}`,
      name: account.name,
      username,
      email: account.email,
      avatar: initials,
      avatarUrl:
        account.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
      role: "USER",
      bio: "Full Stack Developer & Creator on SikhoSikhao.",
      booksCount: 2,
      joinedAt: "Just now",
      interests: ["Next.js", "Python", "React", "AI & ML"],
      provider: "google",
      password: "google_oauth_verified",
      isVerified: true,
    };

    // Permanently register user into registry
    registerOrUpdateUser(fullProfile);
    // Set active session
    setStoredUser(fullProfile);

    await new Promise((r) => setTimeout(r, 600));
    setLoadingMessage("Launching your personal dashboard...");

    setTimeout(() => {
      setLoading(false);
      onClose();
      router.push("/dashboard");
    }, 400);
  };

  const handleAddNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newEmail.trim() || !newEmail.includes("@")) {
      setError("Please enter a valid Google email address.");
      return;
    }

    const derivedName = newName.trim()
      ? newName.trim()
      : newEmail
          .split("@")[0]
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

    const initials = derivedName
      .split(" ")
      .map((n) => n[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const customItem: GoogleAccountItem = {
      email: newEmail.trim().toLowerCase(),
      name: derivedName,
      avatar: initials,
      avatarColor: "from-cyan-500 to-blue-600",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(derivedName)}`,
    };

    await handleSelectAccount(customItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[440px] rounded-3xl bg-[#f8fafc] text-gray-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200">
        {/* Close button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}

        {/* Loading overlay when account is selected */}
        {loading && (
          <div className="px-8 py-16 flex flex-col items-center text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-5 border border-gray-100">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 font-heading">
              {loadingMessage}
            </h3>
            {selectedAccount && (
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{selectedAccount.email}</span>
              </p>
            )}
            <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 animate-pulse rounded-full" />
            </div>
          </div>
        )}

        {/* Main account selection screen */}
        {!loading && !showAddAccount && (
          <div>
            {/* Google Header */}
            <div className="px-8 pt-8 pb-5 text-center border-b border-gray-100">
              <div className="flex justify-center mb-3">{googleIcon}</div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Choose an account on this system to continue to <span className="font-semibold text-gray-800">SikhoSikhao</span>
              </p>
            </div>

            {/* List of system accounts */}
            <div className="px-4 py-3 max-h-72 overflow-y-auto space-y-1">
              {accounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectAccount(acc)}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-gray-100/90 active:bg-gray-200/80 transition-all text-left group cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${acc.avatarColor} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}
                  >
                    {acc.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      <CheckCircle2 size={12} className="text-blue-500" />
                    </p>
                    <p className="text-xs text-gray-500 truncate">{acc.email}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-700 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              {/* Add another Google account option */}
              <button
                type="button"
                onClick={() => setShowAddAccount(true)}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl hover:bg-gray-100 transition-all text-left cursor-pointer border border-dashed border-gray-300 hover:border-blue-400 mt-2"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600">
                  <Plus size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Use another Google account</p>
                  <p className="text-[11px] text-gray-500">Sign in with a different Gmail address</p>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Google privacy footer */}
            <div className="px-8 py-3.5 border-t border-gray-100 bg-gray-50/70 text-center">
              <p className="text-[11px] text-gray-400 leading-normal">
                To continue, Google will share your verified name, email address, and avatar with SikhoSikhao.
              </p>
            </div>
          </div>
        )}

        {/* Add custom account screen */}
        {!loading && showAddAccount && (
          <form onSubmit={handleAddNewAccount} className="p-7">
            <div className="text-center mb-5">
              <div className="flex justify-center mb-2">{googleIcon}</div>
              <h2 className="text-lg font-bold text-gray-900">
                Sign in with another Google Account
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your Google account details to register instantly
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3.5 mb-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder="your.email@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Your Full Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowAddAccount(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                ← Back to accounts
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue & Register</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
