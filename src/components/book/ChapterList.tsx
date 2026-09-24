"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
  isPublished: boolean;
  estimatedReadTime: number; // minutes
}

interface Topic {
  id: string;
  title: string;
  type: "notes" | "video" | "ai-notes";
  isCompleted?: boolean;
  isLocked?: boolean;
  duration?: number; // for video, in minutes
}

interface ChapterListProps {
  bookId: string;
  chapters: Chapter[];
  currentChapterId?: string;
  currentTopicId?: string;
  showProgress?: boolean;
}

export default function ChapterList({
  bookId,
  chapters,
  currentChapterId,
  currentTopicId,
  showProgress = false,
}: ChapterListProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set([currentChapterId || chapters[0]?.id])
  );

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const getTopicIcon = (topic: Topic) => {
    if (topic.isCompleted) return <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />;
    if (topic.isLocked) return <Lock size={13} className="text-slate-600 flex-shrink-0" />;
    if (topic.type === "video") return <Video size={13} className="text-blue-400 flex-shrink-0" />;
    if (topic.type === "ai-notes") return <Sparkles size={13} className="text-purple-400 flex-shrink-0" />;
    return <FileText size={13} className="text-slate-500 flex-shrink-0" />;
  };

  const getTotalCompleted = () => {
    let completed = 0;
    let total = 0;
    chapters.forEach((ch) => {
      ch.topics.forEach((t) => {
        total++;
        if (t.isCompleted) completed++;
      });
    });
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const progress = getTotalCompleted();

  return (
    <div className="space-y-1.5">
      {/* Overall progress */}
      {showProgress && (
        <div className="p-3 rounded-xl glass border border-white/5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-300">Your Progress</span>
            <span className="text-xs font-bold text-purple-400">{progress.percent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            {progress.completed} of {progress.total} topics done
          </p>
        </div>
      )}

      {chapters.map((chapter, chapterIndex) => {
        const isExpanded = expandedChapters.has(chapter.id);
        const isCurrentChapter = chapter.id === currentChapterId;
        const completedTopics = chapter.topics.filter((t) => t.isCompleted).length;

        return (
          <div
            key={chapter.id}
            className={`rounded-xl overflow-hidden border transition-all ${
              isCurrentChapter
                ? "border-purple-500/30 bg-purple-500/5"
                : "border-white/5 bg-white/[0.02]"
            }`}
          >
            {/* Chapter header */}
            <button
              onClick={() => toggleChapter(chapter.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/3 transition-colors text-left"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-md bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300">
                {chapterIndex + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{chapter.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-500">
                    {chapter.topics.length} topics
                  </span>
                  {showProgress && (
                    <span className="text-[10px] text-green-400">
                      {completedTopics}/{chapter.topics.length} done
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-600">
                    <Clock size={9} />
                    {chapter.estimatedReadTime}m
                  </span>
                </div>
              </div>
              {!chapter.isPublished && (
                <span className="badge badge-orange text-[9px] mr-1">Draft</span>
              )}
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform flex-shrink-0 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Topics list */}
            {isExpanded && (
              <div className="border-t border-white/5 py-1">
                {chapter.topics.map((topic) => {
                  const isCurrentTopic = topic.id === currentTopicId;
                  return (
                    <Link
                      key={topic.id}
                      href={
                        topic.isLocked
                          ? "#"
                          : `/book/${bookId}/chapter/${chapter.id}?topic=${topic.id}`
                      }
                      className={`flex items-center gap-2.5 px-4 py-2 text-xs transition-all ${
                        topic.isLocked
                          ? "opacity-40 cursor-not-allowed"
                          : isCurrentTopic
                          ? "bg-purple-500/15 text-purple-300"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/3"
                      }`}
                    >
                      {getTopicIcon(topic)}
                      <span className="flex-1 min-w-0 truncate">{topic.title}</span>
                      {topic.type === "video" && topic.duration && (
                        <span className="text-[10px] text-slate-600 flex-shrink-0">
                          {topic.duration}m
                        </span>
                      )}
                      {isCurrentTopic && (
                        <ChevronRight size={11} className="text-purple-400 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
