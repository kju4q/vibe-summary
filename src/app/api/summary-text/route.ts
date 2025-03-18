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
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}
