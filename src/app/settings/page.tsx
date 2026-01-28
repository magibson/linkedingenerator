"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserSettings, BatchSchedule, DEFAULT_SETTINGS, AUDIENCES, AudienceType } from "@/lib/types";

interface WritingExample {
  id: string;
  content: string;
  source: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [writingExamples, setWritingExamples] = useState<WritingExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newSchedule, setNewSchedule] = useState({ date: "", time: "" });
  const [newWebsite, setNewWebsite] = useState("");
  const [newExample, setNewExample] = useState("");
  const [addingExample, setAddingExample] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadSettings();
      loadWritingExamples();
    }
  }, [session]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          postsPerBatch: data.postsPerBatch,
          batchCount: data.batchCount,
          postLength: data.postLength,
          emailAddress: data.emailAddress,
          sourceWebsites: data.sourceWebsites,
          audience: data.audience || "young-professionals",
          customTopics: data.customTopics || [],
          schedules: data.schedules,
          writingStyle: data.writingStyle || "",
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadWritingExamples = async () => {
    try {
      const res = await fetch("/api/writing-examples");
      if (res.ok) {
        const data = await res.json();
        setWritingExamples(data.examples);
      }
    } catch (err) {
      console.error("Failed to load writing examples:", err);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postsPerBatch: settings.postsPerBatch,
          batchCount: settings.batchCount,
          postLength: settings.postLength,
          emailAddress: settings.emailAddress,
          sourceWebsites: settings.sourceWebsites,
          audience: settings.audience,
          customTopics: settings.customTopics,
          schedules: settings.schedules,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addSchedule = () => {
    if (!newSchedule.date || !newSchedule.time) return;
    const schedule: BatchSchedule = {
      id: crypto.randomUUID(),
      date: newSchedule.date,
      time: newSchedule.time,
      enabled: true,
    };
    setSettings({ ...settings, schedules: [...settings.schedules, schedule] });
    setNewSchedule({ date: "", time: "" });
  };

  const removeSchedule = (id: string) => {
    setSettings({
      ...settings,
      schedules: settings.schedules.filter((s) => s.id !== id),
    });
  };

  const addWebsite = () => {
    if (!newWebsite.trim()) return;
    let url = newWebsite.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    setSettings({
      ...settings,
      sourceWebsites: [...settings.sourceWebsites, url],
    });
    setNewWebsite("");
  };

  const removeWebsite = (url: string) => {
    setSettings({
      ...settings,
      sourceWebsites: settings.sourceWebsites.filter((w) => w !== url),
    });
  };

  const addWritingExample = async () => {
    if (!newExample.trim()) return;
    setAddingExample(true);
    
    try {
      const res = await fetch("/api/writing-examples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newExample, source: "manual" }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setWritingExamples([data.example, ...writingExamples]);
        setNewExample("");
      }
    } catch (err) {
      console.error("Failed to add example:", err);
    } finally {
      setAddingExample(false);
    }
  };

  const removeWritingExample = async (id: string) => {
    try {
      const res = await fetch(`/api/writing-examples?id=${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        setWritingExamples(writingExamples.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete example:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400 mt-1">Configure your content generation preferences</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            ← Back
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Batch Settings */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Batch Settings</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-300">
                    Posts per batch
                  </label>
                  <span className="text-2xl font-bold text-white">{settings.postsPerBatch}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.postsPerBatch}
                  onChange={(e) => setSettings({ ...settings, postsPerBatch: Number(e.target.value) })}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 block mb-3">
                  Batches per schedule
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings({ ...settings, batchCount: 1 })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      settings.batchCount === 1
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    1 Batch
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, batchCount: 2 })}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      settings.batchCount === 2
                        ? "bg-blue-600 text-white"
                        : "bg-slate-900/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                    }`}
                  >
                    2 Batches
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Schedule</h2>
            <p className="text-slate-400 text-sm mb-4">Set specific dates and times for batch generation</p>

            {/* Existing schedules */}
            {settings.schedules.length > 0 && (
              <div className="space-y-2 mb-4">
                {settings.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between bg-slate-900/30 px-4 py-3 rounded-xl"
                  >
                    <div className="text-slate-200">
                      <span className="font-medium">{new Date(schedule.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                      <span className="text-slate-400 mx-2">at</span>
                      <span className="font-medium">{schedule.time}</span>
                    </div>
                    <button
                      onClick={() => removeSchedule(schedule.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new schedule */}
            <div className="flex gap-3">
              <input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                className="w-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addSchedule}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </section>

          {/* Source Websites */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Source Websites</h2>
            <p className="text-slate-400 text-sm mb-4">Websites to pull topics and inspiration from</p>

            {/* Existing websites */}
            {settings.sourceWebsites.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {settings.sourceWebsites.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-2 bg-slate-900/30 px-3 py-2 rounded-lg"
                  >
                    <span className="text-slate-300 text-sm">{new URL(url).hostname}</span>
                    <button
                      onClick={() => removeWebsite(url)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested sources */}
            <div className="mb-4">
              <p className="text-slate-500 text-xs mb-2">Popular financial news sources:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Kiplinger", url: "https://www.kiplinger.com" },
                  { name: "Yahoo Finance", url: "https://finance.yahoo.com" },
                  { name: "CNBC", url: "https://www.cnbc.com" },
                  { name: "Barchart", url: "https://www.barchart.com" },
                  { name: "MarketWatch", url: "https://www.marketwatch.com" },
                  { name: "Bloomberg", url: "https://www.bloomberg.com" },
                  { name: "Reuters", url: "https://www.reuters.com" },
                  { name: "Investopedia", url: "https://www.investopedia.com" },
                  { name: "Financial Times", url: "https://www.ft.com" },
                  { name: "The Motley Fool", url: "https://www.fool.com" },
                ].filter(s => !settings.sourceWebsites.includes(s.url)).map((source) => (
                  <button
                    key={source.url}
                    onClick={() => setSettings({ 
                      ...settings, 
                      sourceWebsites: [...settings.sourceWebsites, source.url] 
                    })}
                    className="px-3 py-1.5 bg-slate-700/50 hover:bg-blue-600/30 border border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white text-sm rounded-lg transition-all"
                  >
                    + {source.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Add new website */}
            <div className="flex gap-3">
              <input
                type="text"
                value={newWebsite}
                onChange={(e) => setNewWebsite(e.target.value)}
                placeholder="e.g., investmentnews.com"
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addWebsite}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </section>

          {/* Target Audience */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Target Audience</h2>
            <p className="text-slate-400 text-sm mb-4">Content topics will be curated based on your selected audience</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {AUDIENCES.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => setSettings({ ...settings, audience: audience.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    settings.audience === audience.id
                      ? "bg-blue-600/20 border-blue-500"
                      : "bg-slate-900/30 border-slate-600 hover:border-slate-500"
                  }`}
                >
                  <div className={`font-medium ${settings.audience === audience.id ? "text-white" : "text-slate-300"}`}>
                    {audience.label}
                  </div>
                  <div className={`text-sm mt-1 ${settings.audience === audience.id ? "text-blue-200" : "text-slate-500"}`}>
                    {audience.description}
                  </div>
                </button>
              ))}
            </div>

            {/* Show topics for selected audience */}
            {settings.audience && settings.audience !== "custom" && (
              <div className="bg-slate-900/30 rounded-xl p-4">
                <p className="text-slate-400 text-xs mb-2">
                  <svg className="w-4 h-4 inline mr-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Content will focus on these topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.find(a => a.id === settings.audience)?.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-full capitalize"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Post Preferences */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Post Preferences</h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-300">
                    Preferred post length
                  </label>
                  <span className="text-lg font-bold text-white capitalize">
                    {settings.postLength} 
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      (~{settings.postLength === "short" ? "100" : settings.postLength === "medium" ? "200" : "300"} words)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={settings.postLength === "short" ? 0 : settings.postLength === "medium" ? 1 : 2}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSettings({ 
                      ...settings, 
                      postLength: val === 0 ? "short" : val === 1 ? "medium" : "long" 
                    });
                  }}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Short</span>
                  <span>Medium</span>
                  <span>Long</span>
                </div>
              </div>
            </div>
          </section>

          {/* Writing Examples */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Writing Examples</h2>
            <p className="text-slate-400 text-sm mb-4">
              Add examples of your writing style. The AI will learn from these to match your voice.
            </p>

            {/* Existing examples */}
            {writingExamples.length > 0 && (
              <div className="space-y-3 mb-4">
                {writingExamples.map((example) => (
                  <div
                    key={example.id}
                    className="bg-slate-900/30 px-4 py-3 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap line-clamp-4">
                        {example.content}
                      </p>
                      <button
                        onClick={() => removeWritingExample(example.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-slate-500 text-xs mt-2">
                      Added {new Date(example.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add new example */}
            <div className="space-y-3">
              <textarea
                value={newExample}
                onChange={(e) => setNewExample(e.target.value)}
                placeholder="Paste an example LinkedIn post you've written that represents your voice..."
                className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={addWritingExample}
                disabled={addingExample || !newExample.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-xl transition-colors"
              >
                {addingExample ? "Adding..." : "Add Example"}
              </button>
            </div>
          </section>

          {/* Delivery */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Delivery</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address for summaries
              </label>
              <input
                type="email"
                value={settings.emailAddress}
                onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : saved ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </>
            ) : (
              "Save Settings"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
