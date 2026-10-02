"use client";
import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Save,
  Eye,
  TrendingUp,
  PlusCircle,
  Sparkles,
  LogOut,
  User,
  CheckCircle2,
  X,
  Compass,
  FileText,
  Bookmark,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { UserProfile } from "@/lib/auth";
import { useAIAssistant } from "@/components/ai/AIAssistantContext";
import { calculateUserProgress } from "@/lib/userActivity";

export type DashTab = "overview" | "my-books" | "drafts" | "reading" | "analytics";

interface DashboardSidebarProps {
  currentUser: UserProfile;
  activeTab: DashTab;
  onTabChange: (tab: DashTab) => void;
  publishedCount: number;
  draftsCount: number;
  completedChaptersCount?: number;
  readingCount?: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar({
  currentUser,
  activeTab,
  onTabChange,
  publishedCount,
  draftsCount,
  completedChaptersCount = 0,
  readingCount = 0,
  isOpenMobile,
  onCloseMobile,
  onLogout,
}: DashboardSidebarProps) {
  const { openAssistant } = useAIAssistant();

  const navItems: {
    id: DashTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    description: string;
  }[] = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Metrics & quick actions",
    },
    {
      id: "my-books",
      label: "My Books",
      icon: BookOpen,
      badge: publishedCount,
      description: "Published technical guides",
    },
    {
      id: "drafts",
      label: "Draft Handbooks",
      icon: Save,
      badge: draftsCount,
      description: "Unpublished notes & drafts",
    },
    {
      id: "reading",
      label: "Reading List",
      icon: Eye,
      badge: readingCount,
      description: "History & saved bookmarks",
    },
    {
      id: "analytics",
      label: "Audience Analytics",
      icon: TrendingUp,
      description: "Reader metrics & ratings",
    },
  ];

  const handleNavClick = (tab: DashTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const handleOpenAi = () => {
    openAssistant({ type: "general" });
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72
          lg:static lg:inset-auto lg:z-auto lg:w-full lg:h-screen lg:sticky lg:top-0
          bg-[#0a0c16] border-r border-white/10 backdrop-blur-2xl
          flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isOpenMobile ? "translate-x-0 shadow-2xl shadow-violet-950/50" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Top: Logo & User Card */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6" style={{ scrollbarWidth: "none" }}>
          {/* Header & Logo */}
          <div className="flex items-center justify-between pb-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0a0c16] rounded-[11px] flex items-center justify-center">
                  <BookOpen size={16} className="text-violet-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-base leading-none">
                  <span className="text-white">Sikho</span>
                  <span className="gradient-text">Sikhao</span>
                </span>
                <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5 font-semibold">
                  Dashboard
                </span>
              </div>
            </Link>

            {/* Mobile close */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* User Profile Card — 100% Real, Never Anonymous */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent border border-violet-500/20 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {currentUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-11 h-11 rounded-xl object-cover border border-violet-500/40 shadow-md"
                  />
                ) : (
                  <div className="w-11 h-11 flex-shrink-0 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {/* Active online pulse */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#0a0c16] shadow-sm animate-pulse" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h3 className="text-xs font-bold text-white font-heading truncate">
                    {currentUser.name}
                  </h3>
                  <span
                    className="flex-shrink-0 text-cyan-400"
                    title="Verified Creator & Reader Account"
                  >
                    <CheckCircle2 size={12} />
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  @{currentUser.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-md font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {currentUser.role === "ADMIN" ? "Admin" : "Creator & Reader"}
                  </span>
                </div>
              </div>
            </div>

            {/* User Bio snippet */}
            {currentUser.bio && (
              <p className="text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.06] line-clamp-2 leading-relaxed">
                {currentUser.bio}
              </p>
            )}
          </div>

          {/* Quick Create Action */}
          <Link
            href="/create"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <PlusCircle size={15} />
            <span>Draft New Book / Notes</span>
          </Link>

          {/* Navigation Section */}
          <div className="space-y-1">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Menu & Workspaces
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                    isActive
                      ? "bg-violet-600/20 text-violet-200 border border-violet-500/30 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      size={16}
                      className={`flex-shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <div className="truncate">
                      <div className="text-xs">{item.label}</div>
                    </div>
                  </div>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-violet-500/40 text-violet-200"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight
                      size={13}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                        isActive ? "opacity-100 text-violet-400" : "text-slate-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* AI Companion Widget */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-900/30 via-cyan-900/20 to-transparent border border-cyan-500/20 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Sparkles size={14} className="text-cyan-400 animate-spin [animation-duration:6s]" />
                <span>SikhoAI Assistant</span>
              </div>
              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-semibold border border-cyan-500/30">
                Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mb-2.5">
              Ask anything, summarize PDF notes, or generate quizzes.
            </p>
            <button
              type="button"
              onClick={handleOpenAi}
              className="w-full py-1.5 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Launch SikhoAI</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {/* Publishing & Reading Progress Tracker — 100% Dynamic */}
          {(() => {
            const { progressPercent } = calculateUserProgress(
              publishedCount,
              draftsCount,
              completedChaptersCount
            );
            return (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Activity Level</span>
                  <span className="text-violet-300 font-semibold font-mono">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(progressPercent > 0 ? 6 : 0, progressPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span>{publishedCount} Published</span>
                  <span>{completedChaptersCount} Read</span>
                  <span>{draftsCount} Drafts</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer Actions: Profile & Logout */}
        <div className="p-4 border-t border-white/[0.08] bg-[#07080e]/60 space-y-1">
          <Link
            href={`/profile/${currentUser.username}`}
            onClick={onCloseMobile}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400" />
              <span>Public Profile</span>
            </div>
            <ChevronRight size={13} className="text-slate-600" />
          </Link>

          <Link
            href="/library"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors text-xs"
          >
            <div className="flex items-center gap-2">
              <Compass size={14} className="text-slate-400" />
              <span>Explore Library</span>
            </div>
            <ChevronRight size={13} className="text-slate-600" />
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
