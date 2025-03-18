"use client";

import { useState } from "react";
import SummaryComponent from "./SummaryComponent";
import TextSummaryComponent from "./TextSummaryComponent";

const VibeCheckApp = () => {
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent tracking-tight">
          What&apos;s the Vibe?
        </h1>
        <p className="text-lg text-gray-600 max-w-xl mx-auto font-light">
          Get AI-powered one-sentence summaries of any content in seconds
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex p-1 rounded-xl shadow-sm bg-gray-100">
          <button
            onClick={() => setActiveTab("url")}
            className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
              activeTab === "url"
                ? "bg-white text-blue-700 shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            URL Summarizer
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
              activeTab === "text"
                ? "bg-white text-blue-700 shadow-sm"
                : "bg-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Text Summarizer
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {activeTab === "url" ? <SummaryComponent /> : <TextSummaryComponent />}
      </div>
    </div>
  );
};

export default VibeCheckApp;
