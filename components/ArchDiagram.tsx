"use client";

import type { Technology } from "@/types";

interface ArchDiagramProps {
  technologies: Technology[];
  domain: string;
}

export default function ArchDiagram({ technologies, domain }: ArchDiagramProps) {
  const hasCDN = technologies.some((t) => t.category === "cdn");
  const hasHosting = technologies.some((t) => t.category === "hosting");
  const hasCMS = technologies.some((t) => t.category === "cms");
  const hasDB = technologies.some((t) => t.category === "database");
  const hasPayments = technologies.some((t) => t.category === "payments");
  const hasAnalytics = technologies.some((t) => t.category === "analytics" || t.category === "tracking");

  const cdnTech = technologies.find((t) => t.category === "cdn");
  const hostingTech = technologies.find((t) => t.category === "hosting");
  const frontendTech = technologies.find((t) => t.category === "frontend");
  const backendTech = technologies.find((t) => t.category === "backend");
  const dbTech = technologies.find((t) => t.category === "database");
  const cmsTech = technologies.find((t) => t.category === "cms");
  const paymentTech = technologies.find((t) => t.category === "payments");
  const analyticsTech = technologies.find((t) => t.category === "analytics" || t.category === "tracking");

  const nodes = [
    { label: "User / Browser", icon: "🌐", color: "#9CA3AF", always: true },
    ...(hasCDN ? [{ label: cdnTech?.name || "CDN", icon: cdnTech?.icon || "🔶", color: cdnTech?.color || "#F38020" }] : []),
    ...(hasHosting ? [{ label: hostingTech?.name || "Hosting", icon: hostingTech?.icon || "☁️", color: hostingTech?.color || "#8B5CF6" }] : []),
    { label: frontendTech?.name || "Frontend", icon: frontendTech?.icon || "⚛️", color: frontendTech?.color || "#61DAFB", always: true },
    ...(backendTech ? [{ label: backendTech.name, icon: backendTech.icon || "⚙️", color: backendTech.color || "#10B981" }] : []),
    ...(hasCMS ? [{ label: cmsTech?.name || "CMS", icon: cmsTech?.icon || "📝", color: cmsTech?.color || "#21759B" }] : []),
    ...(hasDB ? [{ label: dbTech?.name || "Database", icon: dbTech?.icon || "🗄️", color: dbTech?.color || "#F97316" }] : []),
  ];

  const sideNodes = [
    ...(hasAnalytics ? [{ label: analyticsTech?.name || "Analytics", icon: analyticsTech?.icon || "📊", color: analyticsTech?.color || "#EC4899" }] : []),
    ...(hasPayments ? [{ label: paymentTech?.name || "Payments", icon: paymentTech?.icon || "💳", color: paymentTech?.color || "#635BFF" }] : []),
  ];

  return (
    <div className="rounded-xl border border-bg-border bg-bg-elevated p-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-6 font-mono uppercase tracking-wider">
        Tech Architecture
      </h3>

      <div className="flex gap-8">
        {/* Main flow */}
        <div className="flex-1 flex flex-col items-center gap-0">
          {nodes.map((node, index) => (
            <div key={node.label} className="flex flex-col items-center">
              {/* Node */}
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 cursor-default min-w-[160px] justify-center"
                style={{
                  borderColor: `${node.color}30`,
                  backgroundColor: `${node.color}08`,
                  boxShadow: `0 0 12px ${node.color}10`,
                }}
              >
                <span className="text-base">{node.icon}</span>
                <span className="text-sm font-medium" style={{ color: node.color }}>
                  {node.label}
                </span>
              </div>

              {/* Arrow down (not on last node) */}
              {index < nodes.length - 1 && (
                <div className="flex flex-col items-center py-1">
                  <div
                    className="w-px h-5"
                    style={{
                      background: `linear-gradient(to bottom, ${node.color}60, ${nodes[index + 1].color}60)`,
                    }}
                  />
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M4 6L0 0h8z" fill={`${nodes[index + 1].color}80`} />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Side integrations */}
        {sideNodes.length > 0 && (
          <div className="flex flex-col justify-center gap-3">
            <div className="text-xs font-mono text-text-muted mb-1">Integrations</div>
            {sideNodes.map((node) => (
              <div
                key={node.label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
                style={{
                  borderColor: `${node.color}30`,
                  backgroundColor: `${node.color}08`,
                  color: node.color,
                }}
              >
                <span>{node.icon}</span>
                <span className="font-medium">{node.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Domain label */}
      <div className="mt-5 pt-4 border-t border-bg-border flex items-center justify-between">
        <span className="text-xs font-mono text-text-muted">Detected stack for:</span>
        <span className="text-xs font-mono text-accent-cyan">{domain}</span>
      </div>
    </div>
  );
}
