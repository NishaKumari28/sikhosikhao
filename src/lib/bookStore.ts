"use client";
import { Book, Chapter, MOCK_BOOKS, MOCK_CHAPTERS } from "./mockData";
import { getStoredUser } from "./auth";

export interface BookDraft {
  id: string;
  authorUsername?: string;
  authorId?: string;
  title: string;
  subject: string;
  language: string;
  description: string;
  chapterTitle: string;
  content: string;
  videoUrl?: string;
  lastSavedAt: string;
  coverGradient?: string;
  tags?: string[];
  status: "DRAFT";
}

const CUSTOM_BOOKS_KEY = "sikhosikhao_custom_books";
const DRAFTS_KEY = "sikhosikhao_drafts";

// Helper to get custom published books from localStorage
export function getStoredCustomBooks(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CUSTOM_BOOKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error reading custom books:", err);
    return [];
  }
}

// Get all books (Mock + Custom published)
export function getAllBooks(): Book[] {
  const custom = getStoredCustomBooks();
  // Filter out any duplicates if custom book replaces mock
  const customIds = new Set(custom.map((b) => b.id));
  const base = MOCK_BOOKS.filter((b) => !customIds.has(b.id));
  return [...custom, ...base];
}

// Get single book by ID
export function getBookById(id: string): Book | undefined {
  const all = getAllBooks();
  const found = all.find((b) => b.id === id);
  if (found) return found;

  // Check drafts in case editing
  const drafts = getStoredDrafts();
  const draft = drafts.find((d) => d.id === id);
  if (draft) {
    return {
      id: draft.id,
      title: draft.title,
      author: "You (Draft)",
      authorUsername: draft.authorUsername || "creator",
      subject: draft.subject || "Tech",
      chaptersCount: 1,
      readersCount: 0,
      rating: 5.0,
      hasVideo: !!draft.videoUrl,
      isAIGenerated: false,
      updatedAt: "Draft",
      language: draft.language || "English",
      tags: draft.tags || [draft.subject.toLowerCase()],
      description: draft.description,
      coverGradient: draft.coverGradient || "from-purple-600 to-blue-500",
    };
  }
  return undefined;
}

// Get saved drafts (optionally scoped to logged-in user)
export function getStoredDrafts(authorUsername?: string): BookDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(DRAFTS_KEY);
    const drafts: BookDraft[] = data ? JSON.parse(data) : [];
    if (!authorUsername) return drafts;
    return drafts.filter(
      (d) =>
        d.authorUsername === authorUsername ||
        (!d.authorUsername && authorUsername === "demouser")
    );
  } catch (err) {
    console.error("Error reading drafts:", err);
    return [];
  }
}

// Save a book draft
export function saveBookDraft(draft: Partial<BookDraft>): BookDraft {
  const user = getStoredUser();
  const existing = getStoredDrafts();
  const draftId = draft.id || "draft_" + Date.now();
  const nowStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });

  const fullDraft: BookDraft = {
    id: draftId,
    authorUsername: draft.authorUsername || user?.username || "creator",
    authorId: draft.authorId || (user?.id ? String(user.id) : undefined),
    title: draft.title || "Untitled Draft",
    subject: draft.subject || "General",
    language: draft.language || "English",
    description: draft.description || "",
    chapterTitle: draft.chapterTitle || "Chapter 1",
    content: draft.content || "",
    videoUrl: draft.videoUrl || "",
    lastSavedAt: nowStr,
    coverGradient: draft.coverGradient || "from-purple-600 via-indigo-600 to-blue-600",
    tags: draft.tags || [draft.subject?.toLowerCase() || "guide"],
    status: "DRAFT",
  };

  const index = existing.findIndex((d) => d.id === draftId);
  if (index >= 0) {
    existing[index] = fullDraft;
  } else {
    existing.unshift(fullDraft);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(existing));
    window.dispatchEvent(new Event("books-updated"));
  }

  return fullDraft;
}

// Delete a draft
export function deleteBookDraft(draftId: string): void {
  const existing = getStoredDrafts();
  const updated = existing.filter((d) => d.id !== draftId);
  if (typeof window !== "undefined") {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("books-updated"));
  }
}

// Publish a book
export function publishNewBook(params: {
  id?: string;
  title: string;
  subject: string;
  language: string;
  description: string;
  chapterTitle: string;
  content: string;
  videoUrl?: string;
  coverGradient?: string;
  tags?: string[];
}): Book {
  const user = getStoredUser();
  const authorName = user?.name || "Community Author";
  const authorUsername = user?.username || "creator_" + Date.now();

  const newBookId = params.id && !params.id.startsWith("draft_") ? params.id : "book_" + Date.now();

  const newBook: Book = {
    id: newBookId,
    title: params.title.trim(),
    author: authorName,
    authorUsername: authorUsername,
    subject: params.subject || "Tech",
    chaptersCount: 1,
    readersCount: 1,
    rating: 5.0,
    hasVideo: !!params.videoUrl,
    isAIGenerated: !!params.videoUrl,
    updatedAt: "Just now",
    language: params.language || "Hindi + English",
    tags: params.tags?.length ? params.tags : [params.subject.toLowerCase(), "interactive", "guide"],
    isNew: true,
    isTrending: true,
    description: params.description.trim() || `Comprehensive ${params.subject} handbook and guide published on SikhoSikhao.`,
    coverGradient: params.coverGradient || "from-violet-600 via-indigo-600 to-cyan-500",
  };

  // Save book
  const customBooks = getStoredCustomBooks();
  const existingIdx = customBooks.findIndex((b) => b.id === newBookId);
  if (existingIdx >= 0) {
    customBooks[existingIdx] = newBook;
  } else {
    customBooks.unshift(newBook);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_BOOKS_KEY, JSON.stringify(customBooks));

    // Save chapter / topic content
    const chapterKey = `sikhosikhao_chapters_${newBookId}`;
    const initialChapter: Chapter[] = [
      {
        id: `ch_${newBookId}_1`,
        title: params.chapterTitle || "1. Getting Started",
        isPublished: true,
        estimatedReadTime: Math.max(3, Math.ceil((params.content?.length || 500) / 400)),
        topics: [
          {
            id: `t_${newBookId}_1`,
            title: params.chapterTitle || "Chapter Overview",
            type: params.videoUrl ? "video" : "notes",
            isCompleted: false,
            content: params.content || `# ${params.chapterTitle}\n\nWelcome to ${params.title}!`,
            duration: params.videoUrl ? 15 : undefined,
          },
        ],
      },
    ];
    localStorage.setItem(chapterKey, JSON.stringify(initialChapter));

    // If there was a draft for this, clean it up
    if (params.id && params.id.startsWith("draft_")) {
      deleteBookDraft(params.id);
    }

    window.dispatchEvent(new Event("books-updated"));
  }

  return newBook;
}

// Get Chapters for a specific book
export function getBookChapters(bookId: string): Chapter[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(`sikhosikhao_chapters_${bookId}`);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.error("Error reading book chapters:", err);
    }
  }
  return MOCK_CHAPTERS;
}
