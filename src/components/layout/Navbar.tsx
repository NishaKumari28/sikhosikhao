"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

// Mock auth state — replace with real auth context later
const mockUser = {
  name: "Arjun Sharma",
  username: "arjun_codes",
  avatar: "AS",
  booksCount: 3,
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn] = useState(true); // Toggle to false for logged-out state
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/library", label: "Library", icon: Library },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "glass-strong shadow-lg shadow-black/20" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                <span className="gradient-text">Sikho</span>
                <span className="text-slate-300">Sikhao</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(href)
                      ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  {/* Search */}
                  <Link
                    href="/library"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all text-sm border border-white/5"
                  >
                    <Search size={15} />
                    <span className="text-xs text-slate-500">Search books...</span>
                    <kbd className="text-xs bg-white/5 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
                  </Link>

                  {/* Create Book */}
                  <Link
                    href="/create"
                    className="btn-primary text-sm px-4 py-2 hidden sm:flex"
                  >
                    <PlusCircle size={15} />
                    New Book
                  </Link>

                  {/* Notifications */}
                  <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all border border-white/5">
                    <Bell size={16} />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  </button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {mockUser.avatar}
                      </div>
                      <ChevronDown
                        size={13}
                        className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 glass-strong rounded-xl border border-white/10 shadow-xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
                        <div className="p-3 border-b border-white/5">
                          <p className="text-sm font-semibold text-slate-100">{mockUser.name}</p>
                          <p className="text-xs text-slate-500">@{mockUser.username}</p>
                          <p className="text-xs text-purple-400 mt-0.5">{mockUser.booksCount} books published</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href={`/profile/${mockUser.username}`}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
                          >
                            <User size={14} />
                            My Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
                          >
                            <LayoutDashboard size={14} />
                            Dashboard
                          </Link>
                          <Link
                            href="/create"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
                          >
                            <Sparkles size={14} />
                            Create Book
                          </Link>
                          <div className="divider my-1.5"></div>
                          <button className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full">
                            <LogOut size={14} />
                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-ghost text-sm">
                    Login
                  </Link>
                  <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">
                    Get Started
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden glass-strong border-t border-white/5 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(href)
                      ? "bg-purple-600/20 text-purple-400"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-white/5">
                <Link
                  href="/create"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  <PlusCircle size={16} />
                  New Book
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop for dropdown */}
      {profileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileOpen(false)}
        />
      )}
    </>
  );
}
