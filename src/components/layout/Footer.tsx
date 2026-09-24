import Link from "next/link";
import { BookOpen, Github, Twitter, Heart, ArrowRight } from "lucide-react";

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
              Apni pehli book aaj hi shuru karo 📚
            </h3>
            <p className="text-sm text-slate-400">
              Free hai. Hamesha rahega. Ek topic se shuruat hoti hai.
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
              Seekho. Likho. Sikhao. — Ek Saath.
              <br />
              Har learner ek potential teacher hai.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors border border-white/5 hover:border-purple-500/30"
              >
                <Github size={15} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors border border-white/5 hover:border-purple-500/30"
              >
                <Twitter size={15} />
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
