import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { supabase } from "@/lib/supabaseClient";
import { AddAllBlogsResponse } from "@/types/blog.types";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 10;

interface SyncBlogsResponse {
  success: boolean;
  message: string;
  data: {
    /**
     * Minimum `serial_no` for this batch (inclusive). Matches the URL segment:
     * `/api/sync-blogs/61` loads up to PAGE_SIZE students with `serial_no >= 61`.
     */
    startingIndex: number;
    pageSize: number;
    /** Total rows in `students` (same client as the query). */
    totalStudents: number | null;
    usernamesProcessed: number;
    usernamesSkipped: number;
    totalAdded: number;
    totalSkipped: number;
    results: { username: string; added: number; skipped: number; error?: string }[];
  };
}

function parseStartingIndex(param: string | undefined): number | null {
  if (param === undefined) return null;
  const n = parseInt(param, 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

/**
 * Internal `/api/*` calls must target the same origin as the incoming request.
 * Otherwise local `http://localhost:3001/api/sync-blogs/*` would POST to
 * `NEXT_PUBLIC_APP_URL` or the production default and receive HTML (DOCTYPE),
 * which breaks `response.json()`.
 */
function getInternalApiBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host");
  if (host) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]");
    const protocol =
      forwardedProto ?? (isLocal ? "http" : "https");
    return `${protocol}://${host}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ startingIndex: string }> }
): Promise<NextResponse<SyncBlogsResponse>> {
  try {
    const { startingIndex: startingIndexParam } = await params;
    const startingIndex = parseStartingIndex(startingIndexParam);

    if (startingIndex === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid startingIndex",
          data: {
            startingIndex: 0,
            pageSize: PAGE_SIZE,
            totalStudents: null,
            usernamesProcessed: 0,
            usernamesSkipped: 0,
            totalAdded: 0,
            totalSkipped: 0,
            results: [],
          },
        },
        { status: 400 }
      );
    }

    const db = supabaseAdmin ?? supabase;
    if (!supabaseAdmin) {
      console.warn(
        "sync-blogs: SUPABASE_SERVICE_ROLE_KEY is not set; using anon client — RLS may return no rows for server-side requests."
      );
    }

    console.log("startingIndex (serial_no min)", startingIndex);

    const { count: totalStudents } = await db
      .from("students")
      .select("*", { count: "exact", head: true });

    const { data: rows, error: fetchError } = await db
      .from("students")
      .select("medium_username")
      .order("serial_no", { ascending: true })
      .gte("serial_no", startingIndex)
      .limit(PAGE_SIZE);

    console.log("rows", rows);

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch students",
          data: {
            startingIndex,
            pageSize: PAGE_SIZE,
            totalStudents,
            usernamesProcessed: 0,
            usernamesSkipped: 0,
            totalAdded: 0,
            totalSkipped: 0,
            results: [],
          },
        },
        { status: 500 }
      );
    }

    const usernames = (rows ?? [])
      .map((r: { medium_username: string | null }) => r?.medium_username)
      .filter(
        (u): u is string =>
          typeof u === "string" && u.trim().length > 0
      )
      .map((u) => u.trim());

    console.log("usernames", usernames);

    const addBlogUrl = `${getInternalApiBaseUrl(request)}/api/add-blog`;

    const results: SyncBlogsResponse["data"]["results"] = [];
    let totalAdded = 0;
    let totalSkipped = 0;

    for (const username of usernames) {
      try {
        const res = await fetch(addBlogUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        });

        const rawBody = await res.text();
        const contentType = res.headers.get("content-type") ?? "";
        let json: AddAllBlogsResponse;
        try {
          json = JSON.parse(rawBody) as AddAllBlogsResponse;
        } catch {
          const preview = rawBody.slice(0, 160).replace(/\s+/g, " ");
          results.push({
            username,
            added: 0,
            skipped: 0,
            error: `add-blog returned non-JSON (HTTP ${res.status}, ${contentType || "no Content-Type"}): ${preview}${rawBody.length > 160 ? "…" : ""}`,
          });
          continue;
        }

        if (!res.ok) {
          results.push({
            username,
            added: 0,
            skipped: 0,
            error: json.message ?? res.statusText,
          });
          continue;
        }

        const added = json.data?.added ?? 0;
        const skipped = json.data?.skipped ?? 0;
        totalAdded += added;
        totalSkipped += skipped;
        results.push({
          username,
          added,
          skipped,
          error: (json.data?.errors ?? []).length > 0 ? json.data.errors.join("; ") : undefined,
        });
        console.log("added", results);
      } catch (err) {
        results.push({
          username,
          added: 0,
          skipped: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const usernamesSkipped = (rows ?? []).length - usernames.length;

    const emptyHint =
      (rows?.length ?? 0) === 0
        ? !supabaseAdmin
          ? " No rows — server uses anon Supabase client; set SUPABASE_SERVICE_ROLE_KEY so this API can read all students (bypasses RLS)."
          : ` No students with serial_no ≥ ${startingIndex} (${totalStudents ?? "?"} row(s) in table).`
        : "";

    return NextResponse.json({
      success: true,
      message: `Processed ${usernames.length} usernames (${(rows ?? []).length - usernames.length} skipped). Added: ${totalAdded}, Skipped: ${totalSkipped}.${emptyHint}`,
      data: {
        startingIndex,
        pageSize: PAGE_SIZE,
        totalStudents,
        usernamesProcessed: usernames.length,
        usernamesSkipped,
        totalAdded,
        totalSkipped,
        results,
      },
    });
  } catch (error) {
    console.error("Sync blogs error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        data: {
          startingIndex: 0,
          pageSize: PAGE_SIZE,
          totalStudents: null,
          usernamesProcessed: 0,
          usernamesSkipped: 0,
          totalAdded: 0,
          totalSkipped: 0,
          results: [],
        },
      },
      { status: 500 }
    );
  }
}
