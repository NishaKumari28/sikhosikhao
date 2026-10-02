"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Clock,
  CheckCircle2,
  ListVideo,
  ExternalLink,
  BookOpen,
  MonitorPlay,
  Code2,
  FastForward,
} from "lucide-react";
import { useAIAssistant } from "@/components/ai/AIAssistantContext";

const YouTubeIcon = ({ size = 13, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

interface VideoPlayerProps {
  title: string;
  videoUrl?: string;
  subject?: string;
  duration?: number;
  author?: string;
  onComplete?: () => void;
}

interface ChapterBookmark {
  time: string;
  title: string;
  seconds: number;
  subtitle: string;
  codeSnippet: string;
}

// Subject-specific rich interactive lectures
const LECTURE_DATA: Record<
  string,
  {
    youtubeId: string;
    chapters: ChapterBookmark[];
  }
> = {
  "Next.js": {
    youtubeId: "wm5gMKuwSYk",
    chapters: [
      {
        time: "00:00",
        seconds: 0,
        title: "Introduction to Next.js 14 & App Router",
        subtitle: "Overview of Next.js architectural advantages, full-stack capabilities, and project structure.",
        codeSnippet: `// 1. Initializing your Next.js 14 App
npx create-next-app@latest my-awesome-project --typescript --tailwind
cd my-awesome-project
npm run dev

// Ready! Server listening on http://localhost:3000`,
      },
      {
        time: "03:45",
        seconds: 225,
        title: "Server Components vs Client Components",
        subtitle: "How React Server Components eliminate JS bundle size and render directly on the server.",
        codeSnippet: `// app/page.tsx - React Server Component (Default)
export default async function DashboardPage() {
  const books = await fetchBooksFromDatabase();
  return (
    <main className="p-8">
      <h1>Latest Tutorials</h1>
      <BookList items={books} />
    </main>
  );
}`,
      },
      {
        time: "08:12",
        seconds: 492,
        title: "Dynamic File-based Routing",
        subtitle: "Folders in src/app define routes. [id] generates dynamic parameters with type safety.",
        codeSnippet: `// app/book/[id]/chapter/[chapterId]/page.tsx
export default function ChapterReader({
  params,
}: {
  params: { id: string; chapterId: string };
}) {
  return <div>Reading Book {params.id}, Chapter {params.chapterId}</div>;
}`,
      },
      {
        time: "14:30",
        seconds: 870,
        title: "Server Actions & Real-Time Mutations",
        subtitle: "Mutate backend database records directly from React components without building REST endpoints.",
        codeSnippet: `// app/actions.ts
'use server';

export async function createNoteAction(formData: FormData) {
  const title = formData.get('title') as string;
  await db.notes.create({ data: { title } });
  revalidatePath('/dashboard');
}`,
      },
    ],
  },
  Python: {
    youtubeId: "rfscVS0vtbw",
    chapters: [
      {
        time: "00:00",
        seconds: 0,
        title: "Course Overview & Python Environment",
        subtitle: "Setting up Python 3.12, virtual environments, and interactive programming.",
        codeSnippet: `# 1. Verify Python & Virtual Environment
python3 --version
python3 -m venv venv
source venv/bin/activate  # or venv\\Scripts\\activate on Windows

print("Hello, SikhoSikhao Python Learner!")`,
      },
      {
        time: "05:10",
        seconds: 310,
        title: "Core Data Structures: Lists, Dicts & Sets",
        subtitle: "Manipulating collections with Pythonic comprehensions and high performance built-ins.",
        codeSnippet: `# Pythonic List & Dict Comprehensions
courses = ["Python", "Next.js", "DSA", "AI"]
upper_courses = [c.upper() for c in courses if len(c) > 2]

stats = {c: len(c) for c in upper_courses}
print(stats) # {'PYTHON': 6, 'NEXT.JS': 7, 'DSA': 3}`,
      },
      {
        time: "12:40",
        seconds: 760,
        title: "Object-Oriented Programming & Clean Architecture",
        subtitle: "Writing classes, dunder methods, type hints, and inheritance patterns.",
        codeSnippet: `from dataclasses import dataclass

@dataclass
class Course:
    title: str
    instructor: str
    duration_minutes: int = 15

    def summary(self) -> str:
        return f"{self.title} by {self.instructor}"`,
      },
      {
        time: "19:30",
        seconds: 1170,
        title: "Generators, Decorators & Async Python",
        subtitle: "Deep dive into async/await with asyncio and custom performance logging decorators.",
        codeSnippet: `import asyncio

async def fetch_tutorial_data(chapter_id: int):
    await asyncio.sleep(1)
    return {"status": "success", "chapter": chapter_id}

asyncio.run(fetch_tutorial_data(1))`,
      },
    ],
  },
  DSA: {
    youtubeId: "8hly31xKli0",
    chapters: [
      {
        time: "00:00",
        seconds: 0,
        title: "Introduction to DSA & Asymptotic Complexity",
        subtitle: "Big-O notation, time and space tradeoffs in modern software engineering.",
        codeSnippet: `// Asymptotic Complexity Hierarchy:
// O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n)

function findFirstElement(arr: number[]): number {
  return arr[0]; // O(1) Constant Time
}`,
      },
      {
        time: "04:30",
        seconds: 270,
        title: "Binary Search & Divide-and-Conquer",
        subtitle: "Searching sorted collections in O(log n) logarithmic time efficiency.",
        codeSnippet: `function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
      },
      {
        time: "11:15",
        seconds: 675,
        title: "Linked Lists, Stacks & Queues",
        subtitle: "Dynamic memory structures, pointer references, and FIFO/LIFO ordering.",
        codeSnippet: `class ListNode {
  val: number;
  next: ListNode | null = null;
  constructor(val: number) { this.val = val; }
}`,
      },
    ],
  },
  React: {
    youtubeId: "bMknfKXIFA8",
    chapters: [
      {
        time: "00:00",
        seconds: 0,
        title: "React 18 & 19 Architecture",
        subtitle: "Component lifecycles, reconciliation engine, and virtual DOM diffing.",
        codeSnippet: `import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`,
      },
      {
        time: "06:20",
        seconds: 380,
        title: "Custom Hooks & State Encapsulation",
        subtitle: "Abstracting reusable logic into reusable clean hooks.",
        codeSnippet: `function useLocalStorage<T>(key: string, initialValue: T) {
  const [stored, setStored] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });
  return [stored, setStored] as const;
}`,
      },
    ],
  },
};

export default function VideoPlayer({
  title,
  videoUrl,
  subject = "Next.js",
  duration = 15,
  author = "SikhoSikhao Instructor",
  onComplete,
}: VideoPlayerProps) {
  const { openAssistant } = useAIAssistant();

  // Find topic lecture
  const matchedKey =
    Object.keys(LECTURE_DATA).find(
      (k) =>
        subject.toLowerCase().includes(k.toLowerCase()) ||
        title.toLowerCase().includes(k.toLowerCase())
    ) || "Next.js";

  const lecture = LECTURE_DATA[matchedKey] || LECTURE_DATA["Next.js"];

  // Playback states
  const [playerMode, setPlayerMode] = useState<"interactive" | "youtube">("interactive");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const totalDurationSeconds = Math.max(duration * 60, 600); // 10-15 min
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Active chapter based on currentTime
  useEffect(() => {
    let index = 0;
    for (let i = 0; i < lecture.chapters.length; i++) {
      if (currentTime >= lecture.chapters[i].seconds) {
        index = i;
      }
    }
    setActiveChapterIndex(index);
  }, [currentTime, lecture.chapters]);

  // Timer loop for interactive lecture playback
  useEffect(() => {
    if (isPlaying && playerMode === "interactive") {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDurationSeconds) {
            setIsPlaying(false);
            onComplete?.();
            return totalDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, playbackSpeed, totalDurationSeconds, onComplete, playerMode]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(Math.floor(pos * totalDurationSeconds));
  };

  const jumpToChapter = (seconds: number, index: number) => {
    setCurrentTime(seconds);
    setActiveChapterIndex(index);
    if (!isPlaying) setIsPlaying(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAskAI = () => {
    const currCh = lecture.chapters[activeChapterIndex];
    openAssistant({
      type: "video",
      fileName: `${title} (${currCh?.title || "Video Lecture"})`,
      contentPreview: `Topic: ${title}\nSubject: ${subject}\nCurrent Timestamp: ${formatTime(currentTime)}\nCurrent Lecture Segment: ${currCh?.title}\nNotes: ${currCh?.subtitle}`,
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const activeChapter = lecture.chapters[activeChapterIndex] || lecture.chapters[0];
  const progressPercent = Math.min(100, (currentTime / totalDurationSeconds) * 100);

  // Extract YouTube ID if custom url passed
  const resolvedYoutubeId = (() => {
    if (videoUrl?.includes("youtu.be/")) return videoUrl.split("youtu.be/")[1]?.split("?")[0];
    if (videoUrl?.includes("watch?v=")) return videoUrl.split("watch?v=")[1]?.split("&")[0];
    return lecture.youtubeId;
  })();

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl sm:rounded-3xl overflow-hidden glass-strong border border-violet-500/25 shadow-2xl bg-[#070913] mb-8 select-none"
    >
      {/* Top Header Mode Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.08] bg-[#0c0e1a]/95">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${isPlaying ? "bg-emerald-400 animate-pulse" : "bg-violet-400"}`} />
          <span className="text-xs sm:text-sm font-bold text-slate-100 font-heading truncate">
            {title}
          </span>
          <span className="badge badge-purple text-[10px] hidden md:inline-flex">
            {subject}
          </span>
        </div>

        {/* Mode Switcher: Interactive Code Lecture vs YouTube */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
          <button
            type="button"
            onClick={() => {
              setPlayerMode("interactive");
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              playerMode === "interactive"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <MonitorPlay size={13} />
            <span>Interactive Lecture</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPlayerMode("youtube");
              setIsPlaying(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              playerMode === "youtube"
                ? "bg-red-600 text-white shadow-md shadow-red-600/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <YouTubeIcon size={13} />
            <span>YouTube Stream</span>
          </button>
        </div>
      </div>

      {/* Screen Display Area (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full bg-[#05060c] overflow-hidden flex flex-col justify-between">
        {playerMode === "interactive" ? (
          /* =========================================================================
             INTERACTIVE CODE & ANIMATED LECTURE ENGINE (Guaranteed 100% Playback)
             ========================================================================= */
          <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-7 bg-gradient-to-br from-[#0c0e1e] via-[#080914] to-[#04050a]">
            {/* Ambient Animated Glow when Playing */}
            {isPlaying && (
              <>
                <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none animate-pulse" />
                <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none animate-pulse" />
              </>
            )}

            {/* Video Stage Header */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold flex items-center gap-1.5">
                  <Code2 size={13} />
                  <span>CHAPTER {activeChapterIndex + 1}/{lecture.chapters.length}</span>
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {activeChapter.title}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE LECTURE PLAYING
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-slate-400 text-[11px] font-semibold">
                    PAUSED
                  </span>
                )}
              </div>
            </div>

            {/* Center Code Visualizer Stage */}
            <div className="relative z-10 flex-1 my-3 sm:my-4 flex flex-col justify-center">
              <div className="w-full max-w-2xl mx-auto rounded-xl sm:rounded-2xl bg-[#04050c]/90 border border-white/[0.08] shadow-2xl p-4 sm:p-5 backdrop-blur-md">
                {/* Code Window Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      {subject.toLowerCase()}-tutorial.
                      {subject.includes("Python") ? "py" : "tsx"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">
                    {subject} Syntax
                  </span>
                </div>

                {/* Animated Code Presentation */}
                <pre className="text-xs sm:text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-48 sm:max-h-56 scrollbar-thin">
                  <code>{activeChapter.codeSnippet}</code>
                </pre>
              </div>
            </div>

            {/* Bottom Subtitle / Narration Banner */}
            <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/[0.06] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-violet-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-100 truncate">
                    {activeChapter.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {activeChapter.subtitle}
                  </p>
                </div>
              </div>

              {/* Quick Play/Pause Center Button if paused */}
              {!isPlaying && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <Play size={13} className="fill-white" />
                  <span>Resume</span>
                </button>
              )}
            </div>

            {/* Big Overlay Play button when stopped at start */}
            {!isPlaying && currentTime === 0 && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer select-none transition-all group z-30"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 p-[3px] shadow-2xl shadow-violet-600/60 group-hover:scale-110 active:scale-95 transition-all mb-4">
                  <div className="w-full h-full rounded-full bg-[#070913] flex items-center justify-center pl-1 group-hover:bg-violet-600 transition-colors">
                    <Play size={32} className="text-white fill-white" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white font-heading mb-1 group-hover:text-violet-200 transition-colors">
                  {title}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock size={12} className="text-violet-400" />
                  <span>{duration} Minutes Video Lecture</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-semibold">Click to Start Playing</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
             YOUTUBE STREAM IFRAME (With direct link fallback)
             ========================================================================= */
          <div className="absolute inset-0 w-full h-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${resolvedYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
              title={title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Progress Scrubber Bar */}
      {playerMode === "interactive" && (
        <div
          onClick={handleSeek}
          className="relative w-full h-2.5 bg-white/[0.08] hover:h-3.5 transition-all cursor-pointer group"
        >
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 relative transition-all"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Knob */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Chapter markers on scrubber */}
          {lecture.chapters.map((ch) => {
            const markerPercent = (ch.seconds / totalDurationSeconds) * 100;
            return (
              <div
                key={ch.seconds}
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${markerPercent}%` }}
                title={`${ch.time} - ${ch.title}`}
              />
            );
          })}
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="p-3.5 sm:p-4 bg-[#0a0c18] border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        {/* Play/Pause, Rewind, Timestamps */}
        <div className="flex items-center gap-2 sm:gap-3">
          {playerMode === "interactive" && (
            <>
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-md shadow-violet-600/30 transition-transform active:scale-95 cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} className="fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setCurrentTime(0)}
                className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Restart"
              >
                <RotateCcw size={14} />
              </button>

              {/* Time display */}
              <div className="text-xs font-mono text-slate-300 ml-1">
                <span className="text-white font-bold">{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(totalDurationSeconds)}</span>
              </div>
            </>
          )}

          {playerMode === "youtube" && (
            <a
              href={`https://www.youtube.com/watch?v=${resolvedYoutubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 text-xs font-semibold transition-all"
            >
              <ExternalLink size={13} />
              <span>Watch on YouTube HD</span>
            </a>
          )}
        </div>

        {/* Speed, Volume, AI & Chapter Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Playback speed selector */}
          {playerMode === "interactive" && (
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-0.5">
              {[1, 1.25, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? "bg-violet-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          )}

          {/* Ask AI about this video lecture */}
          <button
            type="button"
            onClick={handleAskAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={13} className="text-violet-400" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>

          {/* Chapters bookmark dropdown toggle */}
          <button
            type="button"
            onClick={() => setShowChapters(!showChapters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showChapters
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-200"
                : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <ListVideo size={13} />
            <span>Chapters ({lecture.chapters.length})</span>
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Fullscreen"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Chapters list drawer */}
      {showChapters && (
        <div className="p-4 bg-[#080914] border-t border-white/[0.08] animate-in fade-in slide-in-from-top-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <BookOpen size={12} className="text-cyan-400" />
            <span>Interactive Lecture Bookmarks (Jump to Topic)</span>
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {lecture.chapters.map((ch, idx) => (
              <button
                key={ch.title}
                type="button"
                onClick={() => jumpToChapter(ch.seconds, idx)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                  activeChapterIndex === idx
                    ? "bg-violet-600/25 border-violet-500/40 text-violet-200 shadow-sm"
                    : "bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.05] text-slate-300"
                }`}
              >
                <div className="min-w-0 mr-2">
                  <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                    {activeChapterIndex === idx && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                    {ch.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{ch.subtitle}</div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-cyan-400 border border-white/5 flex-shrink-0">
                  {ch.time}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
