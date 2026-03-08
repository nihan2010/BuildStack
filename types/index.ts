// ============================================================
// BuildStack – Core Type Definitions
// ============================================================

export type TechCategory =
  | "frontend"
  | "backend"
  | "hosting"
  | "cdn"
  | "analytics"
  | "payments"
  | "fonts"
  | "tracking"
  | "cms"
  | "javascript"
  | "security"
  | "database"
  | "devtools";

export interface Technology {
  name: string;
  category: TechCategory;
  confidence: number; // 0–100
  version?: string;
  description?: string;
  icon?: string; // emoji or icon identifier
  website?: string;
  color?: string; // accent color hex
}

export interface DetectionRule {
  name: string;
  category: TechCategory;
  description: string;
  icon: string;
  color: string;
  website: string;
  detect: (context: DetectionContext) => DetectionResult | null;
}

export interface DetectionContext {
  html: string;
  headers: Record<string, string>;
  scripts: string[];
  metaTags: Record<string, string>;
  cookies: string[];
  url: string;
  dnsRecords?: DNSRecord[];
  responseTime?: number;
}

export interface DetectionResult {
  confidence: number;
  version?: string;
  evidence?: string[];
}

export interface DNSRecord {
  type: string;
  value: string;
  ttl?: number;
}

export interface PerformanceMetrics {
  responseTime: number; // ms
  performanceScore: number; // 0–100
  securityScore: number; // 0–100
  seoScore: number; // 0–100
  securityHeaders: SecurityHeaderAnalysis;
  seoChecks: SEOCheck[];
}

export interface SecurityHeaderAnalysis {
  contentSecurityPolicy: boolean;
  strictTransportSecurity: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
}

export interface SEOCheck {
  name: string;
  passed: boolean;
  description: string;
}

export interface ServerInfo {
  ip?: string;
  location?: string;
  country?: string;
  provider?: string;
  serverSoftware?: string;
  tlsVersion?: string;
}

export interface ScanResult {
  url: string;
  scannedAt: string;
  technologies: Technology[];
  scripts: string[];
  serverInfo: ServerInfo;
  performance: PerformanceMetrics;
  rawHeaders: Record<string, string>;
  dnsRecords: DNSRecord[];
  pageTitle?: string;
  metaDescription?: string;
  statusCode: number;
}

export interface ScanStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "error";
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
