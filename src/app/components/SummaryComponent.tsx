"use client";

import { useState } from "react";

const SummaryComponent = () => {
  const [url, setUrl] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showFarcasterNote, setShowFarcasterNote] = useState(false);
  const [showTwitterNote, setShowTwitterNote] = useState(false);

  // Helper to detect URL types
  const getUrlType = (url: string): string => {
    if (url.includes("warpcast.com") || url.includes("farcaster.xyz")) {
      return "Farcaster";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      return "Twitter";
    } else {
      return "website";
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newUrl = e.target.value.trim();

    // Remove @ symbol if it's at the beginning of the URL
    if (newUrl.startsWith("@")) {
      newUrl = newUrl.substring(1);
    }

    // Make sure URL has proper https:// prefix
    if (
      newUrl &&
      !newUrl.startsWith("http://") &&
      !newUrl.startsWith("https://")
    ) {
      newUrl = "https://" + newUrl;
    }

    setUrl(newUrl);
    // Show note if it's a Farcaster URL
    setShowFarcasterNote(
      newUrl.includes("warpcast.com") || newUrl.includes("farcaster.xyz")
    );
    // Show Twitter note if it's a Twitter URL
    setShowTwitterNote(
      newUrl.includes("twitter.com") || newUrl.includes("x.com")
    );
  };

  const handleSummarize = async () => {
    if (!url) return;

    setLoading(true);
    setError("");
    setSummary("");

    // Simple URL validation
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("Please enter a valid URL starting with http:// or https://");
      setLoading(false);
      return;
    }

    try {
      const urlType = getUrlType(url);
      console.log(`Processing ${urlType} URL: ${url}`);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || `Failed to get summary`;

        // Provide more helpful error messages based on URL type
        if (
          urlType === "Farcaster" &&
          errorMessage.includes("Failed to extract content")
        ) {
          errorMessage =
            "Unable to extract Farcaster content. This might be due to the post being private or requiring authentication. Please try the Text Summarizer tab instead and paste the post content directly.";
        }

        throw new Error(errorMessage);
      }

      setSummary(data.summary);
    } catch (error) {
      console.error("Error fetching summary:", error);
      setError(
        error instanceof Error ? error.message : "Failed to summarize content"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
        Paste any URL to instantly get the "vibe" - a one-sentence summary that
        captures the essence of the content.
      </p>

      {showFarcasterNote && (
        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
          <p>
            <strong>Note:</strong> Farcaster URLs may be difficult to scrape. If
            summarization fails, please use the Text Summarizer tab and paste
            the content directly.
          </p>
        </div>
      )}

      {showTwitterNote && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm">
          <p>
            <strong>Note:</strong> When using Twitter/X links, make sure to use
            the full URL. If extraction fails, you can copy the tweet text
            directly to the Text Summarizer.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="Paste article URL here..."
            className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-gray-50 shadow-sm"
          />
          {url && (
            <button
              onClick={() => {
                setUrl("");
                setShowFarcasterNote(false);
                setShowTwitterNote(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear input"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleSummarize}
          disabled={loading || !url}
          className={`px-6 py-3.5 rounded-lg font-medium text-white shadow-sm ${
            loading || !url
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transform transition-all duration-200 ease-in-out hover:shadow"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            "Get the Vibe"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 mr-2 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}

      {summary && (
        <div className="mt-8 p-6 border border-blue-100 rounded-lg bg-blue-50 shadow-sm">
          <h2 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">
            THE VIBE
          </h2>
          <p className="text-xl font-medium text-gray-800 leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryComponent;
