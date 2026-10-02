import Link from "next/link";
import { BookOpen, Heart, ArrowRight, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Platform: [
      { label: "Book Library", href: "/library" },
      { label: "Create a Book", href: "/create" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "AI Features", href: "/create?tab=ai" },
    ],
    Community: [
      { label: "About the Project", href: "/about" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Join as Creator", href: "/auth/register" },
      { label: "Explore Topics", href: "/library" },
    ],
    Topics: [
      { label: "Python", href: "/library?topic=python" },
      { label: "JavaScript", href: "/library?topic=javascript" },
      { label: "Java", href: "/library?topic=java" },
      { label: "React & Next.js", href: "/library?topic=react" },
    ],
  };

  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-purple-900/20 -bottom-48 -left-24" />
      <div className="orb w-64 h-64 bg-blue-900/20 -bottom-32 right-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 relative z-10">
        {/* CTA Banner */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-purple-500/20">
          <div>
            <h3 className="text-lg font-bold text-slate-100 mb-1">
              Start your first book today 📚
            </h3>
            <p className="text-sm text-slate-400">
              It&apos;s free. Always will be. It all starts with one topic.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="btn-primary whitespace-nowrap flex-shrink-0"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text">Sikho</span>
                <span className="text-slate-300">Sikhao</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-4">
              Learn. Write. Share. — Together.
              <br />
              Every learner is a potential teacher.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors border border-white/5 hover:border-purple-500/30"
                title="GitHub"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors border border-white/5 hover:border-purple-500/30"
                title="X (Twitter)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-200 mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="divider mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {currentYear} SikhoSikhao — College Project. Free & Open Source.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart size={11} className="text-red-500 fill-red-500" /> for the learning community
          </p>
        </div>
      </div>
    </footer>
  );
}
