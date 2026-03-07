"use client";

import { useState } from "react";

const MOCK_MEDIA = [
  { id: 1, name: "hero-banner.png", type: "image/png", size: "2.4 MB", dimensions: "1920×1080", uploadedAt: "2 hours ago", usedIn: 3 },
  { id: 2, name: "team-photo.jpg", type: "image/jpeg", size: "1.8 MB", dimensions: "2400×1600", uploadedAt: "1 day ago", usedIn: 1 },
  { id: 3, name: "product-demo.mp4", type: "video/mp4", size: "12.3 MB", dimensions: "1920×1080", uploadedAt: "3 days ago", usedIn: 2 },
  { id: 4, name: "logo-dark.svg", type: "image/svg+xml", size: "4 KB", dimensions: "240×60", uploadedAt: "1 week ago", usedIn: 5 },
  { id: 5, name: "blog-cover-seo.png", type: "image/png", size: "890 KB", dimensions: "1200×630", uploadedAt: "1 week ago", usedIn: 1 },
  { id: 6, name: "infographic-growth.png", type: "image/png", size: "1.5 MB", dimensions: "800×2000", uploadedAt: "2 weeks ago", usedIn: 2 },
  { id: 7, name: "screenshot-dashboard.png", type: "image/png", size: "456 KB", dimensions: "1440×900", uploadedAt: "2 weeks ago", usedIn: 1 },
  { id: 8, name: "icon-set.svg", type: "image/svg+xml", size: "12 KB", dimensions: "24×24", uploadedAt: "3 weeks ago", usedIn: 8 },
];

function FileIcon({ type }: { type: string }) {
  if (type.startsWith("video/")) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-purple-50 dark:bg-purple-900/20">
        <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
      </div>
    );
  }
  if (type.includes("svg")) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-900/20">
        <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800/50">
      <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    </div>
  );
}

export default function MediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const totalSize = "19.4 MB";
  const totalFiles = MOCK_MEDIA.length;
  const imageCount = MOCK_MEDIA.filter((m) => m.type.startsWith("image/")).length;
  const videoCount = MOCK_MEDIA.filter((m) => m.type.startsWith("video/")).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Media</h1>
          <p className="text-sm text-gray-500">
            {totalFiles} files · {totalSize} used · {imageCount} images · {videoCount} videos
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload
        </button>
      </div>

      {/* Upload drop zone */}
      <div className="border-dashed border-2 border-gray-300 bg-gray-50 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors dark:border-gray-700 dark:bg-gray-950 dark:hover:border-accent/50">
        <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-3 text-sm text-gray-500">Drag and drop files here or click to browse</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">PNG, JPG, GIF, SVG, MP4, WebP up to 10MB</p>
      </div>

      {/* View toggle + search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${view === "grid" ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${view === "list" ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search media..."
            className="h-9 w-48 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600 dark:focus:border-gray-700"
          />
        </div>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {MOCK_MEDIA.map((file) => (
            <div
              key={file.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-green-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/50"
            >
              <div className="aspect-video">
                <FileIcon type={file.type} />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                  <span>{file.size}</span>
                  <span>·</span>
                  <span>{file.dimensions}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-gray-400 dark:text-gray-600">{file.uploadedAt}</span>
                  <span className="text-xs text-gray-500">Used in {file.usedIn} posts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">File</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:table-cell">Type</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">Size</th>
                <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">Dimensions</th>
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Used in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {MOCK_MEDIA.map((file) => (
                <tr key={file.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <FileIcon type={file.type} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">{file.uploadedAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className="text-sm text-gray-500">{file.type.split("/")[1].toUpperCase()}</span>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="text-sm text-gray-500">{file.size}</span>
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell">
                    <span className="text-sm text-gray-400 dark:text-gray-600">{file.dimensions}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm text-gray-500">{file.usedIn} posts</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
