import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { generateVibeSummary } from "../../utils/summarize";

// Helper function to check if URL is a Farcaster/Warpcast URL
const isFarcasterUrl = (url: string): boolean => {
  return url.includes("warpcast.com") || url.includes("farcaster.xyz");
};

// Helper function to check if URL is a Twitter/X URL
const isTwitterUrl = (url: string): boolean => {
  return url.includes("twitter.com") || url.includes("x.com");
};

// Helper function to extract Twitter/X content
const extractTwitterContent = async (url: string): Promise<string> => {
  try {
    console.log(`Attempting to extract content from Twitter URL: ${url}`);

    // For Twitter URLs, we need special headers
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    console.log("Successfully fetched Twitter page content");
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Try multiple selector strategies for Twitter
    const extractionStrategies = [
      // Strategy 1: Look for tweet text
      () => {
        const elements = Array.from(
          document.querySelectorAll(
            '[data-testid="tweetText"], .tweet-text, .js-tweet-text'
          )
        );
        return elements.length > 0
          ? elements
              .map((el) => el.textContent)
              .join(" ")
              .trim()
          : null;
      },
      // Strategy 2: Look for article content
      () => {
        const elements = Array.from(
          document.querySelectorAll('article p, [role="article"] p')
        );
        return elements.length > 0
          ? elements
              .map((el) => el.textContent)
              .join(" ")
              .trim()
          : null;
      },
      // Strategy 3: Try with Readability
      () => {
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        return article?.textContent?.trim() || null;
      },
      // Strategy 4: Fallback to main content
      () => {
        const mainContent = document.querySelector("main");
        return mainContent ? mainContent.textContent?.trim() : null;
      },
    ];

    // Try each strategy until one works
    for (const strategy of extractionStrategies) {
      const content = strategy();
      if (content && content.length > 10) {
        // Must be longer than 10 chars to be valid
        console.log(
          `Extracted Twitter content using strategy, length: ${content.length} chars`
        );
        return content;
      }
    }

    // If all strategies fail, extract the body text
    const bodyText = document.body.textContent || "";
    console.log(`Falling back to body text, length: ${bodyText.length} chars`);
    return bodyText;
  } catch (error) {
    console.error("Error extracting Twitter content:", error);
    throw new Error("Failed to extract content from Twitter URL");
  }
};

// Helper function to extract Farcaster content
const extractFarcasterContent = async (url: string): Promise<string> => {
  try {
    console.log(`Attempting to extract content from Farcaster URL: ${url}`);

    // For Farcaster URLs, we need to use specific headers and might need different parsing
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    console.log("Successfully fetched page content");
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Try multiple selector strategies for Warpcast
    const extractionStrategies = [
      // Strategy 1: Look for specific data attributes used by Warpcast
      () => {
        const elements = Array.from(
          document.querySelectorAll(
            '[data-cast-content="true"], [data-text="true"]'
          )
        );
        return elements.length > 0
          ? elements
              .map((el) => el.textContent)
              .join(" ")
              .trim()
          : null;
      },
      // Strategy 2: Look for common cast content classes
      () => {
        const elements = Array.from(
          document.querySelectorAll(".cast-body, .cast-content, .cast-text")
        );
        return elements.length > 0
          ? elements
              .map((el) => el.textContent)
              .join(" ")
              .trim()
          : null;
      },
      // Strategy 3: Look for any article paragraphs
      () => {
        const elements = Array.from(document.querySelectorAll("article p"));
        return elements.length > 0
          ? elements
              .map((el) => el.textContent)
              .join(" ")
              .trim()
          : null;
      },
      // Strategy 4: Try to find the main content using common patterns
      () => {
        const mainContent = document.querySelector("main");
        return mainContent ? mainContent.textContent?.trim() : null;
      },
      // Strategy 5: Fallback to all paragraphs
      () => {
        const paragraphs = Array.from(document.querySelectorAll("p"));
        return paragraphs.length > 0
          ? paragraphs
              .map((p) => p.textContent)
              .join(" ")
              .trim()
          : null;
      },
    ];

    // Try each strategy until one works
    for (const strategy of extractionStrategies) {
      const content = strategy();
      if (content) {
        console.log(
          `Extracted content using strategy, length: ${content.length} chars`
        );
        return content;
      }
    }

    // If all strategies fail, extract the body text
    const bodyText = document.body.textContent || "";
    console.log(`Falling back to body text, length: ${bodyText.length} chars`);
    return bodyText;
  } catch (error) {
    console.error("Error extracting Farcaster content:", error);
    throw new Error("Failed to extract content from Farcaster URL");
  }
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { url, rawContent, contentType } = await request.json();

    // If rawContent is provided, use it directly
    if (rawContent) {
      const summary = await generateVibeSummary(
        rawContent,
        contentType || "general"
      );
      return NextResponse.json({ summary });
    }

    // Otherwise, process the URL
    if (!url) {
      return NextResponse.json(
        { error: "Either URL or raw content is required" },
        { status: 400 }
      );
    }

    // Special handling for Twitter URLs
    if (isTwitterUrl(url)) {
      console.log(`Processing Twitter URL: ${url}`);
      try {
        const content = await extractTwitterContent(url);
        if (!content || content.trim().length < 10) {
          console.log("No meaningful content extracted from Twitter URL");
          return NextResponse.json(
            {
              error:
                "Failed to extract meaningful content from Twitter. The tweet might be private, deleted, or require authentication.",
            },
            { status: 400 }
          );
        }

        console.log(
          `Generating summary for Twitter content: ${content.substring(
            0,
            100
          )}...`
        );
        const summary = await generateVibeSummary(content, "tweet");
        return NextResponse.json({ summary });
      } catch (error) {
        console.error("Error processing Twitter URL:", error);
        return NextResponse.json(
          {
            error:
              "Failed to process Twitter URL. Please copy and paste the tweet content directly.",
          },
          { status: 400 }
        );
      }
    }

    // Special handling for Farcaster URLs
    if (isFarcasterUrl(url)) {
      console.log(`Processing Farcaster URL: ${url}`);
      try {
        const content = await extractFarcasterContent(url);
        if (!content || content.trim().length === 0) {
          console.log("No content extracted from Farcaster URL");
          return NextResponse.json(
            {
              error:
                "Failed to extract content from Farcaster URL - the post might be private or require authentication",
            },
            { status: 400 }
          );
        }

        console.log(
          `Generating summary for Farcaster content: ${content.substring(
            0,
            100
          )}...`
        );
        const summary = await generateVibeSummary(content, "farcaster"); // Use farcaster-specific handling
        return NextResponse.json({ summary });
      } catch (error) {
        console.error("Error processing Farcaster URL:", error);
        return NextResponse.json(
          {
            error:
              "Failed to process Farcaster URL. Please copy and paste the content directly.",
          },
          { status: 400 }
        );
      }
    }

    // Handle regular URLs
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    // Parse the HTML content
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return NextResponse.json(
        { error: "Failed to extract content from the URL" },
        { status: 400 }
      );
    }

    // Use the extracted content with our summarization function
    const detectedType =
      url.includes("twitter.com") || url.includes("x.com")
        ? "tweet"
        : "article";
    const summary = await generateVibeSummary(
      article.textContent,
      detectedType
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in summarize API:", error);
    return NextResponse.json(
      { error: "Failed to summarize content" },
      { status: 500 }
    );
  }
}
