// ============================================================
// BuildStack – /api/analyze route
// POST { url } → ScanResult
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { scanWebsite, isValidURL, normalizeURL } from "@/lib/scanner";
import type { APIResponse, ScanResult } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const rawURL: string = body?.url ?? "";

    if (!rawURL || typeof rawURL !== "string") {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    const normalized = normalizeURL(rawURL);

    if (!isValidURL(normalized)) {
      return NextResponse.json<APIResponse<never>>(
        { success: false, error: "Invalid URL format. Please include a valid domain." },
        { status: 400 }
      );
    }

    const result = await scanWebsite(normalized);

    return NextResponse.json<APIResponse<ScanResult>>(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to analyze URL";

    // Network errors
    if (message.includes("fetch failed") || message.includes("ENOTFOUND")) {
      return NextResponse.json<APIResponse<never>>(
        {
          success: false,
          error:
            "Could not reach the website. Please check the URL and try again.",
        },
        { status: 422 }
      );
    }

    if (message.includes("AbortError") || message.includes("timeout")) {
      return NextResponse.json<APIResponse<never>>(
        {
          success: false,
          error: "Request timed out. The website took too long to respond.",
        },
        { status: 408 }
      );
    }

    console.error("[BuildStack] Scan error:", err);

    return NextResponse.json<APIResponse<never>>(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
