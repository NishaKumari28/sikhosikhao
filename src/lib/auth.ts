"use client";

export interface UserProfile {
  id: string | number;
  name: string;
  username: string;
  email: string;
  avatar: string;
  avatarUrl?: string;
  bio?: string;
  role: "USER" | "ADMIN";
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  booksCount?: number;
  joinedAt?: string;
  interests?: string[];
  provider?: "google" | "email";
  password?: string;
  isVerified?: boolean;
}

export const DEMO_ACCOUNTS: { [key: string]: UserProfile & { password: string; description: string } } = {
  demouser: {
    id: "demo-001",
    name: "Demo User",
    username: "demouser",
    email: "demo@sikhosikhao.app",
    password: "demo1234",
    avatar: "DU",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demouser",
    role: "USER",
    bio: "Passionate developer & creator on SikhoSikhao exploring interactive learning.",
    location: "India",
    github: "sikhosikhao",
    twitter: "sikhosikhao",
    website: "https://sikhosikhao.app",
    booksCount: 2,
    joinedAt: "January 2024",
    interests: ["Next.js", "Python", "React", "TypeScript"],
    description: "Demo Account — explore all platform features",
    provider: "email",
    isVerified: true,
  },
};

export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  {
    id: "demo-001",
    name: "Demo User",
    username: "demouser",
    email: "demo@sikhosikhao.app",
    password: "demo1234",
    avatar: "DU",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=demouser",
    role: "USER",
    bio: "Passionate developer & creator on SikhoSikhao exploring interactive learning.",
    location: "India",
    booksCount: 2,
    joinedAt: "January 2024",
    interests: ["Next.js", "Python", "React", "TypeScript"],
    provider: "email",
    isVerified: true,
  },
  {
    id: "google-arjun",
    name: "Arjun Sharma",
    username: "arjun_sharma",
    email: "arjun.sharma.dev@gmail.com",
    password: "google1234",
    avatar: "AS",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunSharma",
    role: "USER",
    bio: "Full Stack Engineer & Tech Writer. Building web apps and sharing tutorials.",
    location: "Bengaluru, India",
    booksCount: 3,
    joinedAt: "March 2024",
    interests: ["Next.js", "TypeScript", "AI & ML"],
    provider: "google",
    isVerified: true,
  },
  {
    id: "google-priya",
    name: "Priya Verma",
    username: "priya_codes",
    email: "priya.codes@gmail.com",
    password: "google1234",
    avatar: "PV",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaVerma",
    role: "USER",
    bio: "Python educator, Data Scientist and open-source enthusiast.",
    location: "New Delhi, India",
    booksCount: 1,
    joinedAt: "April 2024",
    interests: ["Python", "System Design", "DSA"],
    provider: "google",
    isVerified: true,
  },
];

const AUTH_STORAGE_KEY = "sikhosikhao_user";
const REGISTERED_USERS_KEY = "sikhosikhao_registered_users";
const OTP_STORAGE_KEY = "sikhosikhao_pending_otp";

// ─── Registered Users Registry ────────────────────────────────────────────────
export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === "undefined") return INITIAL_REGISTERED_USERS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(INITIAL_REGISTERED_USERS));
      return INITIAL_REGISTERED_USERS;
    }
    const parsed = JSON.parse(raw) as UserProfile[];
    // Ensure default demo users exist
    return parsed.length > 0 ? parsed : INITIAL_REGISTERED_USERS;
  } catch (err) {
    console.error("Error reading registered users:", err);
    return INITIAL_REGISTERED_USERS;
  }
}

export function registerOrUpdateUser(user: UserProfile): UserProfile {
  if (typeof window === "undefined") return user;
  try {
    const users = getRegisteredUsers();
    const existingIndex = users.findIndex(
      (u) =>
        u.email.toLowerCase() === user.email.toLowerCase() ||
        u.username.toLowerCase() === user.username.toLowerCase()
    );

    const mergedUser: UserProfile = {
      ...user,
      isVerified: true,
      avatarUrl:
        user.avatarUrl ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || user.name)}`,
      joinedAt: user.joinedAt || "Just now",
      role: user.role || "USER",
      booksCount: user.booksCount ?? 0,
      interests: user.interests || ["Next.js", "Python", "DSA"],
    };

    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...mergedUser };
    } else {
      users.unshift(mergedUser);
    }

    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    return mergedUser;
  } catch (err) {
    console.error("Error saving registered user:", err);
    return user;
  }
}

export function findUserByIdentifier(identifier: string): UserProfile | null {
  const users = getRegisteredUsers();
  const cleanId = identifier.trim().toLowerCase();
  return (
    users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId
    ) || null
  );
}

// ─── Current Active User Session ──────────────────────────────────────────────
export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (err) {
    console.error("Error reading stored user:", err);
    return null;
  }
}

export function setStoredUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    // Also ensure this user is preserved in registry
    registerOrUpdateUser(user);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event("auth-change"));
  } catch (err) {
    console.error("Error saving user:", err);
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event("auth-change"));
  } catch (err) {
    console.error("Error removing user:", err);
  }
}

// ─── OTP Verification Helpers ────────────────────────────────────────────────
interface StoredOtpRecord {
  email: string;
  code: string;
  expiresAt: number;
}

export function generateOtpForUser(email: string): string {
  // Generate reliable 6 digit code (e.g. 583921)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  if (typeof window !== "undefined") {
    const record: StoredOtpRecord = {
      email: email.toLowerCase(),
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    };
    try {
      sessionStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(record));
    } catch {}
  }
  return code;
}

export function verifyOtpForUser(email: string, enteredCode: string): boolean {
  if (typeof window === "undefined") return false;
  // Always accept master demo code 123456 for convenience
  if (enteredCode.trim() === "123456") return true;

  try {
    const raw = sessionStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return true; // fallback to true if session expired in dev
    const record = JSON.parse(raw) as StoredOtpRecord;
    if (record.email !== email.toLowerCase()) return false;
    if (Date.now() > record.expiresAt) return false;
    return record.code === enteredCode.trim();
  } catch {
    return true;
  }
}
