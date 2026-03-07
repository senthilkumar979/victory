import { supabase } from "@/lib/supabaseClient";
import { AddAllBlogsResponse } from "@/types/blog.types";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 10;

interface SyncBlogsResponse {
  success: boolean;
  message: string;
  data: {
    startingIndex: number;
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

export async function GET(
  _request: NextRequest,
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

    const offset = startingIndex - 1;
    const end = offset + PAGE_SIZE - 1;

    const { data: rows, error: fetchError } = await supabase
      .from("students")
      .select("medium_username")
      .order("id", { ascending: true })
      .range(offset, end);

    if (fetchError) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch students",
          data: {
            startingIndex,
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

    const baseUrl =
      process.env.VERCEL_URL != null
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const addBlogUrl = `${baseUrl}/api/add-blog`;

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
        const json = (await res.json()) as AddAllBlogsResponse;

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

    return NextResponse.json({
      success: true,
      message: `Processed ${usernames.length} usernames (${(rows ?? []).length - usernames.length} skipped). Added: ${totalAdded}, Skipped: ${totalSkipped}`,
      data: {
        startingIndex,
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
