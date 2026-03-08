"use client";

import { useEffect, useState } from "react";
import type { ScanStep } from "@/types";

const STEPS: ScanStep[] = [
  { id: "connect", label: "Connecting to website", status: "pending" },
  { id: "download", label: "Downloading page content", status: "pending" },
  { id: "headers", label: "Inspecting HTTP headers", status: "pending" },
  { id: "detect", label: "Detecting technologies", status: "pending" },
  { id: "report", label: "Generating report", status: "pending" },
];

interface ScanningAnimationProps {
  url: string;
}

export default function ScanningAnimation({ url }: ScanningAnimationProps) {
  const [steps, setSteps] = useState<ScanStep[]>(STEPS);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const TIMINGS = [600, 1200, 800, 1400, 700];
    let timeout: NodeJS.Timeout;
    let step = 0;

    const advance = () => {
      if (step >= STEPS.length) return;

      setSteps((prev) =>
        prev.map((s, i) => {
          if (i < step) return { ...s, status: "done" };
          if (i === step) return { ...s, status: "running" };
          return s;
        })
      );
      setCurrentStep(step);

      timeout = setTimeout(() => {
        step++;
        advance();
      }, TIMINGS[step] || 800);
    };

    advance();
    return () => clearTimeout(timeout);
  }, []);

  const domain = (() => {
    try {
      return new URL(url.startsWith("http") ? url : "https://" + url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Terminal window */}
      <div className="rounded-2xl border border-bg-border overflow-hidden" style={{ boxShadow: "0 0 0 1px rgba(0,217,255,0.1), 0 24px 64px rgba(0,0,0,0.5)" }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-bg-elevated border-b border-bg-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <span className="text-xs font-mono text-text-muted">buildstack — scan</span>
          </div>
        </div>

        {/* Terminal body */}
        <div className="p-6 bg-bg-base min-h-[200px]">
          {/* Command */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-accent-cyan font-mono text-sm">$</span>
            <span className="text-text-secondary font-mono text-sm">buildstack scan</span>
            <span className="text-accent-purple font-mono text-sm">{domain}</span>
            <span className="inline-block w-2 h-4 bg-accent-cyan/80 animate-pulse ml-0.5" />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center gap-3 transition-all duration-300"
                style={{
                  opacity: step.status === "pending" ? 0.3 : 1,
                }}
              >
                {/* Status icon */}
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  {step.status === "done" && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="rgba(16,185,129,0.15)" stroke="#10B981" strokeWidth="1.5" />
                      <path d="M7 12l3.5 3.5L17 8.5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {step.status === "running" && (
                    <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === "pending" && (
                    <div className="w-2 h-2 rounded-full bg-text-muted" />
                  )}
                </div>

                {/* Label */}
                <span
                  className="font-mono text-sm"
                  style={{
                    color: step.status === "done"
                      ? "#10B981"
                      : step.status === "running"
                      ? "#F9FAFB"
                      : "#4B5563",
                  }}
                >
                  {step.label}
                  {step.status === "running" && (
                    <span className="text-text-muted">...</span>
                  )}
                  {step.status === "done" && (
                    <span className="text-accent-green ml-2">✓</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-label */}
      <p className="text-center text-text-muted text-sm font-mono mt-4 animate-pulse">
        Analyzing {domain} — this may take a few seconds
      </p>
    </div>
  );
}
