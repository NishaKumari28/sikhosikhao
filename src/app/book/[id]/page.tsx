"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ChapterList from "@/components/book/ChapterList";
import { Book, Chapter } from "@/lib/mockData";
import { getBookById, getBookChapters } from "@/lib/bookStore";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  BookOpen,
  Users,
  Star,
  Video,
  Sparkles,
  ChevronRight,
  Clock,
  Globe,
  Share2,
  Bookmark,
  BookMarked,
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Play,
} from "lucide-react";

export function BookDetailPage() {
  const routeParams = useParams();
  const bookId = typeof routeParams?.id === "string" ? routeParams.id : "1";
  const [book, setBook] = useState<Book>({
    id: bookId,
    title: "Loading...",
    author: "",
    authorUsername: "",
    subject: "",
    chaptersCount: 0,
    readersCount: 0,
    rating: 5,
    hasVideo: false,
    isAIGenerated: false,
    updatedAt: "",
    language: "English",
    tags: [],
    description: "",
    coverGradient: "from-violet-600 to-indigo-600",
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "chapters">("overview");

  useEffect(() => {
    const foundBook = getBookById(bookId);
    if (foundBook) setBook(foundBook);
    setChapters(getBookChapters(bookId));
  }, [bookId]);

  const authorInitials = book.author ? book.author.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "SS";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/library" className="hover:text-slate-300 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} />
            Library
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-400 truncate max-w-xs">{book.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* ===== Left: Book info ===== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book header */}
            <div className="glass rounded-2xl border border-white/5 overflow-hidden">
              {/* Cover banner */}
              <div className={`h-36 bg-gradient-to-br ${book.coverGradient || "from-purple-600 to-blue-500"} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen size={48} className="text-white/30" />
                </div>
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {book.isTrending && (
                    <span className="badge badge-orange">
                      <TrendingUp size={9} />
                      Trending
                    </span>
                  )}
                  {book.isAIGenerated && (
                    <span className="badge badge-purple">
                      <Sparkles size={9} />
                      AI Generated
                    </span>
                  )}
                  {book.hasVideo && (
                    <span className="badge badge-blue">
                      <Video size={9} />
                      Video
                    </span>
                  )}
                </div>
                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setBookmarked(!bookmarked)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm border transition-all ${
                      bookmarked
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-black/30 border-white/20 text-white hover:bg-black/50"
                    }`}
                  >
                    {bookmarked ? <BookMarked size={14} /> : <Bookmark size={14} />}
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-black/30 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all">
                    <Share2 size={14} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-purple">{book.subject}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Globe size={11} />
                    {book.language}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3 leading-tight">
                  {book.title}
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{book.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {book.tags.map((tag) => (
                    <span key={tag} className="text-xs text-slate-500 bg-white/3 border border-white/5 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-5 pb-5 border-b border-white/5">
                  {[
                    { icon: BookOpen, value: `${book.chaptersCount} Chapters`, color: "text-purple-400" },
                    { icon: Users, value: `${book.readersCount.toLocaleString()} Readers`, color: "text-blue-400" },
                    { icon: Star, value: `${book.rating} Rating`, color: "text-amber-400" },
                    { icon: Clock, value: `Updated ${book.updatedAt}`, color: "text-slate-400" },
                  ].map(({ icon: Icon, value, color }) => (
                    <div key={value} className="flex items-center gap-2">
                      <Icon size={14} className={color} />
                      <span className="text-sm text-slate-400">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Author */}
                <div className="pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {authorInitials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{book.author}</p>
                    <p className="text-xs text-slate-500">@{book.authorUsername}</p>
                  </div>
                  <Link
                    href={`/profile/${book.authorUsername}`}
                    className="ml-auto btn-ghost text-xs px-3 py-1.5"
                  >
                    View Profile
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-white/5">
              {(["overview", "chapters"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 -mb-px transition-all ${
                    activeTab === t
                      ? "border-purple-500 text-purple-300"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {t === "overview" ? "Overview" : "All Chapters"}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="glass rounded-xl border border-white/5 p-5">
                  <h2 className="font-semibold text-slate-200 mb-3">What You&apos;ll Learn in This Book</h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {[
                      "Project setup and configuration",
                      "Core concepts clearly explained",
                      "Real-world examples and working code",
                      "Industry best practices and developer tips",
                      "Common debugging scenarios and solutions",
                      "Hands-on practice exercises included",
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm text-slate-400">
                        <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl border border-white/5 p-5">
                  <h2 className="font-semibold text-slate-200 mb-3">Content Type</h2>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <BookOpen size={14} className="text-purple-400" />
                      </div>
                      Notes Chapters
                    </div>
                    {book.hasVideo && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                          <Video size={14} className="text-blue-400" />
                        </div>
                        Video Lectures
                      </div>
                    )}
                    {book.isAIGenerated && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                          <Sparkles size={14} className="text-amber-400" />
                        </div>
                        AI Notes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chapters tab */}
            {activeTab === "chapters" && (
              <ChapterList
                bookId={bookId}
                chapters={chapters}
                showProgress={true}
              />
            )}
          </div>

          {/* ===== Right: Sidebar ===== */}
          <div className="space-y-4">
            {/* CTA */}
            <div className="glass rounded-2xl border border-purple-500/20 p-5 sticky top-24">
              <p className="text-sm text-slate-400 mb-4 text-center">
                Start reading — <span className="text-green-400 font-medium">100% Free!</span>
              </p>
              <Link
                href={`/book/${bookId}/chapter/ch1`}
                className="btn-primary w-full justify-center py-3 text-base mb-3"
              >
                <Play size={16} />
                Read First Chapter
              </Link>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className="btn-secondary w-full justify-center py-2.5 mb-4"
              >
                {bookmarked ? <BookMarked size={15} className="text-purple-400" /> : <Bookmark size={15} />}
                {bookmarked ? "Bookmarked!" : "Bookmark Book"}
              </button>

              {/* Chapter list preview */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Chapters</p>
                <ChapterList
                  bookId={bookId}
                  chapters={chapters.slice(0, 3)}
                />
                <Link
                  href="#chapters"
                  onClick={() => setActiveTab("chapters")}
                  className="text-xs text-purple-400 hover:text-purple-300 mt-2 block text-center"
                >
                  View all chapters →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookDetailPageWithGuard() {
  return (
    <AuthGuard title="Living Book Content Restricted">
      <BookDetailPage />
    </AuthGuard>
  );
}
