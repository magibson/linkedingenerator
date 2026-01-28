"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { UserSettings, BatchSchedule, DEFAULT_SETTINGS } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ date: "", time: "" });
  const [newWebsite, setNewWebsite] = useState("");

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem("linkedin-generator-settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem("linkedin-generator-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

        <div className="space-y-8">
          {/* Batch Settings */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Batch Settings</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Posts per batch
                </label>
                <select
                  value={settings.postsPerBatch}
                  onChange={(e) => setSettings({ ...settings, postsPerBatch: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[3, 5, 7, 10].map((n) => (
                    <option key={n} value={n}>{n} posts</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Batches per schedule
                </label>
                <select
                  value={settings.batchCount}
                  onChange={(e) => setSettings({ ...settings, batchCount: Number(e.target.value) as 1 | 2 })}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 batch</option>
                  <option value={2}>2 batches</option>
                </select>
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

          {/* Post Preferences */}
          <section className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Post Preferences</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preferred post length
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "short", label: "Short", desc: "~100 words" },
                    { id: "medium", label: "Medium", desc: "~200 words" },
                    { id: "long", label: "Long", desc: "~300 words" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSettings({ ...settings, postLength: option.id as "short" | "medium" | "long" })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.postLength === option.id
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500"
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-70">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your writing style (optional)
                </label>
                <textarea
                  value={settings.writingStyle}
                  onChange={(e) => setSettings({ ...settings, writingStyle: e.target.value })}
                  placeholder="Describe your writing style, or paste an example post you've written that represents your voice..."
                  className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-slate-500 text-xs mt-2">
                  This helps the AI match your voice. The more examples you provide, the better it learns.
                </p>
              </div>
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
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saved ? (
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
