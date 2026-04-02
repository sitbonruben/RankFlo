"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/trpc/client";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType, url }: { mimeType: string; url: string }) {
  if (mimeType.startsWith("image/") && !mimeType.includes("svg")) {
    return <img src={url} alt="" className="h-full w-full object-cover" />;
  }
  if (mimeType.startsWith("video/")) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-purple-50 dark:bg-purple-900/20">
        <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
        </svg>
      </div>
    );
  }
  if (mimeType.includes("svg")) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-blue-50 dark:bg-blue-900/20">
        <img src={url} alt="" className="h-full w-full object-contain p-2" />
      </div>
    );
  }
  if (mimeType === "application/pdf") {
    return (
      <div className="flex h-full w-full items-center justify-center bg-red-50 dark:bg-red-900/20">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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

interface UploadFile {
  id: string;
  name: string;
  progress: number; // 0-100 or -1 = error
  done: boolean;
}

export default function MediaPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState<UploadFile[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.media.list.useQuery({
    page,
    pageSize: 24,
    search: search || undefined,
  });

  const deleteMedia = trpc.media.delete.useMutation({
    onSuccess: () => {
      utils.media.list.invalidate();
      setConfirmDelete(null);
    },
  });

  const createMedia = trpc.media.create.useMutation({
    onSuccess: () => utils.media.list.invalidate(),
  });

  async function uploadFile(file: File) {
    const id = Math.random().toString(36).slice(2);
    setUploading((prev) => [...prev, { id, name: file.name, progress: 0, done: false }]);

    try {
      // Get presigned URL
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type, fileSize: file.size }),
      });

      if (!res.ok) {
        const err = await res.json() as { error: string };
        throw new Error(err.error ?? "Upload failed");
      }

      const { presignedUrl, publicUrl } = await res.json() as { presignedUrl: string; publicUrl: string };

      // Upload directly to S3 via presigned PUT
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: pct } : u));
          }
        });
        xhr.addEventListener("load", () => xhr.status < 300 ? resolve() : reject(new Error(`S3 error ${xhr.status}`)));
        xhr.addEventListener("error", () => reject(new Error("Network error")));
        xhr.open("PUT", presignedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Register in DB
      const img = file.type.startsWith("image/") ? await getImageDimensions(publicUrl) : null;
      await createMedia.mutateAsync({
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        url: publicUrl,
        width: img?.width,
        height: img?.height,
      });

      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: 100, done: true } : u));
      setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== id)), 2000);
    } catch (err) {
      setUploading((prev) => prev.map((u) => u.id === id ? { ...u, progress: -1 } : u));
      setTimeout(() => setUploading((prev) => prev.filter((u) => u.id !== id)), 4000);
    }
  }

  function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = url;
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadFile);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  function copyUrl(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const items = data?.items ?? [];
  const totalFiles = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-950 p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Delete file?</h3>
            <p className="mt-2 text-sm text-gray-400">This removes the record from RankFlo. The file on S3 is not deleted.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={() => deleteMedia.mutate({ id: confirmDelete })}
                disabled={deleteMedia.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMedia.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Media</h1>
          <p className="text-sm text-gray-500">
            {isLoading ? "Loading…" : `${totalFiles} file${totalFiles !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => fileInput.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload
        </button>
        <input ref={fileInput} type="file" multiple accept="image/*,video/mp4,video/webm,application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInput.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-gray-300 bg-gray-50 hover:border-green-400 dark:border-gray-700 dark:bg-gray-950 dark:hover:border-accent/50"
        }`}
      >
        <svg className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-3 text-sm text-gray-500">Drag and drop or click to browse</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">PNG, JPG, GIF, SVG, WebP, MP4, PDF — up to 50 MB</p>
      </div>

      {/* Upload progress */}
      {uploading.length > 0 && (
        <div className="space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900 dark:text-white">{u.name}</p>
                {u.progress >= 0 && !u.done && (
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${u.progress}%` }} />
                  </div>
                )}
              </div>
              {u.progress === -1 ? (
                <span className="text-xs text-red-500">Failed</span>
              ) : u.done ? (
                <span className="text-xs text-green-500">Done</span>
              ) : (
                <span className="text-xs text-gray-500">{u.progress}%</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { v: "grid", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
            { v: "list", icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" },
          ].map(({ v, icon }) => (
            <button key={v} onClick={() => setView(v as "grid" | "list")} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${view === v ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search media…"
            className="h-9 w-48 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:placeholder-gray-600"
          />
        </form>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-video animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" />
          )) : items.map((file) => (
            <div key={file.id} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-green-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-accent/50">
              <div className="aspect-video overflow-hidden">
                <FileIcon mimeType={file.mimeType} url={file.url} />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.fileName}</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">{formatBytes(file.fileSize)}</span>
                  {file.width && file.height && (
                    <span className="text-xs text-gray-400">{file.width}×{file.height}</span>
                  )}
                </div>
              </div>
              {/* Hover actions */}
              <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                <button
                  onClick={() => copyUrl(file.url)}
                  title="Copy URL"
                  className="rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-sm hover:bg-black/90"
                >
                  {copied === file.url ? (
                    <svg className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  ) : (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                  )}
                </button>
                <button
                  onClick={() => setConfirmDelete(file.id)}
                  title="Delete"
                  className="rounded-lg bg-black/70 p-1.5 text-white backdrop-blur-sm hover:bg-red-600"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                </button>
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
                <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-900" /></td></tr>
              )) : items.map((file) => (
                <tr key={file.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                        <FileIcon mimeType={file.mimeType} url={file.url} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{file.fileName}</p>
                        <p className="text-xs text-gray-400">{new Date(file.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell">
                    <span className="text-sm text-gray-500">{file.mimeType.split("/")[1]?.toUpperCase()}</span>
                  </td>
                  <td className="hidden px-5 py-3 md:table-cell">
                    <span className="text-sm text-gray-500">{formatBytes(file.fileSize)}</span>
                  </td>
                  <td className="hidden px-5 py-3 lg:table-cell">
                    <span className="text-sm text-gray-400">{file.width && file.height ? `${file.width}×${file.height}` : "—"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => copyUrl(file.url)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white" title="Copy URL">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                      </button>
                      <button onClick={() => setConfirmDelete(file.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Delete">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && items.length === 0 && (
            <div className="py-16 text-center text-sm text-gray-500">No media found.</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-800">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-800">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
