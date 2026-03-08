"use client";

import { useState } from "react";
import type { ScanResult, TechCategory } from "@/types";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CATEGORY_ORDER,
  formatResponseTime,
  getDomain,
} from "@/lib/utils";
import TechBadge from "./TechBadge";
import ScoreRing from "./ScoreRing";
import ArchDiagram from "./ArchDiagram";
import Blueprint from "./Blueprint";
import RawOutput from "./RawOutput";

interface ResultsProps {
  result: ScanResult;
  onReset: () => void;
}

export default function Results({ result, onReset }: ResultsProps) {
  const [activeCategory, setActiveCategory] = useState<TechCategory | "all">("all");
  const domain = getDomain(result.url);

  // Group technologies by category (only categories that have results)
  const categoriesPresent = new Set(result.technologies.map((t) => t.category));
  const orderedCategories = CATEGORY_ORDER.filter((c) => categoriesPresent.has(c));

  const filtered =
    activeCategory === "all"
      ? result.technologies
      : result.technologies.filter((t) => t.category === activeCategory);

  const { performance } = result;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pb-20 space-y-6">
      {/* ── Top bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-xs font-mono text-accent-green">Scan complete</span>
          </div>
          <h2 className="text-xl font-display font-bold text-text-primary">
            {domain}
          </h2>
          <p className="text-sm text-text-muted font-mono mt-0.5">
            {result.technologies.length} technologies detected ·{" "}
            {formatResponseTime(performance.responseTime)} response
          </p>
        </div>
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl border border-bg-border text-sm font-medium text-text-secondary hover:text-text-primary hover:border-accent-cyan/30 transition-all duration-200"
        >
          ← Scan another
        </button>
      </div>

      {/* ── Overview card ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Status",
            value: result.statusCode === 200 ? "Online" : String(result.statusCode),
            sub: result.pageTitle ? result.pageTitle.slice(0, 28) + "…" : "–",
            icon: "🟢",
            color: "#10B981",
          },
          {
            label: "Host",
            value: result.serverInfo.provider || "Unknown",
            sub: result.serverInfo.serverSoftware?.split("/")[0] || "–",
            icon: "☁️",
            color: "#8B5CF6",
          },
          {
            label: "Response",
            value: formatResponseTime(performance.responseTime),
            sub:
              performance.responseTime < 800
                ? "Excellent"
                : performance.responseTime < 2000
                ? "Good"
                : "Slow",
            icon: "⚡",
            color: "#F59E0B",
          },
          {
            label: "Scripts",
            value: String(result.scripts.length),
            sub: "external scripts",
            icon: "📜",
            color: "#00D9FF",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1.5 p-4 rounded-xl border border-bg-border bg-bg-elevated"
          >
            <span className="text-xs font-mono text-text-muted">{item.label}</span>
            <div className="flex items-center gap-2">
              <span>{item.icon}</span>
              <span
                className="font-bold text-lg font-display"
                style={{ color: item.color }}
              >
                {item.value}
              </span>
            </div>
            <span className="text-xs text-text-muted truncate">{item.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Scores ── */}
      <div className="p-5 rounded-xl border border-bg-border bg-bg-elevated">
        <h3 className="text-sm font-mono uppercase tracking-wider text-text-secondary mb-5">
          Performance Analysis
        </h3>
        <div className="flex flex-wrap justify-around gap-6">
          <ScoreRing
            score={performance.performanceScore}
            label="Performance"
          />
          <ScoreRing score={performance.securityScore} label="Security" />
          <ScoreRing score={performance.seoScore} label="SEO" />
        </div>

        {/* Security headers grid */}
        <div className="mt-6 border-t border-bg-border pt-5">
          <p className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider">Security Headers</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(performance.securityHeaders).map(([key, passed]) => {
              const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (c) => c.toUpperCase());
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 text-xs font-mono"
                >
                  <span style={{ color: passed ? "#10B981" : "#EF4444" }}>
                    {passed ? "✓" : "✗"}
                  </span>
                  <span
                    className={passed ? "text-text-secondary" : "text-text-muted line-through"}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEO checks */}
        <div className="mt-5 border-t border-bg-border pt-5">
          <p className="text-xs font-mono text-text-muted mb-3 uppercase tracking-wider">SEO Checks</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {performance.seoChecks.map((check) => (
              <div key={check.name} className="flex items-center gap-2 text-xs font-mono">
                <span style={{ color: check.passed ? "#10B981" : "#EF4444" }}>
                  {check.passed ? "✓" : "✗"}
                </span>
                <span className={check.passed ? "text-text-secondary" : "text-text-muted"}>
                  {check.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tech grid ── */}
      <div>
        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveCategory("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200"
            style={{
              borderColor: activeCategory === "all" ? "rgba(0,217,255,0.4)" : "#1F2937",
              backgroundColor: activeCategory === "all" ? "rgba(0,217,255,0.08)" : "transparent",
              color: activeCategory === "all" ? "#00D9FF" : "#9CA3AF",
            }}
          >
            All ({result.technologies.length})
          </button>
          {orderedCategories.map((cat) => {
            const count = result.technologies.filter((t) => t.category === cat).length;
            const color = CATEGORY_COLORS[cat];
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono border transition-all duration-200"
                style={{
                  borderColor: active ? `${color}40` : "#1F2937",
                  backgroundColor: active ? `${color}10` : "transparent",
                  color: active ? color : "#9CA3AF",
                }}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Tech grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((tech) => (
              <TechBadge key={tech.name} tech={tech} style="card" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-text-muted font-mono text-sm">
            No technologies detected in this category
          </div>
        )}
      </div>

      {/* ── Scripts detected ── */}
      {result.scripts.length > 0 && (
        <div className="rounded-xl border border-bg-border bg-bg-elevated overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <h3 className="text-sm font-semibold text-text-secondary">
              📜 Scripts Detected
              <span className="ml-2 text-xs font-mono text-text-muted">
                ({result.scripts.length})
              </span>
            </h3>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
              {result.scripts.map((script, i) => (
                <div
                  key={i}
                  className="text-xs font-mono text-text-muted hover:text-text-secondary transition-colors truncate py-0.5 px-2 rounded hover:bg-bg-card"
                >
                  <span className="text-text-muted mr-2">{i + 1}.</span>
                  {script}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Architecture diagram ── */}
      <ArchDiagram technologies={result.technologies} domain={domain} />

      {/* ── HTTP Headers ── */}
      <div className="rounded-xl border border-bg-border overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border bg-bg-elevated">
          <h3 className="text-sm font-semibold text-text-secondary">
            🔌 HTTP Response Headers
            <span className="ml-2 text-xs font-mono text-text-muted">
              ({Object.keys(result.rawHeaders).length})
            </span>
          </h3>
        </div>
        <div className="p-4 bg-bg-base max-h-60 overflow-y-auto">
          <div className="grid grid-cols-1 gap-1 code-block">
            {Object.entries(result.rawHeaders).map(([key, val]) => (
              <div key={key} className="flex gap-2 text-xs hover:bg-bg-elevated rounded px-2 py-0.5">
                <span className="text-accent-cyan min-w-[180px] flex-shrink-0">{key}:</span>
                <span className="text-text-secondary truncate">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Developer Blueprint ── */}
      <Blueprint technologies={result.technologies} />

      {/* ── Raw JSON ── */}
      <RawOutput result={result} />
    </section>
  );
}
