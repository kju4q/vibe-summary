import { NextRequest, NextResponse } from "next/server";
import { generateVibeSummary } from "../../utils/summarize";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { content, contentType = "general" } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Generate the vibe summary
    const summary = await generateVibeSummary(content, contentType);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in text summary API:", error);

    // More detailed error information
    let errorMessage = "Failed to summarize content";
    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
      console.error("Error stack:", error.stack);
    } else if (typeof error === "string") {
      errorMessage = `Error: ${error}`;
    } else if (error && typeof error === "object") {
      try {
        errorMessage = `Error object: ${JSON.stringify(error)}`;
      } catch {
        errorMessage = "Unknown error object that cannot be stringified";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
