"use client";

import { useState } from "react";

const TextSummaryComponent = () => {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contentType, setContentType] = useState<string>("general");

  const handleSummarize = async () => {
    if (!content) return;

    setLoading(true);
    setError("");
    setSummary("");

    try {
      const response = await fetch("/api/summary-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, contentType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get summary");
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

  const contentTypeOptions = [
    { value: "general", label: "General Content" },
    { value: "article", label: "News Article" },
    { value: "tweet", label: "Tweet" },
    { value: "thread", label: "Thread" },
    { value: "blog", label: "Blog Post" },
    { value: "farcaster", label: "Farcaster Post" },
  ];

  // Get placeholder text based on content type
  const getPlaceholder = () => {
    if (contentType === "farcaster") {
      return "Paste the actual content of the Farcaster post here, not just the URL. For example:\n\nframe v2 development is complex, and there aren't many dev tools yet\n\n@neynar has put together a quickstart script to help frame devs...";
    }
    return "Paste your text here...";
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-gray-600 text-sm leading-relaxed max-w-lg mx-auto">
        Paste any text to instantly get the "vibe" - a one-sentence summary that
        captures the essence of your content.
      </p>

      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label
            htmlFor="contentType"
            className="text-sm font-medium text-gray-700 sm:w-36"
          >
            Content Type:
          </label>
          <select
            id="contentType"
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="flex-1 p-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {contentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {contentType === "farcaster" && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-blue-700 text-sm">
            <p>
              <strong>Note:</strong> For Farcaster posts, please paste the{" "}
              <strong>actual text content</strong> of the post, not just the
              URL.
            </p>
          </div>
        )}

        <div className="relative">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 min-h-[180px] text-sm leading-relaxed"
          />
          {content && (
            <button
              onClick={() => setContent("")}
              className="absolute right-3 top-10 text-gray-400 hover:text-gray-600"
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
          disabled={loading || !content}
          className={`w-full px-6 py-3.5 rounded-lg font-medium text-white shadow-sm transition-all duration-200 ease-in-out ${
            loading || !content
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow"
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

export default TextSummaryComponent;
