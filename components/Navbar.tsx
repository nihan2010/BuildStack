"use client";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-bg-border/50 backdrop-blur-xl">
      <div
        className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between"
        style={{ backgroundColor: "rgba(8,10,15,0.8)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #00D9FF, #8B5CF6)",
              boxShadow: "0 0 12px rgba(0,217,255,0.3)",
            }}
          >
            ⚡
          </div>
          <span className="font-display font-bold text-text-primary">
            Build<span className="text-accent-cyan">Stack</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
          <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
          <a href="#" className="hover:text-text-primary transition-colors">API</a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
        </nav>

        {/* CTA */}
        <button
          className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-bg-border text-text-secondary hover:border-accent-cyan/30 hover:text-accent-cyan transition-all duration-200"
        >
          <span>★</span> Star on GitHub
        </button>
      </div>
    </header>
  );
}
