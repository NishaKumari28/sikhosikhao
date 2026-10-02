"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BookCard from "@/components/book/BookCard";
import DashboardSidebar, { DashTab } from "@/components/dashboard/DashboardSidebar";
import { Book } from "@/lib/mockData";
import {
  getAllBooks,
  getBookById,
  getStoredDrafts,
  deleteBookDraft,
  BookDraft,
} from "@/lib/bookStore";
import { getStoredUser, clearStoredUser, UserProfile } from "@/lib/auth";
import { getUserActivity, UserActivityData } from "@/lib/userActivity";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  BookOpen,
  TrendingUp,
  Users,
  Star,
  PlusCircle,
  LayoutDashboard,
  Edit3,
  Eye,
  Trash2,
  Clock,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Save,
  Menu,
  Library,
} from "lucide-react";

export function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize with real stored user or clean default to avoid flashing demo user
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (typeof window !== "undefined") {
      const stored = getStoredUser();
      if (stored) return stored;
    }
    return {
      id: "guest",
      name: "Learner",
      username: "user",
      email: "",
      avatar: "SS",
      role: "USER",
      booksCount: 0,
      joinedAt: "Just now",
      interests: [],
    };
  });

  const [allPublishedBooks, setAllPublishedBooks] = useState<Book[]>([]);
  const [draftsList, setDraftsList] = useState<BookDraft[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivityData>({
    readBookIds: [],
    completedChapterIds: [],
    bookmarks: [],
  });

  const { firebaseUser, logout: firebaseLogout } = useFirebaseAuth();

  useEffect(() => {
    // 1. Sync User Session
    let activeUsername = currentUser.username;

    if (firebaseUser) {
      const username = (firebaseUser.email ?? firebaseUser.uid).split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
      activeUsername = username;
      setCurrentUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? "User",
        username: username,
        email: firebaseUser.email ?? "",
        avatar: (firebaseUser.displayName ?? "U").slice(0, 2).toUpperCase(),
        avatarUrl: firebaseUser.photoURL ?? undefined,
        role: "USER",
        booksCount: 0,
        joinedAt: "Just now",
        interests: [],
      });
    } else {
      const stored = getStoredUser();
      if (stored) {
        activeUsername = stored.username;
        setCurrentUser(stored);
      }
    }

    // 2. Load User Specific Data
    const loadData = () => {
      const all = getAllBooks();
      setAllPublishedBooks(all);
      const user = getStoredUser();
      const currentUName = user?.username || activeUsername;
      setDraftsList(getStoredDrafts(currentUName));
      setUserActivity(getUserActivity(currentUName));
    };

    loadData();
    window.addEventListener("books-updated", loadData);
    window.addEventListener("user-activity-updated", loadData);
    window.addEventListener("auth-change", () => {
      const u = getStoredUser();
      if (u) {
        setCurrentUser(u);
        setDraftsList(getStoredDrafts(u.username));
        setUserActivity(getUserActivity(u.username));
      }
    });

    return () => {
      window.removeEventListener("books-updated", loadData);
      window.removeEventListener("user-activity-updated", loadData);
    };
  }, [firebaseUser]);

  // Dynamic user-owned books: filtered exclusively for the logged-in user
  const myPublishedBooks = allPublishedBooks.filter(
    (b) =>
      (currentUser.username && b.authorUsername === currentUser.username) ||
      (currentUser.id && (b as unknown as { authorId?: string }).authorId === String(currentUser.id)) ||
      (currentUser.name && b.author?.toLowerCase() === currentUser.name?.toLowerCase())
  );

  // Dynamic user reading books
  const readingBooks = userActivity.readBookIds
    .map((id) => getBookById(id))
    .filter(Boolean) as Book[];

  // Dynamic statistics: zero hardcoded values
  const totalReaders = myPublishedBooks.reduce((sum, b) => sum + (b.readersCount || 0), 0);
  const avgRating =
    myPublishedBooks.length > 0
      ? (myPublishedBooks.reduce((sum, b) => sum + (b.rating || 5), 0) / myPublishedBooks.length).toFixed(1)
      : "—";

  const handleDeleteDraft = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this draft?")) {
      deleteBookDraft(id);
      setDraftsList(getStoredDrafts(currentUser.username));
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseLogout();
    } catch {}
    clearStoredUser();
    router.push("/auth/login");
  };

  const tabs: { id: DashTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "my-books",
      label: "My Books",
      icon: BookOpen,
      badge: myPublishedBooks.length,
    },
    {
      id: "drafts",
      label: "Drafts",
      icon: Save,
      badge: draftsList.length,
    },
    {
      id: "reading",
      label: "Reading List",
      icon: Eye,
      badge: readingBooks.length,
    },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar wrapper — reserves space on desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <DashboardSidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          publishedCount={myPublishedBooks.length}
          draftsCount={draftsList.length}
          completedChaptersCount={userActivity.completedChapterIds.length}
          readingCount={readingBooks.length}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile-only sidebar */}
      <div className="lg:hidden">
        <DashboardSidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          publishedCount={myPublishedBooks.length}
          draftsCount={draftsList.length}
          completedChaptersCount={userActivity.completedChapterIds.length}
          readingCount={readingBooks.length}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-[#07080e]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white cursor-pointer transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <Link href="/" className="lg:hidden flex items-center gap-2 group">
              <div className="w-7 h-7 flex-shrink-0 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0a0c16] rounded-[7px] flex items-center justify-center">
                  <BookOpen size={13} className="text-violet-300" />
                </div>
              </div>
              <span className="font-heading font-bold text-sm text-white">
                Sikho<span className="gradient-text">Sikhao</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-xs">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400 font-medium">Dashboard</span>
              <span className="text-slate-600">/</span>
              <span className="text-violet-300 font-semibold capitalize">
                {activeTab.replace("-", " ")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/library"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-all"
            >
              <Library size={13} />
              <span>Library</span>
            </Link>

            <Link
              href="/create"
              className="btn-primary text-xs px-3.5 py-1.5 shadow-sm"
            >
              <PlusCircle size={14} />
              <span className="hidden sm:inline">New Book</span>
            </Link>

            <div className="h-5 w-[1px] bg-white/10 hidden sm:block mx-1" />

            <div className="flex items-center gap-2 pl-1">
              <span className="text-xs text-slate-300 font-semibold truncate max-w-[120px] hidden md:inline">
                {currentUser.name}
              </span>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0">
                {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
          {/* User Profile banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 p-6 glass-strong rounded-3xl border border-white/10 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-violet-600/30 flex-shrink-0">
              {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white font-heading">{currentUser.name}</h1>
                <span className="badge badge-purple">Creator + Reader</span>
                {currentUser.role === "ADMIN" && <span className="badge badge-green">Admin</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                @{currentUser.username} · Joined {currentUser.joinedAt || "Community Member"}
              </p>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                {currentUser.bio || "Sharing technical guides and interactive code notes on SikhoSikhao."}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link href="/create" className="btn-primary text-xs px-4 py-2">
                <PlusCircle size={14} />
                Create Book
              </Link>
              <Link
                href={`/profile/${currentUser.username}`}
                className="btn-secondary text-xs px-3.5 py-2"
              >
                <Eye size={14} />
                Public Profile
              </Link>
            </div>
          </div>

          {/* Real Dynamic Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Books Published",
                value: myPublishedBooks.length,
                icon: BookOpen,
                color: "text-violet-400",
                bg: "bg-violet-500/10 border-violet-500/20",
              },
              {
                label: "Saved Drafts",
                value: draftsList.length,
                icon: Save,
                color: "text-cyan-400",
                bg: "bg-cyan-500/10 border-cyan-500/20",
              },
              {
                label: "Total Readers",
                value: totalReaders > 0 ? totalReaders.toLocaleString() : "0",
                icon: Users,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10 border-emerald-500/20",
              },
              {
                label: "Avg Rating",
                value: avgRating !== "—" ? `★ ${avgRating}` : "★ —",
                icon: Star,
                color: "text-amber-400",
                bg: "bg-amber-500/10 border-amber-500/20",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`glass-strong rounded-2xl border p-4.5 ${bg}`}>
                <div className={`flex items-center gap-2 mb-1 ${color}`}>
                  <Icon size={16} />
                  <span className="text-xl font-bold text-white font-heading">{value}</span>
                </div>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 mb-6 border-b border-white/[0.08] overflow-x-auto pb-1">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                  activeTab === id
                    ? "border-violet-500 text-violet-300"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                {typeof badge === "number" && badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      activeTab === id
                        ? "bg-violet-500/30 text-violet-200"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* 1. Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Creator Actions */}
              <div>
                <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
                  Creator Actions
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Write Notes Handbook",
                      desc: "Interactive markdown & code runner",
                      icon: FileText,
                      href: "/create?tab=notes",
                      gradient: "from-violet-600 to-indigo-600",
                    },
                    {
                      title: "Upload Video & Transcribe",
                      desc: "Auto AI chapter synthesis",
                      icon: Sparkles,
                      href: "/create?tab=tutorial",
                      gradient: "from-cyan-600 to-blue-600",
                    },
                    {
                      title: "Public Library",
                      desc: "Explore guides by community",
                      icon: BookOpen,
                      href: "/library",
                      gradient: "from-emerald-600 to-teal-600",
                    },
                  ].map(({ title, desc, icon: Icon, href, gradient }) => (
                    <Link
                      key={title}
                      href={href}
                      className="glass-card rounded-2xl border border-white/10 p-5 group flex items-start gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}
                      >
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-white text-xs group-hover:text-violet-300 transition-colors">
                          {title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="text-slate-500 group-hover:text-violet-400 transition-colors ml-auto"
                      />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Saved Drafts in Progress Section */}
              {draftsList.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Save size={15} className="text-cyan-400" />
                      <h2 className="text-sm font-semibold text-slate-200">
                        Unpublished Drafts in Progress
                      </h2>
                      <span className="badge badge-cyan text-[10px]">{draftsList.length}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab("drafts")}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      View all drafts →
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {draftsList.slice(0, 2).map((draft) => (
                      <div
                        key={draft.id}
                        className="glass-strong rounded-2xl border border-cyan-500/20 p-4.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="badge badge-cyan text-[10px]">{draft.subject}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Clock size={10} /> Saved {draft.lastSavedAt}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">
                            {draft.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {draft.description || "Draft handbook content saved in your studio."}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.08]">
                          <Link
                            href={`/create?draft=${draft.id}`}
                            className="btn-primary text-xs flex-1 justify-center py-2"
                          >
                            <Edit3 size={13} />
                            <span>Resume & Publish</span>
                          </Link>
                          <button
                            onClick={(e) => handleDeleteDraft(draft.id, e)}
                            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue Reading or Library Exploration */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-violet-400" />
                    <h2 className="text-sm font-semibold text-slate-200">
                      {readingBooks.length > 0 ? "Continue Reading" : "Explore Community Library"}
                    </h2>
                  </div>
                  <Link href="/library" className="text-xs text-violet-400 hover:text-violet-300">
                    Browse all ({allPublishedBooks.length}) →
                  </Link>
                </div>
                {readingBooks.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {readingBooks.slice(0, 4).map((book) => (
                      <BookCard key={book.id} {...book} />
                    ))}
                  </div>
                ) : allPublishedBooks.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {allPublishedBooks.slice(0, 4).map((book) => (
                      <BookCard key={book.id} {...book} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 glass-strong rounded-2xl border border-white/10">
                    <BookOpen size={28} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">No books in library yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. My Books Tab */}
          {activeTab === "my-books" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    My Published Books
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {myPublishedBooks.length} book(s) live under your account
                  </p>
                </div>
                <Link href="/create" className="btn-primary text-xs px-4 py-2">
                  <PlusCircle size={14} />
                  Publish New Book
                </Link>
              </div>

              {myPublishedBooks.length > 0 ? (
                <div className="space-y-3">
                  {myPublishedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-strong rounded-2xl border border-white/10 p-5 group hover:border-violet-500/40 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                            book.coverGradient || "from-violet-600 to-indigo-600"
                          } flex-shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                        >
                          {book.subject.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-white text-sm truncate">{book.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                            <span className="badge badge-purple text-[10px]">{book.subject}</span>
                            <span>{book.chaptersCount || 1} chapter(s)</span>
                            <span>{(book.readersCount || 0).toLocaleString()} reader(s)</span>
                            <span className="text-amber-400">★ {book.rating || 5.0}</span>
                            <span className="text-slate-500">{book.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <Link
                          href={`/book/${book.id}`}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Read</span>
                        </Link>
                        <Link
                          href={`/create?edit=${book.id}`}
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Edit3 size={13} />
                          <span>Edit Book</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-strong rounded-3xl border border-white/10">
                  <BookOpen size={36} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white">No published books yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    You haven&apos;t published any books yet. Write your first technical handbook or import a video lecture to see it live here!
                  </p>
                  <Link href="/create" className="btn-primary mt-4 inline-flex text-xs">
                    <PlusCircle size={14} />
                    <span>Create Your First Book</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 3. Drafts Tab */}
          {activeTab === "drafts" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white font-heading">
                    Saved Drafts & Working Notes
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Saved privately for @{currentUser.username}. Only you can view or resume these drafts.
                  </p>
                </div>
                <Link href="/create" className="btn-primary text-xs px-4 py-2">
                  <PlusCircle size={14} />
                  New Draft
                </Link>
              </div>

              {draftsList.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftsList.map((draft) => (
                    <div
                      key={draft.id}
                      className="glass-strong rounded-2xl border border-white/10 p-5 flex flex-col justify-between hover:border-violet-500/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="badge badge-cyan text-[10px]">{draft.subject}</span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {draft.lastSavedAt}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mb-1 line-clamp-1">
                          {draft.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 mb-3">
                          {draft.description || "Draft chapter notes in progress."}
                        </p>
                        <div className="text-[11px] text-slate-500 mb-4">
                          📖 Chapter: <strong className="text-slate-300">{draft.chapterTitle}</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.08]">
                        <Link
                          href={`/create?draft=${draft.id}`}
                          className="btn-primary text-xs flex-1 justify-center py-2"
                        >
                          <Edit3 size={13} />
                          <span>Resume & Publish</span>
                        </Link>
                        <button
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                          className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                          title="Delete Draft"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 glass-strong rounded-3xl border border-white/10">
                  <Save size={36} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white">No drafts found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    When you write notes or build a book, you can save your progress as a draft anytime.
                  </p>
                  <Link href="/create" className="btn-primary mt-4 inline-flex text-xs">
                    <PlusCircle size={14} />
                    <span>Start a New Book Draft</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 4. Reading Tab */}
          {activeTab === "reading" && (
            <div className="space-y-8">
              {readingBooks.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-white font-heading">
                        Your In-Progress Reading List
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {readingBooks.length} book(s) read · {userActivity.completedChapterIds.length} chapter(s) marked complete
                      </p>
                    </div>
                    {userActivity.lastRead && (
                      <Link
                        href={`/book/${userActivity.lastRead.bookId}/chapter/${userActivity.lastRead.chapterId}`}
                        className="btn-primary text-xs px-3.5 py-1.5"
                      >
                        <BookOpen size={13} />
                        <span>Resume Last Chapter</span>
                      </Link>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {readingBooks.map((book) => (
                      <BookCard key={book.id} {...book} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-14 glass-strong rounded-3xl border border-white/10">
                  <Eye size={36} className="text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white">No reading activity yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    When you read books and complete chapters, they will automatically appear in your reading history here!
                  </p>
                </div>
              )}

              {/* Discover More Books */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-200">
                    Discover More in Library
                  </h3>
                  <Link href="/library" className="text-xs text-violet-400 hover:text-violet-300">
                    Full Library →
                  </Link>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allPublishedBooks.slice(0, 6).map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Readers",
                    value: totalReaders > 0 ? totalReaders.toLocaleString() : "0",
                    trend: myPublishedBooks.length > 0 ? "Live metrics" : "No books yet",
                    positive: myPublishedBooks.length > 0,
                  },
                  {
                    label: "Books Published",
                    value: myPublishedBooks.length,
                    trend: myPublishedBooks.length > 0 ? `${myPublishedBooks.length} published` : "None yet",
                    positive: myPublishedBooks.length > 0,
                  },
                  {
                    label: "Saved Drafts",
                    value: draftsList.length,
                    trend: draftsList.length > 0 ? "In progress" : "None",
                    positive: draftsList.length > 0,
                  },
                  {
                    label: "Avg Rating",
                    value: avgRating !== "—" ? `★ ${avgRating}` : "★ —",
                    trend: myPublishedBooks.length > 0 ? "From your books" : "No reviews",
                    positive: myPublishedBooks.length > 0,
                  },
                ].map(({ label, value, trend, positive }) => (
                  <div key={label} className="glass-strong rounded-2xl border border-white/10 p-5">
                    <p className="text-xs text-slate-400 mb-1">{label}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-bold text-white font-heading">{value}</span>
                      <span
                        className={`text-xs font-semibold mb-0.5 ${
                          positive ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        {trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {myPublishedBooks.length > 0 ? (
                <div className="glass-strong rounded-2xl border border-white/10 p-6">
                  <h3 className="font-bold text-sm text-white mb-4">Book Popularity &amp; Readers</h3>
                  <div className="space-y-4">
                    {myPublishedBooks.map((book) => {
                      const maxReaders = Math.max(
                        1,
                        ...myPublishedBooks.map((b) => b.readersCount || 0)
                      );
                      return (
                        <div key={book.id}>
                          <div className="flex items-center justify-between mb-1.5 text-xs">
                            <span className="text-slate-200 font-medium truncate max-w-[220px]">
                              {book.title}
                            </span>
                            <span className="text-slate-400">
                              {(book.readersCount || 0).toLocaleString()} reader(s)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full"
                              style={{
                                width: `${Math.max(5, ((book.readersCount || 0) / maxReaders) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 glass-strong rounded-2xl border border-white/10">
                  <TrendingUp size={28} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No analytics yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Publish your first book to track real reader engagements, ratings, and chapter views.
                  </p>
                  <Link href="/create" className="btn-primary mt-4 inline-flex text-xs">
                    <PlusCircle size={14} />
                    <span>Publish First Book</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPageWithGuard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}
