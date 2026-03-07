import { supabase } from "@/lib/supabaseClient";
import {
  AddAllBlogsResponse,
  AddAllBlogsResponseData,
  AddBlogRequest,
  AddBlogResponse,
  Blog,
} from "@/types/blog.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

interface RSSItem {
  title: string;
  author: string;
  pubDate: string;
  description: string;
  link: string;
}

interface RSSResponse {
  status: string;
  feed: {
    title: string;
    description: string;
    link: string;
  };
  items: RSSItem[];
}

function extractCoverImageFromDescription(description: string): string | null {
  const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
  return imgMatch ? imgMatch[1] : null;
}

function parseMediumUrl(url: string): {
  type: "user" | "publication" | "custom_domain" | "article";
  slug: string;
  domain?: string;
  isProfile: boolean;
} | null {
  try {
    const urlObj = new URL(url);

    // Check if it's a Medium URL
    if (!urlObj.hostname.includes("medium.com")) {
      return null;
    }

    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    // Check for custom Medium domain pattern: username.medium.com
    if (
      urlObj.hostname.endsWith(".medium.com") &&
      !urlObj.hostname.startsWith("www.")
    ) {
      const username = urlObj.hostname.replace(".medium.com", "");
      // If there are path parts after the domain, it's an article; otherwise it's a profile
      const isProfile = pathParts.length === 0;
      return {
        type: isProfile ? "custom_domain" : "article",
        slug: username,
        domain: urlObj.hostname,
        isProfile,
      };
    }

    // Check for RSS feed pattern: /feed/@username
    if (pathParts[0] === "feed" && pathParts[1]?.startsWith("@")) {
      const username = pathParts[1].substring(1);
      return {
        type: "user",
        slug: username,
        isProfile: true,
      };
    }

    // Check for user profile pattern: /@username
    if (pathParts[0]?.startsWith("@")) {
      const username = pathParts[0].substring(1);
      // If there are more path parts after @username, it's an article; otherwise it's a profile
      const isProfile = pathParts.length === 1;
      return {
        type: isProfile ? "user" : "article",
        slug: username,
        isProfile,
      };
    }

    // Check for publication pattern: /publication-name
    if (pathParts[0] && !pathParts[0].startsWith("@")) {
      const publication = pathParts[0];
      // If there are more path parts after publication-name, it's an article; otherwise it's a profile
      const isProfile = pathParts.length === 1;
      return {
        type: isProfile ? "publication" : "article",
        slug: publication,
        isProfile,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchRSSFeed(
  slug: string,
  type: "user" | "publication" | "custom_domain" | "article",
  domain?: string
): Promise<RSSResponse> {
  let rssUrl: string;

  if (type === "custom_domain" && domain) {
    rssUrl = `https://${domain}/feed`;
  } else if (type === "user") {
    rssUrl = `https://medium.com/@${slug}/feed`;
  } else if (type === "article") {
    // For articles, we need to determine the RSS feed URL based on the original URL
    // This will be handled in the main function
    throw new Error("Article type should be handled differently");
  } else {
    rssUrl = `https://medium.com/feed/${slug}`;
  }

  const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    rssUrl
  )}`;

  const response = await fetch(rss2jsonUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`);
  }

  return response.json();
}

function findBlogPostInRSS(
  rssData: RSSResponse,
  targetUrl: string
): RSSItem | null {
  // First try exact match
  let found = rssData.items.find((item) => item.link === targetUrl);
  if (found) return found;

  // If no exact match, try matching without query parameters
  const targetUrlWithoutQuery = targetUrl.split("?")[0];
  found = rssData.items.find((item) => {
    const itemUrlWithoutQuery = item.link.split("?")[0];
    return itemUrlWithoutQuery === targetUrlWithoutQuery;
  });

  return found || null;
}

async function addAllBlogsFromAuthor(
  rssData: RSSResponse,
  supabase: SupabaseClient
): Promise<{
  success: boolean;
  added: number;
  skipped: number;
  errors: string[];
}> {
  const results = {
    success: true,
    added: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const item of rssData.items) {
    try {
      const coverImageUrl = extractCoverImageFromDescription(item.description);
      const publishedDate = new Date(item.pubDate).toISOString();

      const blogData = {
        title: item.title,
        author_name: item.author,
        published_date: publishedDate,
        cover_image_url: coverImageUrl || undefined,
        link: item.link,
        category: "Medium",
      };

      const { error } = await supabase.from("blogs").upsert(blogData, {
        onConflict: "link",
        ignoreDuplicates: false,
      });

      if (error) {
        if (error.code === "23505") {
          // Duplicate key error - blog already exists
          results.skipped++;
        } else {
          results.errors.push(
            `Failed to add "${item.title}": ${error.message}`
          );
        }
      } else {
        results.added++;
      }
    } catch (error) {
      results.errors.push(
        `Error processing "${item.title}": ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return results;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AddBlogResponse | AddAllBlogsResponse>> {
  try {
    const body: AddBlogRequest = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "URL is required",
          error: "Missing or invalid URL parameter",
        },
        { status: 400 }
      );
    }

    // Parse the Medium URL
    const parsedUrl = parseMediumUrl(url);
    if (!parsedUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Medium URL format",
          error: "URL must be a valid Medium user or publication URL",
        },
        { status: 400 }
      );
    }

    // Handle profile URLs (add all blogs from author)
    if (parsedUrl.isProfile) {
      const rssData = await fetchRSSFeed(
        parsedUrl.slug,
        parsedUrl.type,
        parsedUrl.domain
      );

      if (rssData.status !== "ok") {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to fetch blog data",
            error: "RSS feed could not be processed",
          },
          { status: 400 }
        );
      }

      // Add all blogs from the author
      const results = await addAllBlogsFromAuthor(rssData, supabase);

      return NextResponse.json({
        success: true,
        message: `Successfully processed author's blogs. Added: ${results.added}, Skipped: ${results.skipped}`,
        data: {
          added: results.added,
          skipped: results.skipped,
          errors: results.errors,
          total: rssData.items.length,
        } as AddAllBlogsResponseData,
      });
    }

    // Handle article URLs (add specific blog post)
    let rssData: RSSResponse;

    if (parsedUrl.type === "article") {
      // For article URLs, we need to determine the author's RSS feed
      const urlObj = new URL(url);

      if (urlObj.hostname.endsWith(".medium.com")) {
        // Custom domain article
        const domain = urlObj.hostname;
        const username = urlObj.hostname.replace(".medium.com", "");
        rssData = await fetchRSSFeed(username, "custom_domain", domain);
      } else if (urlObj.pathname.startsWith("/@")) {
        // Standard Medium article
        const username = urlObj.pathname.split("/")[1].substring(1);
        rssData = await fetchRSSFeed(username, "user");
      } else {
        // Publication article
        const publication = urlObj.pathname.split("/")[1];
        rssData = await fetchRSSFeed(publication, "publication");
      }
    } else {
      // This shouldn't happen with the new logic, but keeping for safety
      rssData = await fetchRSSFeed(
        parsedUrl.slug,
        parsedUrl.type,
        parsedUrl.domain
      );
    }

    if (rssData.status !== "ok") {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch blog data",
          error: "RSS feed could not be processed",
        },
        { status: 400 }
      );
    }

    // Find the specific blog post
    const blogPost = findBlogPostInRSS(rssData, url);
    if (!blogPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog post not found in RSS feed",
          error: "The specified URL was not found in the author's RSS feed",
        },
        { status: 404 }
      );
    }

    // Extract blog data
    const coverImageUrl = extractCoverImageFromDescription(
      blogPost.description
    );
    const publishedDate = new Date(blogPost.pubDate).toISOString();

    const blogData: Omit<Blog, "id" | "created_at" | "updated_at"> = {
      title: blogPost.title,
      author_name: blogPost.author,
      published_date: publishedDate,
      cover_image_url: coverImageUrl || undefined,
      link: blogPost.link,
      category: "Medium",
    };

    // Upsert to Supabase
    const { data, error } = await supabase
      .from("blogs")
      .upsert(blogData, {
        onConflict: "link",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save blog to database",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog added successfully",
      data: data as Blog,
    });
  } catch (error) {
    console.error("Add blog error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}