import Link from "next/link";
import {
  BookOpen,
  Clock,
  Star,
  Video,
  FileText,
  TrendingUp,
  User,
  BookMarked,
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
  coverGradient?: string;
  progress?: number; // 0-100 for "reading" state
  language?: string;
  tags?: string[];
  isNew?: boolean;
  isTrending?: boolean;
}

const gradients = [
  "from-purple-600 to-blue-500",
  "from-pink-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-blue-600 to-cyan-400",
  "from-violet-600 to-purple-400",
  "from-amber-500 to-orange-500",
];

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
  coverGradient,
  progress,
  language = "Hindi + English",
  tags = [],
  isNew,
  isTrending,
}: BookCardProps) {
  const gradient = coverGradient || gradients[parseInt(id) % gradients.length];
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/book/${id}`} className="group block">
      <div className="rounded-2xl border border-white/5 bg-[#16161f] card-hover overflow-hidden h-full flex flex-col">
        {/* Cover */}
        <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <BookOpen size={28} className="text-white" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {isNew && (
              <span className="badge badge-green text-[10px]">New</span>
            )}
            {isTrending && (
              <span className="badge badge-orange text-[10px]">
                <TrendingUp size={9} />
                Trending
              </span>
            )}
            {isAIGenerated && (
              <span className="badge badge-purple text-[10px]">✨ AI</span>
            )}
          </div>

          {/* Video badge */}
          {hasVideo && (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-1 rounded-full border border-white/10">
                <Video size={9} />
                Video
              </span>
            </div>
          )}

          {/* Progress overlay at bottom */}
          {progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1.5 bg-black/30">
                <div
                  className="h-full bg-white/80"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Subject tag */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
              {subject}
            </span>
            {progress !== undefined && (
              <span className="text-xs text-slate-500">{progress}% done</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-2 group-hover:text-purple-300 transition-colors">
            {title}
          </h3>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-slate-500 bg-white/3 border border-white/5 px-2 py-0.5 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {chaptersCount} ch
            </span>
            <span className="flex items-center gap-1">
              <User size={11} />
              {readersCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Star size={11} className="text-amber-400 fill-amber-400" />
              {rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Clock size={11} />
              {updatedAt}
            </span>
          </div>

          {/* Divider */}
          <div className="divider" />

          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">{author}</p>
              <p className="text-[10px] text-slate-600">@{authorUsername}</p>
            </div>
            {progress !== undefined && (
              <BookMarked size={14} className="ml-auto text-purple-400" />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
