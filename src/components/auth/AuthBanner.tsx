"use client";
import { BookOpen, Sparkles, Code2, Video, Users, CheckCircle2, Award, Zap } from "lucide-react";

interface AuthBannerProps {
  mode: "login" | "register";
}

export default function AuthBanner({ mode }: AuthBannerProps) {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950/40 via-[#0f1123]/80 to-[#07080e]/90 border border-white/10 shadow-2xl backdrop-blur-2xl">
      {/* Background ambient lighting effects */}
      <div className="orb w-80 h-80 bg-violet-600/20 -top-16 -left-16 pointer-events-none" />
      <div className="orb w-72 h-72 bg-cyan-500/15 bottom-0 right-0 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles size={13} className="text-violet-400 animate-pulse" />
          <span>Learn • Build • Share</span>
        </div>

        <h2 className="text-3xl xl:text-4xl font-bold font-heading text-white tracking-tight leading-tight mb-3">
          {mode === "login" ? (
            <>
              Welcome back to your <span className="gradient-text">learning journey</span>.
            </>
          ) : (
            <>
              One account for both <span className="gradient-text">Creator & Reader</span>.
            </>
          )}
        </h2>

        <p className="text-slate-400 text-sm xl:text-base leading-relaxed max-w-lg">
          Join thousands of developers and educators reading comprehensive tech books, taking interactive notes, and publishing guides for free.
        </p>
      </div>

      {/* Feature Highlights Cards */}
      <div className="relative z-10 my-8 space-y-3.5">
        <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-violet-500/40 transition-all group">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 text-violet-300 group-hover:scale-105 transition-transform">
              <BookOpen size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                Rich Markdown & Code Notes
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  Syntax Highlighting
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Read and write structured chapter guides with code blocks, tips, and downloadable references.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-violet-500/40 transition-all group">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-cyan-300 group-hover:scale-105 transition-transform">
              <Video size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                Video to Chapter Notes AI
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  AI Transcribe
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Transcribe and auto-generate readable study notes directly from video lectures in minutes.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/10 hover:border-violet-500/40 transition-all group">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 text-emerald-300 group-hover:scale-105 transition-transform">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                Instant Creator Studio
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  0 Friction
                </span>
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                No complex verification needed. Start drafting your first tech handbook right after signup!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof & stats snippet */}
      <div className="relative z-10 pt-4 border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5 overflow-hidden">
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#07080e] bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
              AS
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#07080e] bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
              PV
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#07080e] bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-[10px] font-bold text-white">
              RG
            </div>
            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#07080e] bg-violet-900/80 border border-violet-500/40 flex items-center justify-center text-[10px] font-bold text-violet-300">
              +10k
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">10,000+ Readers & Writers</p>
            <p className="text-[11px] text-slate-400">Collaborating across India & globally</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <Award size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">100% Free</span>
        </div>
      </div>
    </div>
  );
}
