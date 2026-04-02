"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "ko", label: "Korean" },
];

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SettingsGeneralPage() {
  const { data: org, isLoading } = trpc.organization.get.useQuery();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!org) return;
    setName(org.name ?? "");
    const s = (org.settings as Record<string, string> | null) ?? {};
    setDescription(s.description ?? "");
    setLanguage(s.defaultLanguage ?? "en");
    setTimezone(s.timezone ?? "UTC");
  }, [org]);

  const update = trpc.organization.update.useMutation({
    onSuccess: () => {
      utils.organization.get.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const settings = (org?.settings as Record<string, unknown>) ?? {};
    update.mutate({
      name,
      settings: { ...settings, description, defaultLanguage: language, timezone },
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General</h2>
        <p className="text-sm text-gray-500">Workspace name, description, and locale.</p>
      </div>

      {update.error && (
        <div className="rounded-lg bg-red-950/30 px-3 py-2 text-sm text-red-400">
          {update.error.message}
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Workspace name
          </label>
          <input
            id="org-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            This is your organization name shown across the dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label htmlFor="org-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="org-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of your blog or website..."
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <label htmlFor="org-lang" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Default language
            </label>
            <select
              id="org-lang"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <label htmlFor="org-tz" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Timezone
            </label>
            <select
              id="org-tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="text-sm text-green-500">Saved!</span>
        )}
        <button
          type="submit"
          disabled={update.isPending}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          {update.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
