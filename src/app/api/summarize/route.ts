import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { generateVibeSummary } from "../../utils/summarize";

// Identify content type based on URL
const identifyContentType = (
  url: string
): "article" | "tweet" | "thread" | "blog" | "general" | "farcaster" => {
  const urlLower = url.toLowerCase();

  // Social media platforms
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
    return "tweet";
  } else if (
    urlLower.includes("warpcast.com") ||
    urlLower.includes("farcaster.xyz")
  ) {
    return "farcaster";
  } else if (
    urlLower.includes("medium.com") ||
    urlLower.includes("substack.com") ||
    urlLower.match(/\.blog($|\/)/)
  ) {
    return "blog";
  } else if (
    urlLower.includes("reddit.com") ||
    urlLower.includes("hackernews.com") ||
    urlLower.includes("news.ycombinator.com") ||
    urlLower.includes("forum")
  ) {
    return "thread";
  } else if (
    urlLower.includes("news.") ||
    urlLower.includes("nytimes.com") ||
    urlLower.includes("bbc.") ||
    urlLower.includes("cnn.com") ||
    urlLower.includes("washingtonpost.com")
  ) {
    return "article";
  } else {
    // Default to article for most web content
    return "article";
  }
};

// Unified content extraction that works for all URLs
const extractContentFromUrl = async (url: string): Promise<string> => {
  try {
    console.log(`Extracting content from URL: ${url}`);

    // Use a more robust user agent and headers
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      timeout: 20000, // Increased timeout for slower sites
      maxRedirects: 5, // Handle redirects
    });

    const html = response.data;
    console.log(`Successfully fetched page content (${html.length} bytes)`);

    // Create DOM from HTML
    const dom = new JSDOM(html, { url });
    const document = dom.window.document;

    // Try multiple extraction methods in sequence
    let content = "";

    // 1. First try Mozilla Readability (works well for articles)
    try {
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      if (article && article.textContent && article.textContent.length > 100) {
        console.log("Successfully extracted content using Readability");
        return article.textContent;
      }
    } catch (readabilityError) {
      console.log("Readability extraction failed:", readabilityError);
    }

    // 2. Try platform-specific selectors
    const platformSpecificContent = extractPlatformSpecificContent(
      document,
      url
    );
    if (platformSpecificContent && platformSpecificContent.length > 50) {
      console.log(
        "Successfully extracted content using platform-specific selectors"
      );
      return platformSpecificContent;
    }

    // 3. Extract main content areas as fallback
    const mainElements = document.querySelectorAll(
      'main, article, .content, .post, #content, [role="main"], .article-content, .entry-content, .post-content, .story-content'
    );
    if (mainElements.length > 0) {
      content = Array.from(mainElements)
        .map((el) => el.textContent)
        .join(" ")
        .trim();

      if (content && content.length > 50) {
        console.log("Successfully extracted content from main content areas");
        return content;
      }
    }

    // 4. Try to find textual content in specific elements
    const contentElements = document.querySelectorAll(
      "p, h1, h2, h3, h4, h5, h6, li, blockquote, .text"
    );
    if (contentElements.length > 0) {
      // Filter out navigation, footer, and sidebar elements
      const filteredElements = Array.from(contentElements).filter((el) => {
        const parent = el.parentElement;
        if (!parent) return true;

        const parentClasses = parent.className.toLowerCase();
        const parentId = parent.id.toLowerCase();

        // Skip elements in navigation, footer, sidebar, etc.
        return !(
          parentClasses.includes("nav") ||
          parentClasses.includes("menu") ||
          parentClasses.includes("footer") ||
          parentClasses.includes("sidebar") ||
          parentClasses.includes("comment") ||
          parentId.includes("nav") ||
          parentId.includes("menu") ||
          parentId.includes("footer") ||
          parentId.includes("sidebar") ||
          parentId.includes("comment")
        );
      });

      content = filteredElements
        .map((el) => el.textContent)
        .filter((text) => text && text.trim().length > 10) // Only include meaningful text
        .join(" ")
        .trim();

      if (content && content.length > 50) {
        console.log(
          "Successfully extracted filtered content from text elements"
        );
        return content;
      }
    }

    // 5. Collect all paragraphs
    const paragraphs = Array.from(document.querySelectorAll("p"));
    if (paragraphs.length > 0) {
      content = paragraphs
        .map((p) => p.textContent)
        .join(" ")
        .trim();

      if (content && content.length > 50) {
        console.log("Successfully extracted content from paragraphs");
        return content;
      }
    }

    // 6. Last resort: get body text, but try to clean it
    let bodyText = document.body.textContent?.trim() || "";

    // Basic cleaning - remove excessive whitespace and join lines
    bodyText = bodyText
      .replace(/\s+/g, " ") // Replace multiple spaces/newlines with single space
      .trim();

    if (bodyText.length > 0) {
      console.log("Falling back to body text");
      return bodyText;
    }

    throw new Error("Failed to extract meaningful content from the URL");
  } catch (error: any) {
    console.error("Error extracting content from URL:", error);
    throw new Error(
      `Failed to extract content: ${error.message || "Unknown error"}`
    );
  }
};

// Extract content using platform-specific selectors
const extractPlatformSpecificContent = (
  document: Document,
  url: string
): string => {
  const urlLower = url.toLowerCase();

  // Twitter/X specific selectors
  if (urlLower.includes("twitter.com") || urlLower.includes("x.com")) {
    const tweetSelectors = [
      '[data-testid="tweetText"]',
      ".tweet-text",
      ".js-tweet-text",
      "article p",
      '[role="article"] p',
      ".css-901oao", // Another Twitter class
      '[data-text="true"]',
    ];

    for (const selector of tweetSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  // Farcaster specific selectors
  if (urlLower.includes("warpcast.com") || urlLower.includes("farcaster.xyz")) {
    const farcasterSelectors = [
      '[data-cast-content="true"]',
      '[data-text="true"]',
      ".cast-body",
      ".cast-content",
      ".cast-text",
      "article p",
      ".message",
      ".cast",
    ];

    for (const selector of farcasterSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  // Reddit specific selectors
  if (urlLower.includes("reddit.com")) {
    const redditSelectors = [
      ".thing .md",
      ".expando",
      '[data-click-id="text"] p',
      '[data-click-id="body"] p',
      '[data-testid="post-container"] p',
      ".Post__content",
      ".RichTextJSON-root",
      "shreddit-post",
      ".fIRMSn",
    ];

    for (const selector of redditSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  // Hacker News specific selectors
  if (
    urlLower.includes("news.ycombinator.com") ||
    urlLower.includes("hackernews")
  ) {
    const hnSelectors = [
      ".commtext",
      ".comment",
      ".storylink",
      ".titleline",
      ".toptext",
    ];

    for (const selector of hnSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  // Medium specific selectors
  if (urlLower.includes("medium.com")) {
    const mediumSelectors = [
      "article",
      ".section-content",
      ".section-inner",
      'section[data-field="body"]',
      ".story-body-container",
    ];

    for (const selector of mediumSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  // Substack specific selectors
  if (urlLower.includes("substack.com")) {
    const substackSelectors = [
      ".post-content",
      ".body",
      ".post",
      "article",
      ".main-content",
    ];

    for (const selector of substackSelectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements
          .map((el) => el.textContent)
          .join(" ")
          .trim();
      }
    }
  }

  return "";
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

    try {
      // Generic content extraction that works for all URLs
      const extractedContent = await extractContentFromUrl(url);

      if (!extractedContent || extractedContent.trim().length < 50) {
        console.log("Extracted content is too short or empty");
        return NextResponse.json(
          {
            error:
              "Unable to extract sufficient content from this URL. The content may be protected, require authentication, or use technologies that prevent automated access.",
          },
          { status: 400 }
        );
      }

      // Identify content type from URL
      const detectedType = identifyContentType(url);
      console.log(`Generating summary for ${detectedType} content`);

      // Generate summary
      const summary = await generateVibeSummary(extractedContent, detectedType);
      return NextResponse.json({ summary });
    } catch (extractError: any) {
      console.error("Content extraction error:", extractError);

      let errorMessage = "Failed to extract content";

      // Provide more specific error messages
      if (extractError.message?.includes("timeout")) {
        errorMessage =
          "The request timed out. The website might be too slow to respond or blocking our access.";
      } else if (extractError.message?.includes("403")) {
        errorMessage =
          "Access denied. This website restricts automated access to its content.";
      } else if (extractError.message?.includes("404")) {
        errorMessage =
          "Content not found. The URL may be incorrect or the page may have been removed.";
      } else if (extractError.message?.includes("429")) {
        errorMessage =
          "Too many requests. The website has temporarily limited our access.";
      } else if (extractError.message?.includes("5")) {
        errorMessage =
          "The website encountered an error while processing our request.";
      } else {
        errorMessage = `Couldn't extract content: ${
          extractError.message || "Unknown error"
        }`;
      }

      return NextResponse.json(
        {
          error: `${errorMessage} You can try pasting the content directly into the Text Summarizer instead.`,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in summarize API:", error);

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
