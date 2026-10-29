import {
  extractCoverImageFromDescription,
  fetchMediumRssFeed,
  type MediumRssItem,
} from "@/lib/mediumRss";
import { supabase } from "@/lib/supabaseClient";
import {
  AddAllBlogsResponse,
  AddAllBlogsResponseData,
  AddBlogRequest,
  Blog,
} from "@/types/blog.types";
import { NextRequest, NextResponse } from "next/server";

function rssItemToBlog(item: MediumRssItem): Pick<
  Blog,
  "title" | "author_name" | "published_date" | "cover_image_url" | "link"
> {
  const cover_image_url = extractCoverImageFromDescription(item.description);
  const published_date = new Date(item.pubDate).toISOString();
  return {
    title: item.title ?? null,
    author_name: item.author ?? null,
    published_date,
    cover_image_url: cover_image_url ?? null,
    link: item.link,
  };
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AddAllBlogsResponse>> {
  try {
    const body: AddBlogRequest = await request.json();
    const { username } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required",
          data: {
            added: 0,
            skipped: 0,
            errors: ["Missing or invalid username parameter"],
            total: 0,
          },
        },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username cannot be empty",
          data: {
            added: 0,
            skipped: 0,
            errors: ["Username is empty"],
            total: 0,
          },
        },
        { status: 400 }
      );
    }

    const rssData = await fetchMediumRssFeed(trimmedUsername);

    console.log("rssData", rssData);

    if (rssData.status !== "ok" || !rssData.items?.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch or parse blog data",
          data: {
            added: 0,
            skipped: 0,
            errors: [
              rssData.status !== "ok"
                ? "RSS feed could not be processed"
                : "No items in feed",
            ],
            total: 0,
          },
        },
        { status: 400 }
      );
    }

    const blogs: Pick<
      Blog,
      "title" | "author_name" | "published_date" | "cover_image_url" | "link"
    >[] = rssData.items.map(rssItemToBlog);

    const links = blogs.map((b) => b.link);
    console.log("links", links);
    const { data: existingRows } = await supabase
      .from("blogs")
      .select("link")
      .in("link", links);

    console.log("existingRows", existingRows);

    const existingLinks = new Set(
      (existingRows ?? []).map((row: { link: string }) => row.link)
    );
    const toInsert = blogs.filter((b) => !existingLinks.has(b.link));

    const errors: string[] = [];
    const skipped = blogs.length - toInsert.length;
    let added = 0;

    if (toInsert.length > 0) {
      const updatedBlogs = toInsert.map((b) => ({
        ...b,
        username: trimmedUsername,
      }));
      const { error } = await supabase.from("blogs").insert(updatedBlogs);

      if (error) {
        if (error.code === "23505") {
          errors.push(
            "One or more links already exist (race condition); no rows inserted."
          );
        } else {
          errors.push(`Insert failed: ${error.message}`);
        }
      } else {
        added = toInsert.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${blogs.length} items. Added: ${added}, Skipped (already present): ${skipped}`,
      data: {
        added,
        skipped,
        errors,
        total: blogs.length,
      } as AddAllBlogsResponseData,
    });
  } catch (error) {
    console.error("Add blog error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during processing",
        data: {
          added: 0,
          skipped: 0,
          errors: [
            error instanceof Error ? error.message : "Unknown error",
          ],
          total: 0,
        },
      },
      { status: 500 }
    );
  }
}