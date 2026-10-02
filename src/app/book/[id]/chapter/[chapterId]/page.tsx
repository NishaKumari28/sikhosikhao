"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import VideoPlayer from "@/components/book/VideoPlayer";
import ChapterList from "@/components/book/ChapterList";
import { Book, Chapter, Topic } from "@/lib/mockData";
import { getBookById, getBookChapters } from "@/lib/bookStore";
import { getStoredUser } from "@/lib/auth";
import { recordBookRead, toggleChapterComplete, isChapterCompleted } from "@/lib/userActivity";
import AuthGuard from "@/components/auth/AuthGuard";
import { ChevronLeft, ChevronRight, BookOpen, Menu, X, MessageSquare, Send, CheckCircle2, Clock, Video, Sparkles, ArrowLeft, Eye, FileText } from "lucide-react";

function renderMarkdown(content: string): string {
  if (!content) return "<p class='text-slate-400'>No content available.</p>";
  return content
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m: string, lang: string, code: string) =>
      `<pre class="bg-[#0d0f1a] border border-white/10 rounded-xl p-4 overflow-x-auto my-4"><code class="text-sm text-emerald-300">${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`
    )
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-violet-300 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-100 mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-100 mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-slate-100 mt-6 mb-4">$1</h1>')
    .replace(/^\> (.+)$/gm, '<blockquote class="border-l-4 border-violet-500 pl-4 my-4 text-slate-400 italic">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="text-slate-300 italic">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="text-slate-300 my-1 ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed my-3">');
}

export function ChapterReaderPage() {
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const bookId = typeof routeParams?.id === "string" ? routeParams.id : "";
  const chapterId = typeof routeParams?.chapterId === "string" ? routeParams.chapterId : "";
  const topicIdParam = searchParams?.get("topic") || "";

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [completed, setCompleted] = useState(false);
  const [activeView, setActiveView] = useState<"notes" | "video">("notes");
  const [showInlineVideo, setShowInlineVideo] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getStoredUser();
    const userKey = user?.username || "guest";
    const foundBook = getBookById(bookId);
    if (foundBook) setBook(foundBook);
    const bookChapters = getBookChapters(bookId);
    setChapters(bookChapters);
    const foundChapter = bookChapters.find((c) => c.id === chapterId) || bookChapters[0] || null;
    setChapter(foundChapter);
    if (foundChapter) {
      const foundTopic = topicIdParam
        ? foundChapter.topics.find((t) => t.id === topicIdParam) || foundChapter.topics[0]
        : foundChapter.topics[0];
      setActiveTopic(foundTopic || null);
      setCompleted(isChapterCompleted(userKey, foundChapter.id));
      if (foundBook) {
        recordBookRead(userKey, bookId, foundBook.title, foundChapter.id, foundChapter.title);
      }
    }
  }, [bookId, chapterId, topicIdParam]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTopic?.id]);

  if (!book || !chapter) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading chapter...</p>
        </div>
      </div>
    );
  }

  const chapterIndex = chapters.findIndex((c) => c.id === chapterId);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;
  const hasVideo = chapter.topics.some((t) => t.type === "video") || !!(book as unknown as { videoUrl?: string }).videoUrl;
  const currentContent = activeTopic?.content || "";
  const isVideoTopic = activeTopic?.type === "video";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col text-slate-100">
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#07080e]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-md flex items-center">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 max-w-7xl w-full mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#0a0c16] rounded-[11px] flex items-center justify-center">
                  <BookOpen size={15} className="text-violet-300" />
                </div>
              </div>
              <span className="font-heading font-bold text-sm text-white hidden md:inline">SikhoSikhao</span>
            </Link>
            <span className="text-slate-600 hidden md:inline">|</span>
            <Link href={`/book/${bookId}`} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors truncate">
              <ArrowLeft size={14} className="flex-shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-xs">{book.title}</span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-2 max-w-sm truncate text-xs font-semibold text-slate-300 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="truncate">{chapter.title}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasVideo && (
              <div className="flex rounded-xl glass border border-white/10 p-0.5 overflow-hidden">
                <button type="button" onClick={() => setActiveView("notes")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeView === "notes" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <BookOpen size={12} /><span>Notes</span>
                </button>
                <button type="button" onClick={() => setActiveView("video")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeView === "video" ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white"}`}>
                  <Video size={12} /><span>Video</span>
                </button>
              </div>
            )}
            <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${sidebarOpen ? "bg-violet-600/20 border-violet-500/40 text-violet-200" : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white"}`}>
              {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
              <span className="hidden sm:inline">Chapters</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16">
        <main ref={contentRef} className={`flex-1 transition-all ${sidebarOpen ? "lg:pr-80" : ""}`}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {book.subject && <span className="badge badge-purple text-[10px]">{book.subject}</span>}
              {activeTopic?.type === "ai-notes" && (<span className="badge badge-orange text-[10px]"><Sparkles size={9} />AI Generated</span>)}
              {isVideoTopic && (<span className="badge badge-blue text-[10px]"><Video size={9} />Video</span>)}
              <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto"><Clock size={11} />{chapter.estimatedReadTime} min read</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><Eye size={11} />{(book.readersCount || 0).toLocaleString()} views</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2 leading-tight">{chapter.title}</h1>
            <p className="text-sm text-slate-500 mb-8">By {book.author || "Author"} - Updated {book.updatedAt || "Recently"}</p>

            {chapter.topics.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {chapter.topics.map((topic) => (
                  <button key={topic.id} onClick={() => setActiveTopic(topic)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${activeTopic?.id === topic.id ? "bg-purple-600/20 text-purple-300 border-purple-500/30" : "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"}`}>
                    {topic.isCompleted ? <CheckCircle2 size={11} className="text-green-400" /> : topic.type === "video" ? <Video size={11} className="text-blue-400" /> : topic.type === "ai-notes" ? <Sparkles size={11} className="text-amber-400" /> : <FileText size={11} />}
                    {topic.title}
                  </button>
                ))}
              </div>
            )}

            {activeView === "video" && (
              <div className="mb-8">
                <VideoPlayer title={`${chapter.title} - Video Lecture`} videoUrl={(chapter as unknown as { videoUrl?: string }).videoUrl || (book as unknown as { videoUrl?: string }).videoUrl} subject={book.subject} author={book.author} duration={chapter.estimatedReadTime || 15} />
              </div>
            )}

            {activeView === "notes" && (
              <div>
                {hasVideo && showInlineVideo && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5"><Video size={13} className="text-cyan-400" /><span>Chapter Tutorial Video</span></span>
                      </div>
                      <button type="button" onClick={() => setShowInlineVideo(false)} className="text-xs text-violet-400 hover:text-violet-300 font-semibold">Minimize Player</button>
                    </div>
                    <VideoPlayer title={`${chapter.title} - Video Lecture`} videoUrl={(chapter as unknown as { videoUrl?: string }).videoUrl || (book as unknown as { videoUrl?: string }).videoUrl} subject={book.subject} author={book.author} duration={chapter.estimatedReadTime || 15} />
                  </div>
                )}
                {hasVideo && !showInlineVideo && (
                  <button type="button" onClick={() => setShowInlineVideo(true)} className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 transition-all"><Video size={13} />Watch Video</button>
                )}
                {currentContent ? (
                  <div className="prose-dark" dangerouslySetInnerHTML={{ __html: renderMarkdown(currentContent) }} />
                ) : isVideoTopic ? (
                  <div className="text-center py-12 glass rounded-2xl border border-white/5">
                    <Video size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">This is a video topic.</p>
                    <p className="text-slate-500 text-xs mt-1">Switch to the Video tab to watch.</p>
                    <button onClick={() => setActiveView("video")} className="btn-primary mt-4 text-xs"><Video size={13} />Watch Video</button>
                  </div>
                ) : (
                  <div className="text-center py-12 glass rounded-2xl border border-white/5">
                    <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Content coming soon</p>
                    <p className="text-slate-500 text-xs mt-1">The author has not added notes for this topic yet.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 mt-10 mb-10 p-4 glass rounded-xl border border-white/5">
              <button
                onClick={() => {
                  const user = getStoredUser();
                  const userKey = user?.username || "guest";
                  if (chapter) {
                    const newState = toggleChapterComplete(userKey, chapter.id, bookId);
                    setCompleted(newState);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${completed ? "bg-green-500/20 text-green-300 border-green-500/30" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"}`}
              >
                <CheckCircle2 size={15} />{completed ? "Completed!" : "Mark as Complete"}
              </button>
              <p className="text-xs text-slate-500">{completed ? "Great progress! Saved to your reading activity." : "Finished reading? Mark as complete to track your progress!"}</p>
            </div>

            <div className="flex gap-3 mb-12">
              {prevChapter ? (
                <Link href={`/book/${bookId}/chapter/${prevChapter.id}`} className="btn-secondary flex-1 justify-start gap-2">
                  <ChevronLeft size={16} />
                  <div className="text-left min-w-0">
                    <p className="text-[10px] text-slate-600 uppercase tracking-wide">Previous</p>
                    <p className="text-xs truncate">{prevChapter.title}</p>
                  </div>
                </Link>
              ) : <div className="flex-1" />}
              {nextChapter && (
                <Link href={`/book/${bookId}/chapter/${nextChapter.id}`} className="btn-primary flex-1 justify-end gap-2">
                  <div className="text-right min-w-0">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Next</p>
                    <p className="text-xs truncate">{nextChapter.title}</p>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>

            <div className="border-t border-white/5 pt-10">
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2"><MessageSquare size={18} className="text-purple-400" />Discussion</h2>
              <div className="flex gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{book.author ? book.author.slice(0, 2).toUpperCase() : "SS"}</div>
                <div className="flex-1 glass rounded-xl border border-white/5 overflow-hidden">
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Have a question or feedback?" className="w-full bg-transparent text-sm text-slate-300 p-3 resize-none outline-none h-20 placeholder:text-slate-600" />
                  <div className="flex items-center justify-between px-3 pb-2.5 border-t border-white/5 pt-2">
                    <p className="text-xs text-slate-600">Markdown supported</p>
                    <button disabled={!comment.trim()} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50" onClick={() => setComment("")}><Send size={12} />Post</button>
                  </div>
                </div>
              </div>
              <div className="text-center py-8 glass rounded-xl border border-white/5">
                <MessageSquare size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Be the first to start the discussion!</p>
              </div>
            </div>
          </div>
        </main>

        {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        {sidebarOpen && (
          <aside className="fixed right-0 top-16 bottom-0 w-80 bg-[#0c0e1a]/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto z-50 p-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-slate-200">Table of Contents</h3>
              <button type="button" onClick={() => setSidebarOpen(false)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
            </div>
            <ChapterList bookId={bookId} chapters={chapters} currentChapterId={chapterId} showProgress={true} />
          </aside>
        )}
      </div>
    </div>
  );
}

export default function ChapterReaderPageWithGuard() {
  return (
    <AuthGuard title="Chapter Notes & Tutorials Restricted">
      <ChapterReaderPage />
    </AuthGuard>
  );
}