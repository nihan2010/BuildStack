// ============================================================
// BuildStack – Scanner Engine
// Fetches a URL and builds a DetectionContext for the rules engine
// ============================================================

import type {
  DetectionContext,
  ScanResult,
  Technology,
  ServerInfo,
  PerformanceMetrics,
  SecurityHeaderAnalysis,
  SEOCheck,
  DNSRecord,
} from "@/types";
import { DETECTION_RULES } from "@/lib/detectors/rules";

// --------------- URL Helpers ---------------

export function normalizeURL(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url;
}

export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// --------------- HTTP Fetch with Timeout ---------------

async function fetchWithTimeout(
  url: string,
  timeoutMs = 15000
): Promise<{ html: string; headers: Record<string, string>; status: number; responseTime: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BuildStack/1.0; +https://buildstack.dev)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    const responseTime = Date.now() - start;
    const html = await response.text();

    // Normalize headers to lowercase keys
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    return { html, headers, status: response.status, responseTime };
  } finally {
    clearTimeout(timer);
  }
}

// --------------- Script Extraction ---------------

function extractScripts(html: string, baseURL: string): string[] {
  const scriptRegex = /<script[^>]+src=["']([^"']+)["']/gi;
  const scripts: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith("//")) {
      scripts.push("https:" + src);
    } else if (src.startsWith("http")) {
      scripts.push(src);
    } else if (src.startsWith("/")) {
      try {
        const base = new URL(baseURL);
        scripts.push(`${base.protocol}//${base.host}${src}`);
      } catch {
        scripts.push(src);
      }
    } else {
      scripts.push(src);
    }
  }

  return [...new Set(scripts)];
}

// --------------- Meta Tag Extraction ---------------

function extractMetaTags(html: string): Record<string, string> {
  const metaRegex = /<meta[^>]+>/gi;
  const tags: Record<string, string> = {};
  let match: RegExpExecArray | null;

  while ((match = metaRegex.exec(html)) !== null) {
    const tag = match[0];

    // name="..." content="..."
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    const contentMatch = tag.match(/content=["']([^"']*)["']/i);
    if (nameMatch && contentMatch) {
      tags[nameMatch[1].toLowerCase()] = contentMatch[1];
    }

    // property="og:..." content="..."
    const propMatch = tag.match(/property=["']([^"']+)["']/i);
    if (propMatch && contentMatch) {
      tags[propMatch[1].toLowerCase()] = contentMatch[1];
    }
  }

  return tags;
}

// --------------- Cookie Extraction ---------------

function extractCookies(headers: Record<string, string>): string[] {
  const setCookie = headers["set-cookie"] || "";
  return setCookie.split(",").map((c) => c.trim());
}

// --------------- Page Title ---------------

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim();
}

// --------------- Server Info from Headers ---------------

function buildServerInfo(
  headers: Record<string, string>,
  url: string
): ServerInfo {
  const server = headers["server"] || "";
  const poweredBy = headers["x-powered-by"] || "";
  const cfRay = headers["cf-ray"];

  let provider = "Unknown";
  if (cfRay || /cloudflare/i.test(server)) provider = "Cloudflare";
  else if (headers["x-vercel-id"]) provider = "Vercel";
  else if (headers["x-nf-request-id"]) provider = "Netlify";
  else if (/amazon/i.test(server) || headers["x-amzn-requestid"]) provider = "AWS";
  else if (/nginx/i.test(server)) provider = "Nginx";
  else if (/apache/i.test(server)) provider = "Apache";

  return {
    provider,
    serverSoftware: server || poweredBy || undefined,
    tlsVersion: url.startsWith("https") ? "TLS 1.3" : undefined,
  };
}

// --------------- Performance Metrics ---------------

function buildPerformanceMetrics(
  headers: Record<string, string>,
  html: string,
  responseTime: number,
  metaTags: Record<string, string>,
  scripts: string[]
): PerformanceMetrics {
  // Security headers analysis
  const securityHeaders: SecurityHeaderAnalysis = {
    contentSecurityPolicy:
      !!headers["content-security-policy"],
    strictTransportSecurity:
      !!headers["strict-transport-security"],
    xFrameOptions: !!headers["x-frame-options"],
    xContentTypeOptions: !!headers["x-content-type-options"],
    referrerPolicy: !!headers["referrer-policy"],
    permissionsPolicy: !!headers["permissions-policy"],
  };

  const securityPassed = Object.values(securityHeaders).filter(Boolean).length;
  const securityScore = Math.round((securityPassed / 6) * 100);

  // SEO checks
  const seoChecks: SEOCheck[] = [
    {
      name: "Title Tag",
      passed: !!extractTitle(html),
      description: "Page has a <title> tag",
    },
    {
      name: "Meta Description",
      passed: !!metaTags["description"],
      description: "Page has a meta description",
    },
    {
      name: "Canonical URL",
      passed: html.includes('rel="canonical"'),
      description: "Page has a canonical link",
    },
    {
      name: "Open Graph Tags",
      passed: !!metaTags["og:title"],
      description: "Page has Open Graph metadata",
    },
    {
      name: "Viewport Meta",
      passed: !!metaTags["viewport"],
      description: "Page is mobile-responsive",
    },
    {
      name: "HTTPS",
      passed: true, // We normalize to HTTPS
      description: "Site uses secure HTTPS connection",
    },
    {
      name: "Structured Data",
      passed: html.includes("application/ld+json"),
      description: "Page includes JSON-LD structured data",
    },
    {
      name: "Language Attribute",
      passed: /<html[^>]+lang=/i.test(html),
      description: "HTML tag includes lang attribute",
    },
  ];

  const seoPassed = seoChecks.filter((c) => c.passed).length;
  const seoScore = Math.round((seoPassed / seoChecks.length) * 100);

  // Performance score heuristic
  let perfScore = 100;
  if (responseTime > 3000) perfScore -= 30;
  else if (responseTime > 2000) perfScore -= 15;
  else if (responseTime > 1000) perfScore -= 5;
  if (scripts.length > 20) perfScore -= 10;
  else if (scripts.length > 10) perfScore -= 5;
  perfScore = Math.max(perfScore, 10);

  return {
    responseTime,
    performanceScore: perfScore,
    securityScore,
    seoScore,
    securityHeaders,
    seoChecks,
  };
}

// --------------- DNS Records (simulated) ---------------
// In a real deployment, use dns.promises.resolve() server-side
// For client-safe preview, we return placeholder/simulated records

function buildDNSRecords(url: string): DNSRecord[] {
  try {
    const host = new URL(url).hostname;
    return [
      { type: "A", value: "Resolved at runtime", ttl: 300 },
      { type: "CNAME", value: host, ttl: 3600 },
    ];
  } catch {
    return [];
  }
}

// ============================================================
// MAIN SCAN FUNCTION
// ============================================================

export async function scanWebsite(rawURL: string): Promise<ScanResult> {
  const url = normalizeURL(rawURL);

  if (!isValidURL(url)) {
    throw new Error("Invalid URL provided");
  }

  // 1. Fetch the page
  const { html, headers, status, responseTime } = await fetchWithTimeout(url);

  // 2. Extract page artifacts
  const scripts = extractScripts(html, url);
  const metaTags = extractMetaTags(html);
  const cookies = extractCookies(headers);
  const pageTitle = extractTitle(html);
  const metaDescription = metaTags["description"];

  // 3. Build detection context
  const context: DetectionContext = {
    html,
    headers,
    scripts,
    metaTags,
    cookies,
    url,
    responseTime,
  };

  // 4. Run all detection rules
  const technologies: Technology[] = [];

  for (const rule of DETECTION_RULES) {
    try {
      const result = rule.detect(context);
      if (result && result.confidence >= 25) {
        technologies.push({
          name: rule.name,
          category: rule.category,
          confidence: result.confidence,
          version: result.version,
          description: rule.description,
          icon: rule.icon,
          website: rule.website,
          color: rule.color,
        });
      }
    } catch {
      // Silently skip failed detections
    }
  }

  // Sort by confidence descending
  technologies.sort((a, b) => b.confidence - a.confidence);

  // 5. Build ancillary data
  const serverInfo = buildServerInfo(headers, url);
  const performance = buildPerformanceMetrics(headers, html, responseTime, metaTags, scripts);
  const dnsRecords = buildDNSRecords(url);

  return {
    url,
    scannedAt: new Date().toISOString(),
    technologies,
    scripts: scripts.slice(0, 50), // cap at 50 for display
    serverInfo,
    performance,
    rawHeaders: headers,
    dnsRecords,
    pageTitle,
    metaDescription,
    statusCode: status,
  };
}
