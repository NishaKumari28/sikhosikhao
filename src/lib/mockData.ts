// Centralized mock data for the entire app
// Replace these with real API calls once backend is ready

export interface Book {
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
  language: string;
  tags: string[];
  isNew?: boolean;
  isTrending?: boolean;
  description: string;
  progress?: number;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
  isPublished: boolean;
  estimatedReadTime: number;
}

export interface Topic {
  id: string;
  title: string;
  type: "notes" | "video" | "ai-notes";
  isCompleted?: boolean;
  isLocked?: boolean;
  duration?: number;
  content?: string;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: "1",
    title: "Getting Started with Python: Complete Beginner's Guide",
    author: "Demo User",
    authorUsername: "demouser",
    subject: "Python",
    chaptersCount: 12,
    readersCount: 3420,
    rating: 4.8,
    hasVideo: true,
    isAIGenerated: false,
    updatedAt: "2 days ago",
    language: "English",
    tags: ["python", "beginners", "programming"],
    isNew: false,
    isTrending: true,
    description: "Learning Python is intuitive and straightforward with the right guidance! This book covers everything from basic syntax to advanced concepts.",
    coverGradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "2",
    title: "Next.js 14 — Full Stack Development",
    author: "Demo User",
    authorUsername: "demouser",
    subject: "Next.js",
    chaptersCount: 8,
    readersCount: 1850,
    rating: 4.9,
    hasVideo: true,
    isAIGenerated: true,
    updatedAt: "5 hours ago",
    language: "English",
    tags: ["nextjs", "react", "fullstack", "javascript"],
    isNew: true,
    isTrending: true,
    description: "The complete guide to Next.js 14 — App Router, Server Components, Authentication, and Database integration all in one place.",
    coverGradient: "from-purple-600 to-blue-500",
  },
  {
    id: "3",
    title: "Java OOP Concepts Explained Clearly",
    author: "Rahul Gupta",
    authorUsername: "rahul_java",
    subject: "Java",
    chaptersCount: 15,
    readersCount: 5200,
    rating: 4.7,
    hasVideo: false,
    isAIGenerated: false,
    updatedAt: "1 week ago",
    language: "English",
    tags: ["java", "oop", "programming"],
    isNew: false,
    isTrending: false,
    description: "Object-Oriented Programming in Java — Classes, Objects, Inheritance, Polymorphism — explained clearly with real-world code examples.",
    coverGradient: "from-red-500 to-orange-400",
  },
  {
    id: "4",
    title: "React Hooks — Complete Reference",
    author: "Sneha Patel",
    authorUsername: "sneha_dev",
    subject: "React",
    chaptersCount: 10,
    readersCount: 2100,
    rating: 4.6,
    hasVideo: true,
    isAIGenerated: true,
    updatedAt: "3 days ago",
    language: "English",
    tags: ["react", "hooks", "javascript", "frontend"],
    isNew: true,
    isTrending: false,
    description: "Master useState, useEffect, useContext, useReducer, and custom hooks with clean, practical examples.",
    coverGradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "5",
    title: "DSA for Tech Interviews & Placements",
    author: "Vikash Kumar",
    authorUsername: "vikash_dsa",
    subject: "DSA",
    chaptersCount: 20,
    readersCount: 8900,
    rating: 4.9,
    hasVideo: true,
    isAIGenerated: false,
    updatedAt: "1 day ago",
    language: "English",
    tags: ["dsa", "algorithms", "placements", "competitive"],
    isNew: false,
    isTrending: true,
    description: "Arrays, Linked Lists, Trees, Graphs, and Dynamic Programming — all essential DSA patterns curated for coding interviews.",
    coverGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "6",
    title: "SQL & MySQL — Complete Database Mastery",
    author: "Ananya Singh",
    authorUsername: "ananya_db",
    subject: "Database",
    chaptersCount: 9,
    readersCount: 1230,
    rating: 4.5,
    hasVideo: false,
    isAIGenerated: true,
    updatedAt: "2 weeks ago",
    language: "English",
    tags: ["sql", "mysql", "database", "backend"],
    isNew: false,
    isTrending: false,
    description: "From essential SQL queries to relational schema design — the comprehensive guide to MySQL for developers.",
    coverGradient: "from-blue-600 to-indigo-500",
  },
];

export const MOCK_MY_BOOKS: Book[] = [
  {
    ...MOCK_BOOKS[1],
    progress: 65,
  },
  {
    ...MOCK_BOOKS[0],
    progress: 30,
  },
];

export const MOCK_CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    title: "Introduction & Setup",
    isPublished: true,
    estimatedReadTime: 10,
    topics: [
      {
        id: "t1",
        title: "What is Next.js?",
        type: "notes",
        isCompleted: true,
        content: `# What is Next.js?

Next.js is a **React framework** that provides server-side rendering (SSR), static site generation (SSG), and a complete suite of production-ready features.

## Why use Next.js?

- **File-based routing** — create files in the \`app/\` directory and routes are mapped automatically
- **Server Components** — React Server Components with built-in zero-bundle-size streaming
- **Image Optimization** — Automatic optimization with \`next/image\`
- **API Route Handlers** — Build API endpoints seamlessly within the same project
- **TypeScript Support** — Native TypeScript support out of the box

## Installation

\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## Folder Structure

\`\`\`
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   └── components/
├── public/
└── package.json
\`\`\`

> **Note**: In Next.js 14, the App Router is standard. While the Pages Router is supported, App Router is the recommended modern approach.`,
      },
      {
        id: "t2",
        title: "Installation & First Project",
        type: "video",
        isCompleted: true,
        duration: 12,
      },
      {
        id: "t3",
        title: "Understanding Project Structure",
        type: "notes",
        isCompleted: false,
        content: "# Project Structure\n\nNext.js project structure...",
      },
    ],
  },
  {
    id: "ch2",
    title: "App Router Architecture",
    isPublished: true,
    estimatedReadTime: 20,
    topics: [
      {
        id: "t4",
        title: "App Router vs Pages Router",
        type: "notes",
        isCompleted: false,
      },
      {
        id: "t5",
        title: "Layouts and Templates",
        type: "ai-notes",
        isCompleted: false,
      },
      {
        id: "t6",
        title: "Dynamic Routes",
        type: "video",
        isCompleted: false,
        duration: 15,
        isLocked: false,
      },
    ],
  },
  {
    id: "ch3",
    title: "Server vs Client Components",
    isPublished: true,
    estimatedReadTime: 15,
    topics: [
      {
        id: "t7",
        title: "What are Server Components?",
        type: "notes",
        isCompleted: false,
      },
      {
        id: "t8",
        title: "The 'use client' Directive",
        type: "notes",
        isCompleted: false,
      },
    ],
  },
  {
    id: "ch4",
    title: "Data Fetching & APIs",
    isPublished: false,
    estimatedReadTime: 25,
    topics: [
      {
        id: "t9",
        title: "fetch() in Server Components",
        type: "notes",
        isCompleted: false,
        isLocked: true,
      },
      {
        id: "t10",
        title: "Building API Routes",
        type: "video",
        isCompleted: false,
        duration: 18,
        isLocked: true,
      },
    ],
  },
];

export const TOPICS = [
  "All",
  "Python",
  "JavaScript",
  "React",
  "Next.js",
  "Java",
  "DSA",
  "Database",
  "Node.js",
  "CSS",
  "TypeScript",
  "DevOps",
];

export const CREATOR_STATS = {
  totalBooks: 3,
  totalReaders: 7270,
  totalChapters: 35,
  avgRating: 4.7,
  booksThisMonth: 1,
  readersThisWeek: 320,
};
