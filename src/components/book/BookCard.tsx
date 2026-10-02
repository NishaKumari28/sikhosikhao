import Link from "next/link";
import {
  BookOpen,
  Clock,
  Star,
  Video,
  FileText,
  TrendingUp,
  User,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  subject: string;
  chaptersCount: number;
  readersCount: number;
  rating: number;
  hasVideo: boolean;
  isAIGenerated: boolean;
  updatedAt: string;
  progress?: number;
  language?: string;
  tags?: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

// Curated rich gradients for subjects
const SUBJECT_STYLES: Record<string, { gradient: string; accent: string; border: string }> = {
  "Next.js": {
    gradient: "from-indigo-600 via-purple-600 to-pink-500",
    accent: "text-purple-300 bg-purple-500/15 border-purple-500/30",
    border: "group-hover:border-purple-500/40",
  },
  Python: {
    gradient: "from-amber-500 via-orange-600 to-rose-600",
    accent: "text-amber-300 bg-amber-500/15 border-amber-500/30",
    border: "group-hover:border-amber-500/40",
  },
  Java: {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    accent: "text-blue-300 bg-blue-500/15 border-blue-500/30",
    border: "group-hover:border-blue-500/40",
  },
  React: {
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    accent: "text-cyan-300 bg-cyan-500/15 border-cyan-500/30",
    border: "group-hover:border-cyan-500/40",
  },
  DSA: {
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    accent: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30",
    border: "group-hover:border-emerald-500/40",
  },
  Database: {
    gradient: "from-violet-600 via-purple-700 to-indigo-800",
    accent: "text-violet-300 bg-violet-500/15 border-violet-500/30",
    border: "group-hover:border-violet-500/40",
  },
};

const DEFAULT_STYLE = {
  gradient: "from-purple-600 via-indigo-600 to-blue-600",
  accent: "text-purple-300 bg-purple-500/15 border-purple-500/30",
  border: "group-hover:border-purple-500/40",
};

export default function BookCard({
  id,
  title,
  author,
  authorUsername,
  subject,
  chaptersCount,
  readersCount,
  rating,
  hasVideo,
  isAIGenerated,
  updatedAt,
  progress,
  tags = [],
  isNew,
  isTrending,
}: BookCardProps) {
  const style = SUBJECT_STYLES[subject] || DEFAULT_STYLE;

  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/book/${id}`} className="group block h-full">
      <div
        className={`glass-card rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-300 border border-white/[0.08] ${style.border} relative group-hover:shadow-2xl group-hover:shadow-purple-950/40`}
      >
        {/* Cover Banner */}
        <div className={`relative h-44 bg-gradient-to-br ${style.gradient} overflow-hidden`}>
          {/* Subtle noise / mesh grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Diagonal Glass Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c16] via-transparent to-white/10" />

          {/* Center Book Graphic */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-1 transition-all duration-300">
              <BookOpen size={28} className="text-white drop-shadow-md" />
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
            {isNew && (
              <span className="badge badge-green text-[10px] shadow-sm">
                New
              </span>
            )}
            {isTrending && (
              <span className="badge badge-orange text-[10px] shadow-sm">
                <TrendingUp size={10} />
                Trending
              </span>
            )}
            {isAIGenerated && (
              <span className="badge badge-cyan text-[10px] shadow-sm">
                <Sparkles size={10} />
                AI Notes
              </span>
            )}
          </div>

          {/* Video indicator pill */}
          {hasVideo && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/15">
                <Video size={10} className="text-cyan-400" />
                Video
              </span>
            </div>
          )}

          {/* Optional Reading progress bar */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-cyan-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Subject and Read time header */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${style.accent}`}
              >
                {subject}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock size={11} />
                {updatedAt}
              </span>
            </div>

            {/* Title with arrow indicator on hover */}
            <h3 className="font-heading font-semibold text-slate-100 text-base leading-snug group-hover:text-purple-300 transition-colors line-clamp-2 flex items-start justify-between gap-2">
              <span>{title}</span>
              <ArrowUpRight
                size={16}
                className="text-slate-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 mt-0.5"
              />
            </h3>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-slate-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom metadata */}
          <div className="space-y-3 pt-3 border-t border-white/[0.06]">
            {/* Stats row */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <FileText size={12} className="text-purple-400" />
                {chaptersCount} Chapters
              </span>
              <span className="flex items-center gap-1.5">
                <User size={12} className="text-blue-400" />
                {readersCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star size={12} className="fill-amber-400" />
                {rating.toFixed(1)}
              </span>
            </div>

            {/* Author info */}
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                  {author}
                </p>
                <p className="text-[10px] text-slate-500 truncate">@{authorUsername}</p>
              </div>
              {progress !== undefined && (
                <span className="text-[11px] font-semibold text-purple-400">
                  {progress}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
