"use client";

import { useState } from "react";
import { generateBlueprint } from "@/lib/utils";
import type { Technology } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  Frontend: "#00D9FF",
  Styling: "#06B6D4",
  Hosting: "#8B5CF6",
  CDN: "#F38020",
  Database: "#F97316",
  Payments: "#635BFF",
  Analytics: "#EC4899",
  Monitoring: "#EF4444",
};

interface BlueprintProps {
  technologies: Technology[];
}

export default function Blueprint({ technologies }: BlueprintProps) {
  const [open, setOpen] = useState(false);
  const blueprint = generateBlueprint(technologies.map((t) => t.name));

  return (
    <div className="rounded-xl border border-bg-border overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-bg-elevated hover:bg-bg-card transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)" }}>
            <span className="text-sm">🏗️</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-text-primary text-sm">Developer Blueprint</div>
            <div className="text-xs text-text-muted">How you could build a similar site</div>
          </div>
        </div>
        <div className="text-text-muted transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="bg-bg-base p-5 border-t border-bg-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blueprint.map((item) => {
              const color = CATEGORY_COLORS[item.category] || "#9CA3AF";
              return (
                <div
                  key={item.name}
                  className="flex gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    borderColor: `${color}20`,
                    backgroundColor: `${color}06`,
                  }}
                >
                  <div
                    className="flex-shrink-0 mt-0.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color }}>
                        {item.name}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Example code snippet */}
          <div className="mt-4 rounded-xl border border-bg-border bg-bg-elevated overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-bg-border bg-bg-card">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-mono text-text-muted ml-2">quick-start.sh</span>
            </div>
            <div className="p-4 code-block text-text-secondary">
              <div><span className="text-text-muted"># Initialize project</span></div>
              <div className="mt-1"><span className="text-accent-cyan">npx</span> create-next-app@latest my-app --typescript --tailwind</div>
              <div className="mt-2"><span className="text-text-muted"># Add essentials</span></div>
              <div><span className="text-accent-cyan">npm</span> install @supabase/supabase-js stripe @sentry/nextjs</div>
              <div className="mt-2"><span className="text-text-muted"># Deploy instantly</span></div>
              <div><span className="text-accent-cyan">npx</span> vercel --prod</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
