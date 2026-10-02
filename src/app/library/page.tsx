"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/book/BookCard";
import { TOPICS, Book } from "@/lib/mockData";
import { getAllBooks } from "@/lib/bookStore";
import AuthGuard from "@/components/auth/AuthGuard";
import { Search, SlidersHorizontal, Grid3x3, List, TrendingUp, Sparkles, Video, X } from "lucide-react";

type SortOption = "trending" | "newest" | "rating" | "readers";
type FilterType = { topic: string; hasVideo: boolean; isAI: boolean; language: string };

export function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [sort, setSort] = useState<SortOption>("trending");
  const [viewGrid, setViewGrid] = useState(true);
  const [filters, setFilters] = useState<FilterType>({
    topic: "All",
    hasVideo: false,
    isAI: false,
    language: "All",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setBooks(getAllBooks());
    const handleUpdate = () => setBooks(getAllBooks());
    window.addEventListener("books-updated", handleUpdate);
    return () => window.removeEventListener("books-updated", handleUpdate);
  }, []);

  const filtered = books.filter((book) => {
    const matchSearch =
      !search ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase()) ||
      book.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchTopic =
      selectedTopic === "All" || book.subject.toLowerCase() === selectedTopic.toLowerCase();
    const matchVideo = !filters.hasVideo || book.hasVideo;
    const matchAI = !filters.isAI || book.isAIGenerated;
    return matchSearch && matchTopic && matchVideo && matchAI;
  }).sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "readers") return b.readersCount - a.readersCount;
    if (sort === "newest") return a.isNew ? -1 : 1;
    return (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0);
  });

  const activeFilterCount = [
    filters.hasVideo,
    filters.isAI,
    filters.language !== "All",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="section-tag mb-3">
            <TrendingUp size={10} />
            Public Library
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            Book Library
          </h1>
          <p className="text-slate-400">
            {books.length} books · Notes and tutorials created by community developers
          </p>
        </div>

        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search books, topics, authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11 pr-4"
              id="library-search"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="input-field sm:w-44 bg-[#16161f] cursor-pointer"
            id="library-sort"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest First</option>
            <option value="rating">Top Rated</option>
            <option value="readers">Most Readers</option>
          </select>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex-shrink-0 relative ${showFilters ? "border-purple-500/50 text-purple-300" : ""}`}
            id="library-filters-btn"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Grid / List toggle */}
          <div className="flex rounded-lg border border-white/5 overflow-hidden">
            <button
              onClick={() => setViewGrid(true)}
              className={`px-3 py-2 transition-all ${viewGrid ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Grid3x3 size={15} />
            </button>
            <button
              onClick={() => setViewGrid(false)}
              className={`px-3 py-2 transition-all ${!viewGrid ? "bg-purple-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="glass rounded-xl border border-white/5 p-4 mb-6 animate-fade-in">
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all ${filters.hasVideo ? "bg-purple-600 border-purple-600" : "border-white/20"}`}>
                    {filters.hasVideo && <div className="text-white text-[8px] flex items-center justify-center h-full">✓</div>}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Video size={13} className="text-blue-400" />
                  Has Video
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.isAI}
                    onChange={(e) => setFilters({ ...filters, isAI: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border transition-all ${filters.isAI ? "bg-purple-600 border-purple-600" : "border-white/20"}`}>
                    {filters.isAI && <div className="text-white text-[8px] flex items-center justify-center h-full">✓</div>}
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Sparkles size={13} className="text-purple-400" />
                  AI Generated
                </span>
              </label>

              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters({ topic: "All", hasVideo: false, isAI: false, language: "All" })}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Topic pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selectedTopic === topic
                  ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20"
                  : "border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-500">
            <span className="text-slate-300 font-semibold">{filtered.length}</span> books found
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Books Grid / List */}
        {filtered.length > 0 ? (
          viewGrid ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((book) => (
                <Link
                  key={book.id}
                  href={`/book/${book.id}`}
                  className="flex items-center gap-4 glass rounded-xl border border-white/5 p-4 card-hover group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    ["from-purple-600 to-blue-500", "from-pink-500 to-orange-400", "from-emerald-500 to-teal-400"][parseInt(book.id) % 3]
                  } flex-shrink-0 flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-sm">{book.subject.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 text-sm group-hover:text-purple-300 transition-colors truncate">{book.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">by {book.author} · {book.chaptersCount} chapters</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
                    {book.hasVideo && <span className="badge badge-blue">Video</span>}
                    {book.isAIGenerated && <span className="badge badge-purple">AI</span>}
                    <span className="text-amber-400">★ {book.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl glass border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No books found</p>
            <p className="text-sm text-slate-600 mt-1">Try adjusting your search query or filters</p>
            <button
              onClick={() => { setSearch(""); setSelectedTopic("All"); setFilters({ topic: "All", hasVideo: false, isAI: false, language: "All" }); }}
              className="btn-secondary mt-4 text-sm"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function LibraryPageWithGuard() {
  return (
    <AuthGuard title="Library Access Restricted">
      <LibraryPage />
    </AuthGuard>
  );
}
