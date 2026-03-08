import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TechCategory } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORY_LABELS: Record<TechCategory, string> = {
  frontend: "Frontend",
  backend: "Backend",
  hosting: "Hosting",
  cdn: "CDN",
  analytics: "Analytics",
  payments: "Payments",
  fonts: "Fonts",
  tracking: "Tracking",
  cms: "CMS",
  javascript: "JavaScript",
  security: "Security",
  database: "Database",
  devtools: "Dev Tools",
};

export const CATEGORY_COLORS: Record<TechCategory, string> = {
  frontend: "#00D9FF",
  backend: "#10B981",
  hosting: "#8B5CF6",
  cdn: "#F59E0B",
  analytics: "#EC4899",
  payments: "#635BFF",
  fonts: "#9CA3AF",
  tracking: "#EF4444",
  cms: "#06B6D4",
  javascript: "#F7DF1E",
  security: "#10B981",
  database: "#F97316",
  devtools: "#6366F1",
};

export const CATEGORY_ORDER: TechCategory[] = [
  "frontend",
  "cms",
  "backend",
  "hosting",
  "cdn",
  "database",
  "javascript",
  "analytics",
  "tracking",
  "payments",
  "devtools",
  "security",
  "fonts",
];

export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return "High";
  if (confidence >= 60) return "Medium";
  return "Low";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 90) return "#10B981";
  if (confidence >= 60) return "#F59E0B";
  return "#9CA3AF";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Generate the "Developer Blueprint" based on detected technologies */
export function generateBlueprint(
  techNames: string[]
): Array<{ name: string; reason: string; category: string }> {
  const blueprints: Array<{ name: string; reason: string; category: string }> = [];
  const names = new Set(techNames.map((n) => n.toLowerCase()));

  // Framework recommendation
  if (names.has("next.js") || names.has("react")) {
    blueprints.push({
      name: "Next.js",
      reason: "Full-stack React framework with SSR/SSG and edge runtime support",
      category: "Frontend",
    });
  } else if (names.has("vue.js") || names.has("nuxt.js")) {
    blueprints.push({
      name: "Nuxt.js",
      reason: "Full-stack Vue framework with excellent DX and built-in routing",
      category: "Frontend",
    });
  } else {
    blueprints.push({
      name: "Next.js",
      reason: "Industry-standard React framework for modern web applications",
      category: "Frontend",
    });
  }

  // Styling
  if (names.has("tailwind css")) {
    blueprints.push({
      name: "Tailwind CSS",
      reason: "Utility-first CSS — build any design directly in your HTML",
      category: "Styling",
    });
  } else {
    blueprints.push({
      name: "Tailwind CSS",
      reason: "Recommended for rapid, consistent UI development",
      category: "Styling",
    });
  }

  // Hosting
  if (names.has("vercel")) {
    blueprints.push({
      name: "Vercel",
      reason: "Zero-config deployments with global edge network",
      category: "Hosting",
    });
  } else if (names.has("netlify")) {
    blueprints.push({
      name: "Netlify",
      reason: "Git-based workflow with powerful CI/CD pipeline",
      category: "Hosting",
    });
  } else {
    blueprints.push({
      name: "Vercel",
      reason: "Fastest way to deploy Next.js with global CDN",
      category: "Hosting",
    });
  }

  // CDN
  if (names.has("cloudflare")) {
    blueprints.push({
      name: "Cloudflare",
      reason: "Global CDN + DDoS protection + Edge Workers for sub-ms response",
      category: "CDN",
    });
  }

  // Database
  if (names.has("firebase") || names.has("supabase")) {
    blueprints.push({
      name: names.has("supabase") ? "Supabase" : "Firebase",
      reason: "Real-time database with auth, storage, and serverless functions",
      category: "Database",
    });
  } else {
    blueprints.push({
      name: "Supabase",
      reason: "Open-source Firebase alternative with Postgres + Auth",
      category: "Database",
    });
  }

  // Payments
  if (names.has("stripe")) {
    blueprints.push({
      name: "Stripe",
      reason: "Industry-standard payment processing with excellent developer UX",
      category: "Payments",
    });
  }

  // Analytics
  if (names.has("google analytics") || names.has("mixpanel")) {
    blueprints.push({
      name: "PostHog",
      reason: "Open-source product analytics with session recording",
      category: "Analytics",
    });
  }

  // Error tracking
  blueprints.push({
    name: "Sentry",
    reason: "Application monitoring and error tracking in production",
    category: "Monitoring",
  });

  return blueprints;
}
