"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Menu,
  X,
  Bell,
  Search,
  PlusCircle,
  User,
  LogOut,
  Library,
  LayoutDashboard,
  Sparkles,
  ChevronDown,
  LogIn,
  UserPlus,
} from "lucide-react";
import { getStoredUser, clearStoredUser, UserProfile } from "@/lib/auth";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { firebaseUser, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);

    // Firebase user takes priority; fall back to localStorage
    const syncUser = () => {
      if (firebaseUser) {
        setCurrentUser({
          id:        firebaseUser.uid,
          name:      firebaseUser.displayName ?? "User",
          username:  (firebaseUser.email ?? firebaseUser.uid).split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_"),
          email:     firebaseUser.email ?? "",
          avatar:    (firebaseUser.displayName ?? "U").slice(0, 2).toUpperCase(),
          avatarUrl: firebaseUser.photoURL ?? undefined,
          role:      "USER",
          booksCount: 0,
        });
      } else {
        setCurrentUser(getStoredUser());
      }
    };

    syncUser();
    window.addEventListener("auth-change", syncUser);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-change", syncUser);
    };
  }, [firebaseUser]);

  const handleSignOut = async () => {
    await firebaseLogout();
    setCurrentUser(null);
    setProfileOpen(false);
    router.push("/auth/login");
  };

  const navLinks = [
    { href: "/library", label: "Library", icon: Library },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const isActive = (href: string) => pathname === href;

  // Don't render full navbar on pure auth pages or dashboard (dashboard has its own dedicated sidebar & topbar)
  const isSpecialLayout = pathname.startsWith("/auth/") || pathname === "/dashboard";

  if (isSpecialLayout) {
    return null;
  }

  return (
    <>
      <nav
        className={`fixed top-0 ${pathname === "/dashboard" ? "lg:left-72 left-0" : "left-0"} right-0 z-40 transition-all duration-300 ${
          isScrolled || pathname === "/dashboard"
            ? "bg-[#07080e]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40 py-2.5"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo — Hidden on desktop on dashboard since sidebar already has logo */}
            <div className={pathname === "/dashboard" ? "lg:hidden" : ""}>
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-all duration-300">
                  <div className="w-full h-full bg-[#0a0c16] rounded-[11px] flex items-center justify-center">
                    <BookOpen size={18} className="text-violet-300 group-hover:scale-110 transition-transform" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-lg tracking-tight leading-none">
                    <span className="text-white">Sikho</span>
                    <span className="gradient-text">Sikhao</span>
                  </span>
                  <span className="text-[9px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
                    Community Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
              <Link
                href="/"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  pathname === "/"
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                Home
              </Link>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive(href)
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2.5">
              {/* Quick Search */}
              <Link
                href="/library"
                className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all text-xs"
              >
                <Search size={14} className="text-slate-500" />
                <span className="text-slate-400">Search books...</span>
                <kbd className="text-[10px] bg-white/[0.06] border border-white/10 rounded px-1.5 py-0.5 text-slate-400 font-mono">
                  ⌘K
                </kbd>
              </Link>

              {/* Create Book Button — only shown when logged in */}
              {currentUser && (
                <Link
                  href="/create"
                  className="btn-primary text-xs px-4 py-2 hidden sm:inline-flex"
                >
                  <PlusCircle size={14} />
                  New Book
                </Link>
              )}

              {/* Notifications */}
              {currentUser && (
                <button
                  aria-label="Notifications"
                  className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
                >
                  <Bell size={15} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-violet-400 rounded-full animate-ping" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full" />
                </button>
              )}

              {/* Profile Menu or Log In Buttons */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] transition-all"
                  >
                    {/* Avatar: real photo for Firebase users, initials for others */}
                    <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                      {currentUser.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentUser.avatarUrl}
                          alt={currentUser.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <ChevronDown
                      size={13}
                      className={`text-slate-400 mr-1 transition-transform duration-200 ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl border border-white/10 shadow-2xl shadow-black/80 overflow-hidden z-50">
                      <div className="p-3.5 border-b border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2.5 mb-2">
                          {/* Profile photo */}
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {currentUser.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={currentUser.avatarUrl}
                                alt={currentUser.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">{currentUser.email ?? `@${currentUser.username}`}</p>
                          </div>
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] text-violet-300 font-medium">
                          <Sparkles size={10} />
                          {currentUser.booksCount ?? 0} published books
                        </div>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link
                          href={`/profile/${currentUser.username}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <User size={14} className="text-slate-400" />
                          My Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
                        >
                          <LayoutDashboard size={14} className="text-slate-400" />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-all border-t border-white/[0.06] mt-1"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/[0.06] transition-all"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-xs px-3.5 py-1.5"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-white/[0.03] border border-white/[0.08]"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden px-4 pt-3 pb-5 glass-strong border-b border-white/[0.08] mt-2 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/[0.06]"
            >
              <BookOpen size={16} className="text-violet-400" />
              Home
            </Link>
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-slate-200 hover:bg-white/[0.06]"
              >
                <Icon size={16} className="text-violet-400" />
                {label}
              </Link>
            ))}
            {currentUser ? (
              <Link
                href="/create"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full justify-center text-sm py-2.5 mt-2"
              >
                <PlusCircle size={16} />
                Create New Book
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.08]">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary justify-center text-xs py-2.5"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary justify-center text-xs py-2.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
