"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookCard from "@/components/book/BookCard";
import { MOCK_BOOKS } from "@/lib/mockData";
import {
  BookOpen,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  CheckCircle2,
  TrendingUp,
  Video,
  FileText,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Play,
  Search,
  Code2,
  Terminal,
  Bookmark,
  Share2,
} from "lucide-react";

const STATS = [
  { label: "Books Published", value: "1,200+", icon: BookOpen, color: "from-violet-500 to-indigo-500", glow: "rgba(139, 92, 246, 0.25)" },
  { label: "Active Readers", value: "45,000+", icon: Users, color: "from-blue-500 to-cyan-500", glow: "rgba(59, 130, 246, 0.25)" },
  { label: "Tech Topics", value: "80+", icon: Globe, color: "from-emerald-500 to-teal-500", glow: "rgba(16, 185, 129, 0.25)" },
  { label: "AI Notes Generated", value: "3,500+", icon: Sparkles, color: "from-amber-500 to-orange-500", glow: "rgba(245, 158, 11, 0.25)" },
];

const FEATURES = [
  {
    icon: FileText,
    title: "Daily Notes → Living Book",
    description: "Write notes daily as you learn. The platform automatically organizes them into structured chapters and an interactive book.",
    color: "from-violet-500 to-purple-600",
    badge: "Core Feature",
  },
  {
    icon: Video,
    title: "Tutorial Video → AI Notes",
    description: "Upload a screen recording or tutorial. AI listens and instantly generates chapter notes, code snippets, and summaries.",
    color: "from-blue-500 to-cyan-600",
    badge: "AI Powered",
  },
  {
    icon: Zap,
    title: "Publish Anytime, Update Live",
    description: "Publish as soon as one topic is ready. No need to wait for a full book. Updates sync live to your readers.",
    color: "from-amber-500 to-orange-600",
    badge: "Instant Sync",
  },
  {
    icon: Shield,
    title: "Creator = Reader",
    description: "Publish your books and read notes from others with a single account. Zero gatekeeping, 100% free community.",
    color: "from-emerald-500 to-teal-600",
    badge: "Open Community",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create an Account",
    description: "A simple signup gives you full Creator and Reader access. No credit card required.",
  },
  {
    step: "02",
    title: "Start a New Book",
    description: "Give it a title and select a category (e.g., Next.js, Python, DSA, System Design).",
  },
  {
    step: "03",
    title: "Write Notes or Upload Video",
    description: "Write notes in a clean markdown editor or generate AI notes from your tutorial videos.",
  },
  {
    step: "04",
    title: "Share with the Community",
    description: "Click publish and your book goes live instantly. Readers can read, bookmark, and engage.",
  },
];

const FILTER_TOPICS = ["All", "Next.js", "Python", "React", "Java", "DSA", "Database"];

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [markedDone, setMarkedDone] = useState(false);

  const filteredBooks = selectedTopic === "All"
    ? MOCK_BOOKS.slice(0, 6)
    : MOCK_BOOKS.filter((b) => b.subject.toLowerCase() === selectedTopic.toLowerCase()).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#07080e] relative overflow-hidden text-slate-100">
      <Navbar />

      {/* Ambient background glows */}
      <div className="orb w-[650px] h-[650px] bg-violet-600/15 -top-40 left-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="orb w-[450px] h-[450px] bg-cyan-600/10 top-96 -right-20 pointer-events-none" />
      <div className="orb w-[500px] h-[500px] bg-indigo-600/10 top-[1400px] -left-20 pointer-events-none" />

      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 max-w-7xl mx-auto z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-8 hover:border-violet-500/30 transition-all shadow-lg shadow-black/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">
              Learn. Write. Share.
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-violet-300 font-medium">100% Free College & Community Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-white drop-shadow-sm">Turn Your Notes Into</span>
            <br />
            <span className="gradient-text drop-shadow-lg">Living Digital Books.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Write what you learn and teach what you master. 
            Generate <span className="text-cyan-300 font-medium">AI-powered notes</span> from tutorial videos or write in markdown — everything structured in one place.
          </p>

          {/* Call to Action */}
          <div className="flex items-center justify-center gap-3.5 mb-12">
            <Link
              href="/library"
              className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto justify-center font-semibold shadow-lg shadow-violet-600/30"
            >
              <BookOpen size={18} />
              Explore Books & Notes
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-slate-400">
            <div className="flex -space-x-2.5">
              {["AS", "PV", "RG", "SK", "VP"].map((initials, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#07080e] flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                  style={{
                    background: `linear-gradient(135deg, hsl(${245 + i * 25}, 80%, 55%), hsl(${280 + i * 20}, 75%, 45%))`,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400" />
                ))}
              </div>
              <span className="font-semibold text-white">4.9/5</span>
              <span>· 45,000+ Readers trust SikhoSikhao</span>
            </div>
          </div>
        </div>

        {/* ===== HERO INTERACTIVE MOCKUP ===== */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="relative group">
            {/* Ambient backlight glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600/30 via-indigo-600/20 to-cyan-500/30 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Window Container */}
            <div className="relative glass-strong rounded-2xl border border-white/[0.12] overflow-hidden shadow-2xl shadow-black/80">
              {/* Window Header / Mac Chrome */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#0d0f1a] border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                
                {/* Simulated URL pill */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400">https://</span>
                  <span>sikhosikhao.com/book/nextjs-fullstack/chapter-1</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles size={10} />
                    Live Reader
                  </span>
                </div>
              </div>

              {/* Reader Split View */}
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] bg-[#090b14]">
                {/* Left Chapter Nav (Desktop) */}
                <div className="hidden md:block md:col-span-4 border-r border-white/[0.08] p-4 bg-[#0a0c16]/50">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Table of Contents
                    </span>
                    <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                      4 Chapters
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { num: "01", title: "App Router & Server Components", active: true, time: "8 min" },
                      { num: "02", title: "Dynamic Routing & Route Handlers", active: false, time: "12 min" },
                      { num: "03", title: "Server Actions & Mutations", active: false, time: "10 min" },
                      { num: "04", title: "Authentication & Middleware", active: false, time: "15 min" },
                    ].map((ch) => (
                      <div
                        key={ch.num}
                        className={`p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                          ch.active
                            ? "bg-violet-600/20 border border-violet-500/30 text-white font-medium shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className={ch.active ? "text-violet-400 font-bold" : "text-slate-600 font-mono"}>
                            {ch.num}
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono ml-2 flex-shrink-0">
                          {ch.time}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Note Summary pill */}
                  <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-violet-950/40 to-indigo-950/30 border border-violet-500/20">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 mb-1">
                      <Sparkles size={13} className="text-cyan-400" />
                      AI Generated Key Points
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Server components render on the server by default. No client-side JS bundle is sent!
                    </p>
                  </div>
                </div>

                {/* Right Content Area */}
                <div className="col-span-1 md:col-span-8 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="badge badge-purple text-[10px]">Chapter 1</span>
                      <span className="text-xs text-slate-400 font-medium">8 min read · Updated today</span>
                    </div>

                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
                      Understanding Next.js Server Components
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      In React 19 and Next.js App Router, components{" "}
                      <span className="text-violet-300 font-semibold">execute on the server by default</span>.
                      This enables faster initial page loads and direct database queries without an extra API layer:
                    </p>

                    {/* Syntax Highlighted Code Box */}
                    <div className="rounded-xl bg-[#060810] border border-white/[0.08] p-4 font-mono text-xs text-slate-300 mb-5 shadow-inner">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] pb-2 mb-2 border-b border-white/[0.06]">
                        <span>app/book/[id]/page.tsx</span>
                        <span className="text-emerald-400 font-semibold">Server Component</span>
                      </div>
                      <p>
                        <span className="text-violet-400">export default async function</span>{" "}
                        <span className="text-cyan-300">BookPage</span>({`{ params }`}) {"{"}
                      </p>
                      <p className="pl-4">
                        <span className="text-slate-500">// Direct database fetch — Zero client bundle cost</span>
                      </p>
                      <p className="pl-4">
                        <span className="text-violet-400">const</span> book ={" "}
                        <span className="text-amber-300">await</span> db.book.
                        <span className="text-blue-300">findUnique</span>({`{ where: { id: params.id } }`});
                      </p>
                      <p className="pl-4">
                        <span className="text-violet-400">return</span> &lt;
                        <span className="text-cyan-300">BookReader</span> book={"{book}"} /&gt;;
                      </p>
                      <p>{"}"}</p>
                    </div>
                  </div>

                  {/* Interactive Footer in Mockup */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.08]">
                    <button
                      onClick={() => setMarkedDone(!markedDone)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        markedDone
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-white/[0.04] text-slate-300 border border-white/10 hover:bg-white/[0.08]"
                      }`}
                    >
                      <CheckCircle2 size={14} className={markedDone ? "text-emerald-400" : "text-slate-500"} />
                      {markedDone ? "Completed! ✓" : "Mark Chapter as Complete"}
                    </button>

                    <Link
                      href="/book/1/chapter/ch1"
                      className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform"
                    >
                      Try Interactive Reader
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-14 border-y border-white/[0.08] relative z-10 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map(({ label, value, icon: Icon, color, glow }) => (
              <div
                key={label}
                className="glass-card rounded-2xl p-5 border border-white/[0.08] flex items-center gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}
                  style={{ boxShadow: `0 0 20px ${glow}` }}
                >
                  <Icon size={22} className="text-white drop-shadow-sm" />
                </div>
                <div>
                  <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {value}
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag mx-auto mb-4">
            <Sparkles size={12} />
            Everything on One Platform
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Read, Write, and Teach Together
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Notes used to get lost in isolated folders. SikhoSikhao turns them into structured digital books that stay alive and up to date.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {FEATURES.map(({ icon: Icon, title, description, color, badge }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-7 border border-white/[0.08] hover:border-violet-500/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="badge badge-purple text-[10px] font-semibold">{badge}</span>
                </div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-xs text-violet-400 font-semibold">
                Explore feature <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4 STEPS ROADMAP ===== */}
      <section className="py-24 bg-[#0a0c16]/70 border-y border-white/[0.08] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-tag mx-auto mb-4">
              <Zap size={12} />
              Quick Setup
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Get Started in 4 Simple Steps
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Publishing your first book is so seamless that anyone can get started in just 2 minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {HOW_IT_WORKS.map(({ step, title, description }, idx) => (
              <div
                key={step}
                className="glass-card rounded-2xl p-6 border border-white/[0.08] flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-xl group-hover:bg-violet-600/15 transition-all" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading text-3xl font-black gradient-text">
                      {step}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs text-slate-400 font-mono">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth/register"
              className="btn-primary text-sm px-8 py-3.5 inline-flex"
            >
              Create Free Account Now
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== POPULAR BOOKS SECTION ===== */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="section-tag mb-3">
              <TrendingUp size={12} />
              Trending Books
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white">
              Popular Books & Notes
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Active books created by top developers and learners in the community
            </p>
          </div>

          {/* Topic Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {FILTER_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTopic === topic
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} {...book} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/library"
            className="btn-secondary text-sm px-8 py-3 inline-flex items-center gap-2"
          >
            Explore All Books in Library ({MOCK_BOOKS.length}+)
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ===== TWO PATHS SECTION ===== */}
      <section className="py-24 bg-[#090b14] border-t border-white/[0.08] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="section-tag mx-auto mb-4">
              <Code2 size={12} />
              Flexible Creation Paths
            </div>
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mb-4">
              Your Style, Your Choice
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Prefer writing markdown or recording video tutorials? SikhoSikhao provides tailored workflows for both.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Path A */}
            <div className="glass-card rounded-3xl p-8 border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <FileText size={26} className="text-white" />
                </div>
                <span className="badge badge-purple text-[10px] mb-2">Text & Markdown</span>
                <h3 className="font-heading text-2xl font-bold text-white mb-3">
                  Path A — Build Books from Notes
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Add code snippets and markdown notes daily as you learn. The platform automatically organizes them into readable chapters.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Rich Markdown Editor with Code Highlight",
                    "Organize chapters topic by topic",
                    "Publish and update live at any stage",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/create?tab=notes" className="btn-primary w-full justify-center py-3 text-sm font-semibold">
                Start Writing Notes
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Path B */}
            <div className="glass-card rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <Video size={26} className="text-white" />
                </div>
                <span className="badge badge-cyan text-[10px] mb-2">AI Video Transcription</span>
                <h3 className="font-heading text-2xl font-bold text-white mb-3">
                  Path B — AI Notes from Video Tutorials
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Upload your screen recording or tutorial video. AI transcribes the audio, generates chapter topics, markdown explanations, and code blocks!
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Supports MP4, MOV, WebM uploads",
                    "AI automatically detects key tech concepts",
                    "Video + Notes synced in a unified reader",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/create?tab=tutorial" className="btn-secondary w-full justify-center py-3 text-sm font-semibold">
                <Play size={15} className="text-cyan-400" />
                Upload Tutorial Video
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INSPIRATIONAL VISION QUOTE ===== */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <div className="glass-card rounded-3xl p-8 sm:p-14 border border-violet-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <span className="text-6xl text-violet-400/30 font-serif block mb-2">&ldquo;</span>
            <blockquote className="font-heading text-xl sm:text-2xl font-semibold text-slate-100 leading-relaxed mb-6">
              Teach — not just for recognition, but because someone will walk the path you struggled through,
              and what you wrote will light their way.
            </blockquote>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
              — SikhoSikhao Vision Statement
            </p>
          </div>
        </div>
      </section>

      {/* ===== FINAL CALL TO ACTION ===== */}
      <section className="py-20 border-t border-white/[0.08] relative z-10 bg-gradient-to-b from-transparent to-violet-950/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Start Your First Book Today 📚
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Free forever. Every great book begins with a single topic.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/library"
              className="btn-primary text-base px-9 py-3.5 w-full sm:w-auto justify-center shadow-lg shadow-violet-600/30"
            >
              <BookOpen size={18} />
              Browse Library & Read Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
