import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import {
  CloudinaryResource,
  CloudinarySearchResult,
  CloudinaryImage,
} from "@/types/gallery.types";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "gallery";
    const maxResults = parseInt(searchParams.get("max_results") || "50");
    const transformation =
      searchParams.get("transformation") || "f_auto,q_auto";

    // Debug environment variables
    const envDebug = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY ? "***SET***" : "NOT_SET",
      apiSecret: process.env.CLOUDINARY_API_SECRET ? "***SET***" : "NOT_SET",
      nodeEnv: process.env.NODE_ENV,
    };

    console.log("Environment debug:", envDebug);

    // Validate environment variables
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Missing Cloudinary environment variables:", envDebug);
      return NextResponse.json(
        {
          error:
            "Cloudinary configuration is missing. Please check your environment variables.",
          debug: envDebug,
        },
        { status: 500 }
      );
    }

    // Fetch images from Cloudinary
    let result: CloudinarySearchResult;
    try {
      result = (await cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by("created_at", "desc")
        .max_results(maxResults)
        .execute()) as CloudinarySearchResult;
    } catch (searchError) {
      console.error("Cloudinary search error:", searchError);
      return NextResponse.json(
        {
          error: "Failed to search Cloudinary",
          details:
            searchError instanceof Error
              ? searchError.message
              : "Unknown search error",
          debug: envDebug,
        },
        { status: 500 }
      );
    }

    if (!result.resources || result.resources.length === 0) {
      return NextResponse.json({
        images: [],
        message: `No images found in folder: ${folder}`,
      });
    }

    // Transform Cloudinary response to our interface
    const images: CloudinaryImage[] = result.resources.map(
      (resource: CloudinaryResource) => {
        // Use folder name as title
        const title = folder;

        // Generate alt text from folder name
        const alt = `Image from ${folder} folder`;

        // Generate URL manually to ensure proper format
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${resource.public_id}`;

        const cloudinaryImage: CloudinaryImage = {
          id: resource.public_id,
          src: imageUrl,
          title: title,
          alt: alt,
          public_id: resource.public_id,
          width: resource.width,
          height: resource.height,
          folder: folder,
        };

        return cloudinaryImage;
      }
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch images from Cloudinary",
        details: error instanceof Error ? error.message : "Unknown error",
        debug: {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY ? "***SET***" : "NOT_SET",
          apiSecret: process.env.CLOUDINARY_API_SECRET
            ? "***SET***"
            : "NOT_SET",
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 500 }
    );
  }
}
