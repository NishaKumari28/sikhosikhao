"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import NotesEditor from "@/components/editor/NotesEditor";
import TutorialUploader from "@/components/editor/TutorialUploader";
import {
  FileText,
  Video,
  ChevronRight,
  Plus,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Check,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  Share2,
  LayoutDashboard,
  Clock,
  HelpCircle,
} from "lucide-react";
import {
  saveBookDraft,
  publishNewBook,
  getStoredDrafts,
  getBookById,
  BookDraft,
} from "@/lib/bookStore";
import { getStoredUser, setStoredUser } from "@/lib/auth";
import { useFirebaseAuth } from "@/context/FirebaseAuthContext";
import { Book } from "@/lib/mockData";

type CreateTab = "notes" | "tutorial";
type Step = "setup" | "write" | "publish";

const SUBJECTS = [
  "Python",
  "JavaScript",
  "React",
  "Next.js",
  "Java",
  "DSA",
  "Node.js",
  "CSS",
  "TypeScript",
  "Database",
  "DevOps",
  "AI & ML",
  "Other",
];

const GRADIENTS = [
  { label: "Purple to Indigo", value: "from-violet-600 via-indigo-600 to-cyan-500" },
  { label: "Orange to Amber", value: "from-amber-500 via-orange-500 to-rose-500" },
  { label: "Emerald to Teal", value: "from-emerald-500 via-teal-500 to-cyan-500" },
  { label: "Blue to Cyan", value: "from-blue-600 via-indigo-500 to-sky-400" },
  { label: "Rose to Pink", value: "from-rose-500 via-pink-600 to-purple-600" },
];

function CreateBookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get("draft") || searchParams.get("edit");
  const initialTabParam = searchParams.get("tab") === "tutorial" ? "tutorial" : "notes";
  const { firebaseUser } = useFirebaseAuth();

  const [tab, setTab] = useState<CreateTab>(initialTabParam);
  const [step, setStep] = useState<Step>("setup");
  const [draftId, setDraftId] = useState<string>(draftIdParam || "");

  // Form state
  const [bookTitle, setBookTitle] = useState("");
  const [subject, setSubject] = useState("Python");
  const [description, setDescription] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [language, setLanguage] = useState("Hindi + English");
  const [coverGradient, setCoverGradient] = useState(GRADIENTS[0].value);
  const [notesContent, setNotesContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "draft">("public");

  // Status & Notification states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [publishedBook, setPublishedBook] = useState<Book | null>(null);

  // Restore draft or edit book if param exists
  useEffect(() => {
    if (draftIdParam) {
      const drafts = getStoredDrafts();
      const draft = drafts.find((d) => d.id === draftIdParam);
      if (draft) {
        setDraftId(draft.id);
        setBookTitle(draft.title);
        setSubject(draft.subject);
        setLanguage(draft.language);
        setDescription(draft.description);
        setChapterTitle(draft.chapterTitle);
        setNotesContent(draft.content);
        setVideoUrl(draft.videoUrl || "");
        if (draft.coverGradient) setCoverGradient(draft.coverGradient);
        setLastSavedTime(draft.lastSavedAt);
        showToast("Restored your saved draft!");
      } else {
        const book = getBookById(draftIdParam);
        if (book) {
          setBookTitle(book.title);
          setSubject(book.subject);
          setLanguage(book.language);
          setDescription(book.description);
          setChapterTitle("Chapter 1: Overview");
          if (book.coverGradient) setCoverGradient(book.coverGradient);
          showToast(`Editing book: "${book.title}"`);
        }
      }
    }
  }, [draftIdParam]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!bookTitle.trim()) errs.title = "Book title is required";
    if (!subject) errs.subject = "Please select a subject";
    if (!chapterTitle.trim()) errs.chapter = "First chapter title is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === "setup") {
      if (validate()) {
        // initialize default notes if empty
        if (!notesContent.trim()) {
          setNotesContent(
            `# ${chapterTitle || "Chapter 1"}\n\nWelcome to **${bookTitle || "this book"}**.\n\n## 1. Overview & Concepts\n\nWrite your ${subject} explanations, key points, and code snippets here...\n\n\`\`\`javascript\n// Sample code block\nconsole.log("Hello from SikhoSikhao!");\n\`\`\`\n\n## 2. Key Takeaways\n- Point 1: Easy to understand\n- Point 2: Interactive coding\n`
          );
        }
        setStep("write");
      }
    } else if (step === "write") {
      setStep("publish");
    }
  };

  // Explicit Save Draft Handler
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await new Promise((r) => setTimeout(r, 600));

    const saved = saveBookDraft({
      id: draftId || undefined,
      title: bookTitle.trim() || "Untitled Book Draft",
      subject: subject || "General",
      language: language || "Hindi + English",
      description: description.trim(),
      chapterTitle: chapterTitle.trim() || "Chapter 1",
      content: notesContent,
      videoUrl: videoUrl,
      coverGradient: coverGradient,
      status: "DRAFT",
    });

    setDraftId(saved.id);
    setLastSavedTime(saved.lastSavedAt);
    setIsSavingDraft(false);
    showToast("✓ Draft saved safely! You can resume anytime from Dashboard.");
  };

  // Publish Book Handler
  const handlePublishBook = async () => {
    if (!bookTitle.trim()) {
      setErrors({ title: "Please provide a book title before publishing." });
      setStep("setup");
      return;
    }

    if (visibility === "draft") {
      await handleSaveDraft();
      router.push("/dashboard");
      return;
    }

    // Ensure Firebase user is synced to localStorage before publishing
    if (firebaseUser) {
      const username = (firebaseUser.email ?? firebaseUser.uid)
        .split("@")[0]
        .replace(/[^a-zA-Z0-9_]/g, "_");
      const existing = getStoredUser();
      if (!existing || existing.id !== firebaseUser.uid) {
        setStoredUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? "User",
          username,
          email: firebaseUser.email ?? "",
          avatar: (firebaseUser.displayName ?? "U").slice(0, 2).toUpperCase(),
          avatarUrl: firebaseUser.photoURL ?? undefined,
          role: "USER",
          joinedAt: "Just now",
          interests: [],
          booksCount: 0,
        });
      }
    }

    setIsPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const newBook = publishNewBook({
      id: draftId,
      title: bookTitle.trim(),
      subject: subject || "Tech",
      language: language || "Hindi + English",
      description:
        description.trim() ||
        `Interactive ${subject} guide covering complete concepts, examples, and hands-on code notes.`,
      chapterTitle: chapterTitle.trim() || "1. Introduction & Overview",
      content:
        notesContent ||
        `# ${chapterTitle || "Chapter 1"}\n\nWelcome to ${bookTitle}! Start reading the chapter notes below.`,
      videoUrl: videoUrl,
      coverGradient: coverGradient,
      tags: [subject.toLowerCase(), "handbook", "coding", "tutorial"],
    });

    setIsPublishing(false);
    setPublishedBook(newBook);
  };

  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100">
      <Navbar />

      {/* Floating Save/Draft Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl glass-strong border border-violet-500/40 text-xs font-semibold text-white shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        {/* Top Action & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            {step !== "setup" && (
              <button
                onClick={() => setStep(step === "publish" ? "write" : "setup")}
                className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:scale-105"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-heading text-white">
                  {step === "setup"
                    ? "Book Studio: Setup"
                    : step === "write"
                    ? "Authoring Content"
                    : "Review & Publish"}
                </h1>
                {lastSavedTime && (
                  <span className="badge badge-purple text-[10px] hidden sm:inline-flex">
                    <Save size={10} /> Saved {lastSavedTime}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {step === "setup"
                  ? "Define your handbook metadata, subject category, and initial chapter title."
                  : step === "write"
                  ? "Write markdown notes or transcribe video lectures with AI."
                  : "Finalize publication settings and make your book live for the community."}
              </p>
            </div>
          </div>

          {/* Persistent Save Draft & Dashboard Buttons in Header */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
              title="Save current progress as a draft"
            >
              {isSavingDraft ? (
                <Loader2 size={13} className="animate-spin text-violet-400" />
              ) : (
                <Save size={13} className="text-violet-400" />
              )}
              <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
            </button>

            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1.5 border border-transparent hover:border-white/10"
            >
              <LayoutDashboard size={13} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 bg-white/[0.02] p-2 rounded-2xl border border-white/[0.06]">
          {(["setup", "write", "publish"] as Step[]).map((s, i) => {
            const labels = ["1. Book Setup", "2. Create Content", "3. Review & Publish"];
            const isDone = ["setup", "write", "publish"].indexOf(step) > i;
            const isCurrent = step === s;
            return (
              <div key={s} className="flex-1 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isDone || isCurrent) setStep(s);
                  }}
                  className={`flex items-center gap-2.5 w-full p-2 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-violet-600/20 border border-violet-500/30 text-white font-semibold shadow-sm"
                      : isDone
                      ? "text-emerald-400 hover:bg-white/[0.04] cursor-pointer"
                      : "text-slate-500 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                        : isCurrent
                        ? "bg-violet-600 text-white shadow"
                        : "bg-white/5 text-slate-500 border border-white/10"
                    }`}
                  >
                    {isDone ? <Check size={12} /> : i + 1}
                  </div>
                  <span className="text-xs truncate">{labels[i]}</span>
                </button>
                {i < 2 && <ChevronRight size={14} className="text-slate-700 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* ===== STEP 1: Setup ===== */}
        {step === "setup" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* Book title */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <label className="text-xs font-semibold text-slate-200 mb-2 block flex items-center justify-between">
                  <span>
                    Book Title <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Give your guide an engaging name
                  </span>
                </label>
                <input
                  id="book-title-input"
                  type="text"
                  value={bookTitle}
                  onChange={(e) => {
                    setBookTitle(e.target.value);
                    setErrors({ ...errors, title: "" });
                  }}
                  placeholder="e.g. Next.js 14 & Full-Stack Architecture Guide"
                  className={`input-field text-base ${
                    errors.title ? "border-rose-500 focus:border-rose-500" : ""
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.title}
                  </p>
                )}
              </div>

              {/* Subject Selection */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <label className="text-xs font-semibold text-slate-200 mb-2.5 block flex items-center justify-between">
                  <span>
                    Subject / Tech Category <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Helps readers discover your book
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSubject(s);
                        setErrors({ ...errors, subject: "" });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        subject === s
                          ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30"
                          : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200 hover:border-white/20"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & First Chapter Title */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold text-slate-200 mb-2 block">
                    Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Hindi + English", "English", "Hindi", "Other"].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs border transition-all ${
                          language === lang
                            ? "bg-violet-600 text-white border-violet-500"
                            : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-200 mb-2 block flex items-center justify-between">
                    <span>
                      First Chapter Title <span className="text-rose-400">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => {
                      setChapterTitle(e.target.value);
                      setErrors({ ...errors, chapter: "" });
                    }}
                    placeholder="e.g. 1. Introduction & Setup"
                    className={`input-field text-xs ${
                      errors.chapter ? "border-rose-500 focus:border-rose-500" : ""
                    }`}
                  />
                  {errors.chapter && (
                    <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.chapter}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <label className="text-xs font-semibold text-slate-200 mb-2 block flex items-center justify-between">
                  <span>Short Summary & Book Overview</span>
                  <span className="text-[10px] text-slate-500">{description.length}/250 chars</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will developers learn in this book? Provide a brief summary of concepts covered..."
                  className="input-field resize-none h-24 text-xs"
                  maxLength={250}
                />
              </div>

              {/* Action Buttons for Setup */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="btn-secondary flex-1 justify-center py-3 text-xs"
                >
                  <Save size={14} className="text-violet-400" />
                  <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  id="step1-continue-btn"
                  className="btn-primary flex-1 justify-center py-3 text-xs"
                >
                  <span>Start Creating Content</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Side: Live Cover Preview */}
            <div className="lg:col-span-4 space-y-5">
              <div className="glass-strong rounded-2xl p-5 border border-white/10">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-violet-400" />
                  Live Card Preview
                </h3>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0f1a] shadow-xl">
                  <div className={`h-28 bg-gradient-to-br ${coverGradient} p-4 flex flex-col justify-between relative`}>
                    <span className="badge badge-purple bg-black/40 text-[10px] self-start backdrop-blur-sm border-white/10">
                      {subject || "Tech Category"}
                    </span>
                    <BookOpen size={28} className="text-white/30 absolute right-4 bottom-3" />
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-bold text-sm text-white line-clamp-1">
                      {bookTitle || "Your Book Title Here"}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {description || "Add a description to tell readers what they will learn in this interactive book."}
                    </p>
                    <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500">
                      <span>{language}</span>
                      <span>1 chapter</span>
                    </div>
                  </div>
                </div>

                {/* Pick Theme Gradient */}
                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-2">
                    Cover Gradient Theme
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {GRADIENTS.map((g, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCoverGradient(g.value)}
                        className={`h-7 rounded-lg bg-gradient-to-br ${g.value} transition-transform ${
                          coverGradient === g.value ? "ring-2 ring-violet-400 scale-105" : "opacity-70 hover:opacity-100"
                        }`}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Write Content ===== */}
        {step === "write" && (
          <div className="space-y-5">
            {/* Book info summary header */}
            <div className="flex items-center justify-between p-4 glass-strong rounded-2xl border border-violet-500/20">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${coverGradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                  {subject.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate">{bookTitle || "Untitled Book"}</p>
                  <p className="text-xs text-slate-400">
                    {subject} · {language} · <strong className="text-violet-300">{chapterTitle || "Chapter 1"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  className="btn-secondary text-xs px-3.5 py-2"
                >
                  <Save size={13} className="text-violet-400" />
                  <span>{isSavingDraft ? "Saving..." : "Save Draft"}</span>
                </button>
              </div>
            </div>

            {/* Tab switch (Markdown Notes vs AI Video Transcriber) */}
            <div className="flex rounded-2xl glass-strong border border-white/10 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => setTab("notes")}
                className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tab === "notes"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={15} />
                <span>Rich Markdown Notes Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setTab("tutorial")}
                className={`flex items-center gap-2 flex-1 justify-center px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  tab === "tutorial"
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles size={15} className="text-cyan-300" />
                <span>Video Lecture to Notes AI</span>
              </button>
            </div>

            {/* Content area */}
            {tab === "notes" ? (
              <div className="h-[550px]">
                <NotesEditor
                  initialContent={notesContent}
                  onSave={(updated) => {
                    setNotesContent(updated);
                    handleSaveDraft();
                  }}
                />
              </div>
            ) : (
              <div className="glass-strong rounded-2xl border border-white/10 p-6">
                <TutorialUploader
                  onComplete={(generatedNotes) => {
                    setNotesContent(generatedNotes);
                    setVideoUrl("https://youtube.com/watch?v=sample");
                    showToast("AI Generated notes applied to chapter!");
                    setTab("notes");
                  }}
                />
              </div>
            )}

            {/* Bottom Actions for Step 2 */}
            <div className="flex items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="btn-secondary px-5 py-3 text-xs"
              >
                <ArrowLeft size={14} />
                <span>Back to Setup</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="btn-secondary flex-1 justify-center py-3 text-xs"
              >
                <Save size={14} className="text-violet-400" />
                <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft"}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                id="step2-review-btn"
                className="btn-primary flex-1 justify-center py-3 text-xs shadow-lg shadow-violet-600/30"
              >
                <Sparkles size={15} />
                <span>Review & Publish Book</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Publish & Review ===== */}
        {step === "publish" && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Publication Preview Card */}
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white font-heading">
                  Publication Summary
                </h2>
                <span className="badge badge-green text-[10px]">Ready to Publish</span>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${coverGradient} flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg`}
                >
                  {subject.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white mb-1">
                    {bookTitle || "Untitled Book"}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="badge badge-purple">{subject}</span>
                    <span className="badge badge-blue">{language}</span>
                    <span className="text-[11px] text-slate-400">
                      📖 Chapter: <strong className="text-slate-200">{chapterTitle}</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({notesContent.length} characters)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Visibility Option
              </label>
              <div className="space-y-3">
                <label
                  onClick={() => setVisibility("public")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    visibility === "public"
                      ? "bg-violet-600/15 border-violet-500/40 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                    className="mt-1 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">
                        Public — Publish immediately
                      </span>
                      <span className="badge badge-green text-[9px]">Recommended</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">
                      Listed publicly in the SikhoSikhao Library for all developers to read and learn.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setVisibility("draft")}
                  className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                    visibility === "draft"
                      ? "bg-violet-600/15 border-violet-500/40 shadow-sm"
                      : "bg-white/[0.02] border-white/[0.06] hover:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === "draft"}
                    onChange={() => setVisibility("draft")}
                    className="mt-1 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white">
                        Draft — Keep Private
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-normal">
                      Only accessible to you in your Creator Dashboard. Publish whenever you feel ready.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Living Book info callout */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
              <Sparkles size={18} className="text-violet-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-white mb-0.5">Living Book Architecture</p>
                <p className="text-slate-400">
                  Publishing now creates Chapter 1. You can add more chapters, quizzes, and videos at any time from your Creator Dashboard.
                </p>
              </div>
            </div>

            {/* Final Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("write")}
                className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs"
              >
                <ArrowLeft size={14} />
                <span>Back to Edit</span>
              </button>

              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="btn-secondary w-full sm:flex-1 justify-center py-3 text-xs"
              >
                <Save size={14} className="text-violet-400" />
                <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft Only"}</span>
              </button>

              <button
                type="button"
                onClick={handlePublishBook}
                disabled={isPublishing}
                id="final-publish-btn"
                className="btn-primary w-full sm:flex-1 justify-center py-3.5 text-sm font-semibold shadow-xl shadow-violet-600/40 animate-pulse-glow"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Publishing Book Live...</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={16} />
                    <span>Publish Book Live! 🎉</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Published Celebration Modal */}
      {publishedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl glass-strong border border-violet-500/30 p-6 sm:p-8 shadow-2xl shadow-black text-center">
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-violet-500/30">
              <Sparkles size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white font-heading mb-1">
              Book Published Successfully! 🎉
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-md mx-auto">
              Your book <strong className="text-violet-300">"{publishedBook.title}"</strong> is now live in the SikhoSikhao Library for learners to read!
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Author:</span>
                <span className="font-semibold text-white">{publishedBook.author}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Subject:</span>
                <span className="badge badge-purple">{publishedBook.subject}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Public Link:</span>
                <span className="text-violet-400 font-mono text-[11px]">
                  sikhosikhao.app/book/{publishedBook.id}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={`/book/${publishedBook.id}`}
                className="btn-primary justify-center py-3 text-xs"
              >
                <Eye size={14} />
                <span>Read Your Book</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary justify-center py-3 text-xs"
              >
                <LayoutDashboard size={14} />
                <span>Go to Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07080e] flex items-center justify-center text-slate-400">
          <Loader2 size={24} className="animate-spin text-violet-500" />
        </div>
      }
    >
      <CreateBookContent />
    </Suspense>
  );
}
