"use client";

import { useState } from "react";

const tones = [
  { id: "professional", label: "Professional", desc: "Polished and business-focused" },
  { id: "thought-leader", label: "Thought Leader", desc: "Insightful and authoritative" },
  { id: "storytelling", label: "Storytelling", desc: "Personal narrative style" },
  { id: "casual", label: "Casual", desc: "Friendly and conversational" },
];

const contentTypes = [
  { id: "post", label: "Full Post", desc: "Complete LinkedIn post" },
  { id: "hook", label: "Hook Only", desc: "Attention-grabbing opener" },
  { id: "carousel-outline", label: "Carousel Outline", desc: "Slide-by-slide breakdown" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("post");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setOutput("");
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, contentType }),
      });
      
      const data = await res.json();
      setOutput(data.content || "Error generating content");
    } catch (err) {
      setOutput("Failed to generate content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            LinkedIn Content Generator
          </h1>
          <p className="text-slate-400 text-lg">
            Create engaging LinkedIn posts in seconds
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
          {/* Topic Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              What do you want to post about?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The importance of building genuine relationships in sales, not just chasing numbers..."
              className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tone Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tone
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    tone === t.id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-xs opacity-70 mt-1">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contentTypes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => setContentType(ct.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    contentType === ct.id
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <div className="font-medium text-sm">{ct.label}</div>
                  <div className="text-xs opacity-70 mt-1">{ct.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Content
              </>
            )}
          </button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Generated Content</h2>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy to Clipboard
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600">
              <pre className="whitespace-pre-wrap text-slate-200 font-sans leading-relaxed">
                {output}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          Powered by Gemini ✨
        </div>
      </div>
    </div>
  );
}
