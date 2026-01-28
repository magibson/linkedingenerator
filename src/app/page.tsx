"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserSettings, DEFAULT_SETTINGS } from "@/lib/types";

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
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("post");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "scheduled">("generate");

  useEffect(() => {
    const stored = localStorage.getItem("linkedin-generator-settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setOutput("");
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          topic, 
          tone, 
          contentType,
          writingStyle: settings?.writingStyle,
          postLength: settings?.postLength,
        }),
      });
      
      const data = await res.json();
      setOutput(data.content || data.error || "Error generating content");
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

  const upcomingSchedules = settings?.schedules
    .filter((s) => new Date(`${s.date}T${s.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              LinkedIn Content Generator
            </h1>
            <p className="text-slate-400 mt-1">
              For NYL Financial Advisors
            </p>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>

        {/* Quick Stats */}
        {settings && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{settings.postsPerBatch}</div>
              <div className="text-slate-400 text-sm">Posts per batch</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{settings.schedules.length}</div>
              <div className="text-slate-400 text-sm">Scheduled batches</div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{settings.sourceWebsites.length}</div>
              <div className="text-slate-400 text-sm">Source websites</div>
            </div>
          </div>
        )}

        {/* Upcoming Schedules */}
        {upcomingSchedules.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Upcoming Generations</span>
            </div>
            <div className="space-y-1">
              {upcomingSchedules.map((s) => (
                <div key={s.id} className="text-slate-300 text-sm">
                  {new Date(`${s.date}T${s.time}`).toLocaleDateString("en-US", { 
                    weekday: "short", 
                    month: "short", 
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "generate"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Quick Generate
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "scheduled"
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Scheduled Posts
          </button>
        </div>

        {activeTab === "generate" ? (
          <>
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
          </>
        ) : (
          /* Scheduled Posts Tab */
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">No scheduled posts yet</h3>
              <p className="text-slate-400 mb-6">
                Set up your schedule in Settings to start generating batches automatically.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Configure Schedule
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
