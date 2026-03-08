"use client";

import { useState } from "react";
import type { ScanResult } from "@/types";

interface RawOutputProps {
  result: ScanResult;
}

export default function RawOutput({ result }: RawOutputProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const json = JSON.stringify(result, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Syntax highlighting via CSS classes
  const highlight = (text: string) => {
    return text
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = "text-amber-300"; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "text-blue-300"; // key
          } else {
            cls = "text-emerald-300"; // string
          }
        } else if (/true|false/.test(match)) {
          cls = "text-purple-300"; // boolean
        } else if (/null/.test(match)) {
          cls = "text-red-400"; // null
        }
        return `<span class="${cls}">${match}</span>`;
      });
  };

  return (
    <div className="rounded-xl border border-bg-border overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-bg-elevated hover:bg-bg-card transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-cyan/10 border border-accent-cyan/20">
            <span className="text-sm">{ }</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-text-primary text-sm">View Raw Scan Data</div>
            <div className="text-xs text-text-muted">Full JSON output from scan engine</div>
          </div>
        </div>
        <div className="text-text-muted transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "none" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* JSON panel */}
      {open && (
        <div className="border-t border-bg-border bg-bg-base">
          {/* Action bar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-bg-border bg-bg-elevated">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs font-mono text-text-muted ml-1">scan-result.json</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border border-bg-border text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-all"
            >
              {copied ? (
                <><span className="text-accent-green">✓</span> Copied!</>
              ) : (
                <><span>⎘</span> Copy</>
              )}
            </button>
          </div>

          {/* Code */}
          <div className="overflow-auto max-h-[500px] p-5">
            <pre
              className="code-block text-text-secondary whitespace-pre text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlight(json) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
