"use client";

export default function SettingsGeneralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General</h2>
        <p className="text-sm text-gray-500">Blog name, description, and branding.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Organization name
          </label>
          <input
            type="text"
            defaultValue="My Blog"
            className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Blog description
          </label>
          <textarea
            rows={3}
            defaultValue=""
            placeholder="A short description of your blog..."
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-green-500 focus:ring-1 focus:ring-green-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default language
          </label>
          <select className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white">
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>German</option>
            <option>Japanese</option>
          </select>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Timezone
          </label>
          <select className="mt-2 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white">
            <option>UTC</option>
            <option>America/New_York (EST)</option>
            <option>America/Los_Angeles (PST)</option>
            <option>Europe/London (GMT)</option>
            <option>Asia/Tokyo (JST)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
          Save Changes
        </button>
      </div>
    </div>
  );
}
