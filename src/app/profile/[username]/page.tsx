"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/book/BookCard";
import { Book } from "@/lib/mockData";
import { getAllBooks } from "@/lib/bookStore";
import { getStoredUser, findUserByIdentifier, UserProfile } from "@/lib/auth";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  BookOpen,
  Users,
  Star,
  Calendar,
  MapPin,
  Globe,
  Edit3,
  TrendingUp,
  FileText,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";

export function ProfilePage() {
  const routeParams = useParams();
  const usernameParam = typeof routeParams?.username === "string" ? routeParams.username : "";

  const { firebaseUser } = useFirebaseAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userBooks, setUserBooks] = useState<Book[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  useEffect(() => {
    const loggedIn = getStoredUser();
    const cleanParam = (usernameParam || "").toLowerCase();

    // Check if viewing own profile
    const isSelf =
      (loggedIn && (loggedIn.username.toLowerCase() === cleanParam || loggedIn.id === cleanParam)) ||
      (firebaseUser &&
        (firebaseUser.email?.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() === cleanParam ||
          firebaseUser.uid === cleanParam));

    setIsCurrentUser(!!isSelf);

    let target: UserProfile | null = null;
    if (isSelf && loggedIn) {
      target = loggedIn;
    } else if (cleanParam) {
      target = findUserByIdentifier(cleanParam);
    }

    if (!target) {
      // Fallback clean profile for public creator view
      const prettyName = cleanParam
        ? cleanParam.charAt(0).toUpperCase() + cleanParam.slice(1).replace(/_/g, " ")
        : "Creator";
      target = {
        id: cleanParam || "creator",
        name: prettyName,
        username: cleanParam || "creator",
        email: `${cleanParam || "creator"}@sikhosikhao.app`,
        avatar: (cleanParam || "CR").slice(0, 2).toUpperCase(),
        role: "USER",
        bio: "Creator & learner sharing technical notes and handbooks on SikhoSikhao.",
        booksCount: 0,
        joinedAt: "Community Member",
      };
    }

    setProfileUser(target);

    // Load actual books published by this user
    const all = getAllBooks();
    const books = all.filter(
      (b) =>
        b.authorUsername?.toLowerCase() === target!.username.toLowerCase() ||
        b.author?.toLowerCase() === target!.name.toLowerCase()
    );
    setUserBooks(books);
  }, [usernameParam, firebaseUser]);

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading profile...</p>
      </div>
    );
  }

  const totalBooks = userBooks.length;
  const totalReaders = userBooks.reduce((sum, b) => sum + (b.readersCount || 0), 0);
  const totalChapters = userBooks.reduce((sum, b) => sum + (b.chaptersCount || 1), 0);
  const avgRating =
    userBooks.length > 0
      ? (userBooks.reduce((sum, b) => sum + (b.rating || 5), 0) / userBooks.length).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Profile header */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-purple-900/50 via-blue-900/30 to-purple-900/50 relative">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* Profile content */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-[#0a0a0f] shadow-xl flex-shrink-0">
                {profileUser.avatar || profileUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-100">{profileUser.name}</h1>
                  <span className="badge badge-purple">Creator + Reader</span>
                  {avgRating !== "—" && parseFloat(avgRating) >= 4.5 && (
                    <span className="badge badge-orange flex items-center gap-1">
                      <Star size={9} className="fill-current" />
                      Top Creator
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">@{profileUser.username}</p>
              </div>
              <div className="flex gap-2 sm:ml-auto flex-shrink-0 pb-1">
                {isCurrentUser ? (
                  <Link href="/dashboard" className="btn-secondary text-sm px-4 py-2">
                    <LayoutDashboard size={14} />
                    My Dashboard
                  </Link>
                ) : (
                  <button className="btn-primary text-sm px-4 py-2">
                    <Users size={14} />
                    Follow
                  </button>
                )}
                <Link href="/create" className="btn-primary text-sm px-4 py-2">
                  <PlusCircle size={14} />
                  New Book
                </Link>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-slate-300 mb-4 max-w-2xl">
              {profileUser.bio || "Sharing technical guides and interactive code notes on SikhoSikhao."}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-5">
              {profileUser.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} />
                  {profileUser.location}
                </span>
              )}
              {profileUser.website && (
                <span className="flex items-center gap-1.5">
                  <Globe size={12} />
                  <a
                    href={profileUser.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300"
                  >
                    {profileUser.website}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                Joined {profileUser.joinedAt || "Community Member"}
              </span>
            </div>

            {/* Stats — 100% computed from real books */}
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Books", value: totalBooks, icon: BookOpen },
                {
                  label: "Readers",
                  value: totalReaders > 0 ? totalReaders.toLocaleString() : "0",
                  icon: Users,
                },
                { label: "Chapters", value: totalBooks > 0 ? totalChapters : 0, icon: FileText },
                { label: "Avg Rating", value: avgRating !== "—" ? `★ ${avgRating}` : "★ —", icon: Star },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 text-sm">
                  <Icon size={14} className="text-violet-400" />
                  <span className="font-bold text-slate-100">{value}</span>
                  <span className="text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Books grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="section-tag mb-2">
                <TrendingUp size={10} />
                Published Books
              </div>
              <h2 className="text-xl font-bold text-slate-100">
                {profileUser.name.split(" ")[0]}&apos;s Books
              </h2>
            </div>
            {isCurrentUser && (
              <Link href="/create" className="btn-primary text-sm px-4 py-2">
                <PlusCircle size={15} />
                New Book
              </Link>
            )}
          </div>

          {userBooks.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {userBooks.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass rounded-2xl border border-white/5">
              <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No books published yet</p>
              {isCurrentUser && (
                <Link href="/create" className="btn-primary mt-4 inline-flex">
                  Create First Book
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function ProfilePageWithGuard() {
  return (
    <AuthGuard title="Profile Access Restricted">
      <ProfilePage />
    </AuthGuard>
  );
}
