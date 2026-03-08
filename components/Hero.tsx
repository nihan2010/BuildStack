"use client";

import { useState, useRef } from "react";
import { Search, Zap, ArrowRight, Globe } from "lucide-react";

interface HeroProps {
  onAnalyze: (url: string) => void;
  isScanning: boolean;
}

const EXAMPLE_SITES = [
  "stripe.com",
  "vercel.com",
  "linear.app",
  "github.com",
  "notion.so",
];

export default function Hero({ onAnalyze, isScanning }: HeroProps) {
  const [url, setUrl] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (url.trim() && !isScanning) {
      onAnalyze(url.trim());
    }
  };

  const handleExample = (site: string) => {
    setUrl(site);
    inputRef.current?.focus();
    setTimeout(() => onAnalyze(site), 80);
  };

  return (
    <section className="relative flex flex-col items-center justify-center px-4 pt-28 pb-20">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,217,255,0.25) 0%, rgba(139,92,246,0.15) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute left-1/4 top-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-1/4 top-1/3 w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Badge */}
      <div className="relative mb-6 flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 text-xs font-mono text-accent-cyan">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
        </span>
        Free · No account required · Instant results
      </div>

      {/* Headline */}
      <h1
        className="relative text-center font-display font-bold leading-[1.05] tracking-tight mb-5"
        style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
      >
        Discover The Technology
        <br />
        <span className="gradient-text">Behind Any Website</span>
      </h1>

      <p className="relative text-center text-text-secondary text-lg max-w-xl mb-10 leading-relaxed">
        Paste a URL and instantly see the frameworks, infrastructure, and tools
        powering any site — in seconds.
      </p>

      {/* Search form */}
      <div className="relative w-full max-w-2xl">
        {/* Animated border */}
        {focused && (
          <div className="absolute -inset-[1px] rounded-2xl animated-border opacity-70 blur-[0.5px]" />
        )}

        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-0 rounded-2xl border border-bg-border bg-bg-elevated overflow-hidden"
          style={{
            boxShadow: focused
              ? "0 0 0 1px rgba(0,217,255,0.3), 0 8px 32px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Globe icon */}
          <div className="flex-shrink-0 pl-4 pr-2">
            <Globe className="w-4 h-4 text-text-muted" />
          </div>

          {/* URL input */}
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Enter website URL..."
            className="flex-1 bg-transparent py-4 text-text-primary placeholder-text-muted font-mono text-sm outline-none"
            disabled={isScanning}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={!url.trim() || isScanning}
            className="flex-shrink-0 flex items-center gap-2 m-1.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: url.trim() && !isScanning
                ? "linear-gradient(135deg, #00D9FF, #8B5CF6)"
                : "#1F2937",
              color: url.trim() && !isScanning ? "#080A0F" : "#6B7280",
              boxShadow: url.trim() && !isScanning
                ? "0 0 16px rgba(0,217,255,0.3)"
                : "none",
            }}
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Scanning
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze Stack
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick examples */}
      <div className="relative flex flex-wrap items-center justify-center gap-2 mt-5">
        <span className="text-text-muted text-xs font-mono">Try:</span>
        {EXAMPLE_SITES.map((site) => (
          <button
            key={site}
            onClick={() => handleExample(site)}
            disabled={isScanning}
            className="px-3 py-1 rounded-lg text-xs font-mono border border-bg-border text-text-secondary hover:border-accent-cyan/40 hover:text-accent-cyan hover:bg-accent-cyan/5 transition-all duration-200 disabled:opacity-50"
          >
            {site}
          </button>
        ))}
      </div>
    </section>
  );
}
