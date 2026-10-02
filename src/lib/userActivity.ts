"use client";

export interface UserActivityData {
  readBookIds: string[];
  completedChapterIds: string[];
  lastRead?: {
    bookId: string;
    bookTitle: string;
    chapterId: string;
    chapterTitle: string;
    readAt: string;
  };
  bookmarks: string[];
}

const ACTIVITY_STORAGE_PREFIX = "sikhosikhao_activity_";

function getStorageKey(userIdentifier?: string): string {
  const clean = (userIdentifier || "guest").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  return `${ACTIVITY_STORAGE_PREFIX}${clean}`;
}

export function getUserActivity(userIdentifier?: string): UserActivityData {
  if (typeof window === "undefined") {
    return { readBookIds: [], completedChapterIds: [], bookmarks: [] };
  }
  try {
    const key = getStorageKey(userIdentifier);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { readBookIds: [], completedChapterIds: [], bookmarks: [] };
    }
    return JSON.parse(raw) as UserActivityData;
  } catch (err) {
    console.error("Error reading user activity:", err);
    return { readBookIds: [], completedChapterIds: [], bookmarks: [] };
  }
}

export function saveUserActivity(userIdentifier: string | undefined, data: UserActivityData): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStorageKey(userIdentifier);
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event("user-activity-updated"));
  } catch (err) {
    console.error("Error saving user activity:", err);
  }
}

export function recordBookRead(
  userIdentifier: string | undefined,
  bookId: string,
  bookTitle?: string,
  chapterId?: string,
  chapterTitle?: string
): void {
  if (!bookId) return;
  const activity = getUserActivity(userIdentifier);
  if (!activity.readBookIds.includes(bookId)) {
    activity.readBookIds.unshift(bookId);
  }
  if (chapterId && bookTitle && chapterTitle) {
    activity.lastRead = {
      bookId,
      bookTitle,
      chapterId,
      chapterTitle,
      readAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }
  saveUserActivity(userIdentifier, activity);
}

export function toggleChapterComplete(
  userIdentifier: string | undefined,
  chapterId: string,
  bookId?: string
): boolean {
  if (!chapterId) return false;
  const activity = getUserActivity(userIdentifier);
  const exists = activity.completedChapterIds.includes(chapterId);
  if (exists) {
    activity.completedChapterIds = activity.completedChapterIds.filter((id) => id !== chapterId);
  } else {
    activity.completedChapterIds.push(chapterId);
    if (bookId && !activity.readBookIds.includes(bookId)) {
      activity.readBookIds.unshift(bookId);
    }
  }
  saveUserActivity(userIdentifier, activity);
  return !exists;
}

export function isChapterCompleted(
  userIdentifier: string | undefined,
  chapterId: string
): boolean {
  if (!chapterId) return false;
  const activity = getUserActivity(userIdentifier);
  return activity.completedChapterIds.includes(chapterId);
}

export function calculateUserProgress(
  publishedBooksCount: number,
  draftsCount: number,
  completedChaptersCount: number
): { progressPercent: number; summary: string } {
  // Goal based on real user actions:
  // Target: 4 total activity milestones (e.g. 1 book published or 4 chapters read)
  // Each published book = 40%, each completed chapter = 20%, each draft = 10%
  const score = publishedBooksCount * 40 + completedChaptersCount * 20 + draftsCount * 10;
  const progressPercent = Math.min(100, score);

  let summary = "0% Activity";
  if (score === 0) {
    summary = "Start your learning journey";
  } else if (score < 40) {
    summary = `${progressPercent}% Beginner progress`;
  } else if (score < 80) {
    summary = `${progressPercent}% Active Creator & Reader`;
  } else {
    summary = `${progressPercent}% Top Contributor`;
  }

  return { progressPercent, summary };
}
