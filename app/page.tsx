"use client";

import { useState, useCallback } from "react";
import type { ScanResult } from "@/types";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ScanningAnimation from "@/components/ScanningAnimation";
import Results from "@/components/Results";

type AppState = "idle" | "scanning" | "results" | "error";

export default function HomePage() {
  const [state, setState] = useState<AppState>("idle");
  const [scanURL, setScanURL] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAnalyze = useCallback(async (url: string) => {
    setScanURL(url);
    setState("scanning");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Scan failed");
      }

      // Small delay so users see the animation complete
      await new Promise((r) => setTimeout(r, 600));

      setResult(data.data);
      setState("results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      setState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setState("idle");
    setResult(null);
    setScanURL("");
    setErrorMsg("");
  }, []);

  return (
    <div className="min-h-screen bg-bg-base grid-bg">
      <Navbar />

      <main className="pt-14">
        {/* ── IDLE / HERO ── */}
        {(state === "idle" || state === "scanning") && (
          <>
            <Hero onAnalyze={handleAnalyze} isScanning={state === "scanning"} />

            {/* Scanning animation */}
            {state === "scanning" && (
              <div className="flex justify-center mt-4 mb-12">
                <ScanningAnimation url={scanURL} />
              </div>
            )}

            {/* Feature strip */}
            {state === "idle" && (
              <section className="max-w-5xl mx-auto px-4 pb-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: "⚛️", label: "Frontend Frameworks", desc: "React, Vue, Angular, Svelte & more" },
                    { icon: "☁️", label: "Hosting & CDN", desc: "Vercel, AWS, Cloudflare, Netlify" },
                    { icon: "📊", label: "Analytics Tools", desc: "GA4, Mixpanel, Hotjar, Segment" },
                    { icon: "💳", label: "Payment Systems", desc: "Stripe, PayPal and more" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-col gap-2 p-4 rounded-xl border border-bg-border bg-bg-elevated hover:border-accent-cyan/20 transition-all duration-200"
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-sm text-text-primary">{item.label}</span>
                      <span className="text-xs text-text-muted leading-relaxed">{item.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap justify-center gap-8 mt-12 py-8 border-t border-bg-border">
                  {[
                    { value: "40+", label: "Technologies detected" },
                    { value: "<5s", label: "Average scan time" },
                    { value: "Free", label: "No account needed" },
                    { value: "Open", label: "Source code available" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display font-bold text-2xl gradient-text">{stat.value}</div>
                      <div className="text-xs text-text-muted mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mb-5">
              ⚠️
            </div>
            <h2 className="font-display font-bold text-xl text-text-primary mb-2">
              Scan Failed
            </h2>
            <p className="text-text-muted text-sm mb-6 text-center max-w-sm">
              {errorMsg}
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #00D9FF, #8B5CF6)",
                color: "#080A0F",
                boxShadow: "0 0 16px rgba(0,217,255,0.3)",
              }}
            >
              ← Try Again
            </button>
          </div>
        )}

        {/* ── RESULTS ── */}
        {state === "results" && result && (
          <Results result={result} onReset={handleReset} />
        )}
      </main>

      {/* Footer */}
      {state === "idle" && (
        <footer className="border-t border-bg-border py-6 text-center text-xs text-text-muted font-mono flex flex-col gap-2">
          <div>BuildStack · Open source tech stack analyzer · Built with Next.js</div>
          <div>
            Made from kerala with love ❤️ ,{" "}
            <a href="https://nihannajeeb.in" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors underline decoration-bg-border underline-offset-4">
              link to nihannajeeb.in
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
