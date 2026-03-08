"use client";

import type { Technology } from "@/types";
import { getConfidenceColor } from "@/lib/utils";

interface TechBadgeProps {
  tech: Technology;
  style?: "card" | "compact";
}

export default function TechBadge({ tech, style = "card" }: TechBadgeProps) {
  if (style === "compact") {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all duration-200 hover:scale-105"
        style={{
          borderColor: `${tech.color}30`,
          backgroundColor: `${tech.color}10`,
          color: tech.color || "#F9FAFB",
        }}
      >
        <span>{tech.icon}</span>
        <span>{tech.name}</span>
        {tech.version && (
          <span className="text-text-muted font-mono">v{tech.version}</span>
        )}
      </div>
    );
  }

  const confidenceColor = getConfidenceColor(tech.confidence);

  return (
    <div
      className="tech-card group relative flex flex-col gap-3 p-4 rounded-xl border cursor-default"
      style={{
        borderColor: `${tech.color}20`,
        backgroundColor: "rgba(17,24,39,0.6)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${tech.color}50`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${tech.color}15, 0 1px 3px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = `${tech.color}20`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)";
      }}
    >
      {/* Top row: icon + name + version */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl leading-none">{tech.icon}</span>
          <div>
            <div className="font-semibold text-text-primary text-sm leading-tight">
              {tech.name}
            </div>
            {tech.version && (
              <div className="text-xs font-mono text-text-muted mt-0.5">
                v{tech.version}
              </div>
            )}
          </div>
        </div>

        {/* Confidence indicator */}
        <div
          className="flex-shrink-0 text-xs font-mono px-2 py-0.5 rounded-full"
          style={{
            color: confidenceColor,
            backgroundColor: `${confidenceColor}15`,
            border: `1px solid ${confidenceColor}30`,
          }}
        >
          {tech.confidence}%
        </div>
      </div>

      {/* Description */}
      {tech.description && (
        <p className="text-xs text-text-muted leading-relaxed">
          {tech.description}
        </p>
      )}

      {/* Confidence bar */}
      <div className="h-0.5 w-full bg-bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${tech.confidence}%`,
            backgroundColor: tech.color || confidenceColor,
            boxShadow: `0 0 6px ${tech.color || confidenceColor}60`,
          }}
        />
      </div>

      {/* Website link */}
      {tech.website && (
        <a
          href={tech.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-text-muted hover:text-text-secondary transition-colors truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {tech.website.replace("https://", "")} ↗
        </a>
      )}
    </div>
  );
}
