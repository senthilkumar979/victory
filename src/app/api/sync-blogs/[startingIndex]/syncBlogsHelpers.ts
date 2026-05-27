import { AddAllBlogsResponse } from "@/types/blog.types";

interface HeaderReader {
  get: (name: string) => string | null;
}

interface AddBlogResponseParts {
  ok: boolean;
  status: number;
  statusText: string;
  contentType: string | null;
  rawBody: string;
}

interface ParsedAddBlogResult {
  added: number;
  skipped: number;
  shouldCountTotals: boolean;
  error?: string;
}

export function parseStartingIndex(param: string | undefined): number | null {
  if (param === undefined) return null;
  const n = parseInt(param, 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

/**
 * Internal `/api/*` calls must target the same origin as the incoming request.
 * Otherwise local sync requests can POST to production and receive HTML.
 */
export function getInternalApiBaseUrl(headers: HeaderReader): string {
  const host = headers.get("host");
  if (host) {
    const forwardedProto = headers.get("x-forwarded-proto");
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]");
    const protocol = forwardedProto ?? (isLocal ? "http" : "https");
    return `${protocol}://${host}`;
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function parseAddBlogResult({
  ok,
  status,
  statusText,
  contentType,
  rawBody,
}: AddBlogResponseParts): ParsedAddBlogResult {
  let json: AddAllBlogsResponse;
  try {
    json = JSON.parse(rawBody) as AddAllBlogsResponse;
  } catch {
    const preview = rawBody.slice(0, 160).replace(/\s+/g, " ");
    return {
      added: 0,
      skipped: 0,
      shouldCountTotals: false,
      error: `add-blog returned non-JSON (HTTP ${status}, ${contentType || "no Content-Type"}): ${preview}${rawBody.length > 160 ? "…" : ""}`,
    };
  }

  if (!ok) {
    return {
      added: 0,
      skipped: 0,
      shouldCountTotals: false,
      error: json.message ?? statusText,
    };
  }

  const added = json.data?.added ?? 0;
  const skipped = json.data?.skipped ?? 0;
  const errors = json.data?.errors ?? [];
  return {
    added,
    skipped,
    shouldCountTotals: true,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}
