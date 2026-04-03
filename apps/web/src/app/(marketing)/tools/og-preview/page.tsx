"use client";

import { useState } from "react";
import Link from "next/link";

export default function OgPreviewPage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Open Graph Preview Tool</h1>
      <p className="mt-2 text-gray-400">See how your page will look when shared on Facebook, Twitter/X, LinkedIn, and Slack. Enter your OG tags below.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div>
            <label className="text-xs font-medium text-gray-400">og:title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your page title"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">og:description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="A compelling description" rows={3}
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">og:image URL</label>
            <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://yoursite.com/og-image.jpg"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400">Page URL</label>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yoursite.com/blog/my-post"
              className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
          </div>
        </div>

        {/* Previews */}
        <div className="space-y-6">
          {/* Facebook style */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-600">Facebook / LinkedIn</p>
            <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-900">
              {image && <div className="h-48 bg-gray-800 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />}
              {!image && <div className="flex h-48 items-center justify-center bg-gray-800 text-gray-600 text-sm">No image set</div>}
              <div className="p-3">
                <p className="text-[10px] uppercase text-gray-500">{url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "yoursite.com"}</p>
                <p className="mt-1 text-sm font-semibold text-white line-clamp-2">{title || "Your page title"}</p>
                <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{desc || "Your page description will appear here"}</p>
              </div>
            </div>
          </div>

          {/* Twitter card style */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-600">Twitter / X</p>
            <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-900">
              {image && <div className="h-44 bg-gray-800 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />}
              {!image && <div className="flex h-44 items-center justify-center bg-gray-800 text-gray-600 text-sm">No image</div>}
              <div className="p-3">
                <p className="text-sm font-semibold text-white line-clamp-1">{title || "Your page title"}</p>
                <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">{desc || "Description"}</p>
                <p className="mt-1 text-[10px] text-gray-500">{url ? new URL(url.startsWith("http") ? url : `https://${url}`).hostname : "yoursite.com"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo generates OG tags automatically</h2>
        <p className="mt-2 text-sm text-gray-400">Every published post gets og:title, og:description, and og:image without manual setup.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}
