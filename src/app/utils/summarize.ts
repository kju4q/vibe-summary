import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a one-sentence "vibe check" summary of text content
 *
 * @param content The text content to summarize
 * @param contentType Optional type of content ('article', 'tweet', etc.) for better prompting
 * @returns A single sentence summary capturing the "vibe" of the content
 */
export async function generateVibeSummary(
  content: string,
  contentType:
    | "article"
    | "tweet"
    | "thread"
    | "blog"
    | "general"
    | "farcaster" = "general"
): Promise<string> {
  if (!content || content.trim().length === 0) {
    throw new Error("Content is required for summarization");
  }

  // Clean up the content a bit
  const cleanedContent = content
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  // Trim content to avoid exceeding token limits
  const trimmedContent = cleanedContent.slice(0, 8000);

  // Adjust system prompt based on content type
  let systemPrompt = "You are a helpful assistant that summarizes content. ";

  switch (contentType) {
    case "article":
      systemPrompt += "The content is a news article or long-form content. ";
      break;
    case "tweet":
      systemPrompt +=
        "The content is from Twitter/X, likely short and concise. ";
      break;
    case "thread":
      systemPrompt +=
        "The content is from a social media thread with multiple posts. ";
      break;
    case "blog":
      systemPrompt +=
        "The content is from a blog post, likely personal and opinionated. ";
      break;
    case "farcaster":
      systemPrompt +=
        "The content is from Farcaster, a decentralized social media platform. Focus on accurately capturing the subject matter and main point of the content, especially regarding web3, crypto, or development topics. Don't infer themes that aren't actually present in the content. ";
      break;
    default:
      // General case - no additional context
      break;
  }

  systemPrompt +=
    'Provide a single sentence that accurately captures the main "vibe" or core message. The summary should be concise, informative, and strictly based on the actual content provided, without adding interpretations that aren\'t supported by the text.';

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Summarize this content in ONE sentence that captures the main point or essence: ${trimmedContent}`,
        },
      ],
      temperature: 0.3, // Lower temperature for more factual responses
      max_tokens: 100,
    });

    // Return the generated summary or a fallback message
    return (
      aiResponse.choices[0]?.message?.content?.trim() || "No summary available"
    );
  } catch (error) {
    console.error("Error generating summary:", error);
    throw new Error("Failed to generate summary");
  }
}
