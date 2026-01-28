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
  const [promptCopied, setPromptCopied] = useState(false);

  const getToneLabel = () => tones.find(t => t.id === tone)?.label || tone;
  const getContentTypeLabel = () => contentTypes.find(ct => ct.id === contentType)?.label || contentType;

  const generatePrompt = () => {
    return `/linkedin ${getContentTypeLabel().toLowerCase()} | ${getToneLabel().toLowerCase()} tone

${topic}`;
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatePrompt());
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopyPrompt}
              disabled={!topic.trim()}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {promptCopied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied! Paste to Jarvis
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Prompt for Jarvis
                </>
              )}
            </button>
          </div>

          {/* Prompt Preview */}
          {topic.trim() && (
            <div className="mt-4 p-4 bg-slate-900/30 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-500 mb-2">Prompt preview:</div>
              <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono">
                {generatePrompt()}
              </pre>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-white font-medium mb-3">How it works:</h3>
          <ol className="text-slate-400 text-sm space-y-2">
            <li className="flex gap-3">
              <span className="text-blue-400 font-mono">1.</span>
              Fill in your topic and select options above
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-mono">2.</span>
              Click "Copy Prompt for Jarvis"
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-mono">3.</span>
              Paste in Telegram → Jarvis generates your content
            </li>
            <li className="flex gap-3">
              <span className="text-blue-400 font-mono">4.</span>
              Copy the result to LinkedIn
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          Powered by Jarvis 🔵
        </div>
      </div>
    </div>
  );
}
