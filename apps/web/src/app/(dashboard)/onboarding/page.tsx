"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

const PLATFORMS = [
  { value: "NEXTJS", label: "Next.js", hint: "vercel.app, .io, next" },
  { value: "REACT", label: "React", hint: "react, cra, vite" },
  { value: "ASTRO", label: "Astro", hint: "astro.build" },
  { value: "REMIX", label: "Remix", hint: "remix.run" },
  { value: "NUXT", label: "Nuxt", hint: "nuxt" },
  { value: "GATSBY", label: "Gatsby", hint: "gatsby" },
  { value: "SHOPIFY", label: "Shopify", hint: "myshopify.com" },
  { value: "WORDPRESS", label: "WordPress", hint: "wordpress.com" },
  { value: "CUSTOM", label: "Other", hint: "" },
];

const CONTENT_TYPES = [
  { value: "blog-post", label: "Blog Post", desc: "General articles and news" },
  { value: "tutorial", label: "Tutorial", desc: "Step-by-step guides" },
  { value: "how-to", label: "How-To Guide", desc: "Practical instructions" },
  { value: "listicle", label: "Listicle", desc: "Top 10 style content" },
  { value: "comparison", label: "Comparison", desc: "vs. articles" },
];

function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("vercel.app") || u.includes("next")) return "NEXTJS";
  if (u.includes("astro")) return "ASTRO";
  if (u.includes("remix")) return "REMIX";
  if (u.includes("myshopify") || u.includes("shopify")) return "SHOPIFY";
  if (u.includes("wordpress") || u.includes("wp.")) return "WORDPRESS";
  if (u.includes("gatsby")) return "GATSBY";
  if (u.includes("nuxt")) return "NUXT";
  return "NEXTJS"; // default for most SaaS
}

function SvgIcon({ path, className = "h-5 w-5" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.rankflo.io";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Project
  const [projectName, setProjectName] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [platform, setPlatform] = useState("NEXTJS");
  const [urlTouched, setUrlTouched] = useState(false);

  // Step 2: Autopilot
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [contentType, setContentType] = useState("blog-post");
  const [autoPublish, setAutoPublish] = useState(false);

  // Step 3: Integration
  const [createdProject, setCreatedProject] = useState<{ id: string; apiKey: string | null } | null>(null);
  const [snippetTab, setSnippetTab] = useState<"list" | "single" | "env">("list");
  const [copied, setCopied] = useState(false);

  const createProject = trpc.project.create.useMutation();
  const updateAutopilot = trpc.project.updateAutopilot.useMutation();

  const handleUrlChange = (val: string) => {
    setProjectUrl(val);
    if (!urlTouched && val) {
      setPlatform(detectPlatform(val));
      // Auto-fill name from domain
      try {
        const domain = new URL(val.startsWith("http") ? val : `https://${val}`).hostname
          .replace("www.", "")
          .split(".")[0];
        if (domain && !projectName) {
          setProjectName(domain.charAt(0).toUpperCase() + domain.slice(1));
        }
      } catch {}
    }
  };

  const handleStep1 = async () => {
    if (!projectName.trim() || !projectUrl.trim()) return;
    const url = projectUrl.startsWith("http") ? projectUrl : `https://${projectUrl}`;
    const project = await createProject.mutateAsync({
      name: projectName.trim(),
      url,
      platform: platform as any,
      description: `${projectName} — ${PLATFORMS.find(p => p.value === platform)?.label ?? "Web"} project`,
    });
    setCreatedProject(project);
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!createdProject) return;
    if (autopilotEnabled) {
      await updateAutopilot.mutateAsync({
        id: createdProject.id,
        autopilotEnabled: true,
        autopilotFrequency: postsPerWeek,
        autopilotContentType: contentType as any,
        autopilotAutoPublish: autoPublish,
      });
    }
    setStep(3);
  };

  const handleFinish = () => {
    router.push(createdProject ? `/projects/${createdProject.id}` : "/overview");
  };

  const apiKey = createdProject?.apiKey ?? "rf_YOUR_KEY";

  const snippets = {
    list: `// app/blog/page.tsx
export default async function BlogPage() {
  const res = await fetch('${APP_URL}/api/v1/content', {
    headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY },
    next: { revalidate: 60 },
  })
  const { data: posts } = await res.json()
  return (
    <main>
      {posts.map((post: any) => (
        <article key={post.slug}>
          <h2><a href={\`/blog/\${post.slug}\`}>{post.title}</a></h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  )
}`,
    single: `// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: any) {
  const res = await fetch(
    \`${APP_URL}/api/v1/content?slug=\${params.slug}\`,
    { headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY } }
  )
  const { data: post } = await res.json()
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
  }
}

export default async function BlogPost({ params }: any) {
  const res = await fetch(
    \`${APP_URL}/api/v1/content?slug=\${params.slug}&format=html\`,
    { headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY },
      next: { revalidate: 60 } }
  )
  const { data: post } = await res.json()
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}`,
    env: `# .env.local
RANKFLO_API_KEY=${apiKey}`,
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[snippetTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12">
      {/* Progress */}
      <div className="mb-10 flex items-center gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
              s < step ? "bg-green-500 text-white dark:bg-accent dark:text-black"
              : s === step ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
            }`}>
              {s < step ? <SvgIcon path="M4.5 12.75l6 6 9-13.5" className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-px w-12 transition-colors ${s < step ? "bg-green-500 dark:bg-accent" : "bg-gray-200 dark:bg-gray-800"}`} />}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        {/* ── STEP 1: Connect Project ── */}
        {step === 1 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-accent/10">
                <SvgIcon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" className="h-6 w-6 text-green-600 dark:text-accent" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Connect your project</h1>
              <p className="mt-1 text-sm text-gray-500">RankFlo will generate SEO content and publish it to your site automatically</p>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Project URL</label>
                <input
                  type="url"
                  placeholder="https://yoursite.com"
                  value={projectUrl}
                  onChange={e => handleUrlChange(e.target.value)}
                  onBlur={() => setUrlTouched(true)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Project name</label>
                <input
                  type="text"
                  placeholder="My SaaS"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPlatform(p.value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        platform === p.value
                          ? "border-green-500 bg-green-50 text-green-700 dark:border-accent dark:bg-accent/10 dark:text-accent"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStep1}
                disabled={!projectName.trim() || !projectUrl.trim() || createProject.isPending}
                className="mt-2 w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
              >
                {createProject.isPending ? "Connecting…" : "Connect project →"}
              </button>
              {createProject.error && (
                <p className="text-center text-xs text-red-500">{createProject.error.message}</p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Autopilot ── */}
        {step === 2 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-accent/10">
                <SvgIcon path="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" className="h-6 w-6 text-green-600 dark:text-accent" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Set up Autopilot</h1>
              <p className="mt-1 text-sm text-gray-500">RankFlo AI will generate and publish SEO posts on a schedule. 3 credits per post.</p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Enable toggle */}
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Enable Autopilot</p>
                  <p className="text-xs text-gray-500">Starts generating content immediately</p>
                </div>
                <button
                  onClick={() => setAutopilotEnabled(!autopilotEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autopilotEnabled ? "bg-green-500 dark:bg-accent" : "bg-gray-300 dark:bg-gray-700"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autopilotEnabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <div className={`flex flex-col gap-4 transition-opacity ${autopilotEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                {/* Frequency */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Posts per week</label>
                    <span className="text-sm font-bold text-green-600 dark:text-accent">{postsPerWeek}/wk</span>
                  </div>
                  <input
                    type="range" min={1} max={7} step={1}
                    value={postsPerWeek}
                    onChange={e => setPostsPerWeek(Number(e.target.value))}
                    className="w-full accent-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">≈ {(postsPerWeek * 4).toFixed(0)} posts/month · {postsPerWeek * 4 * 3} credits/month</p>
                </div>

                {/* Content type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Content type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {CONTENT_TYPES.map(ct => (
                      <button
                        key={ct.value}
                        onClick={() => setContentType(ct.value)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                          contentType === ct.value
                            ? "border-green-500 bg-green-50 dark:border-accent dark:bg-accent/10"
                            : "border-gray-200 dark:border-gray-800"
                        }`}
                      >
                        <span className={`font-medium ${contentType === ct.value ? "text-green-700 dark:text-accent" : "text-gray-700 dark:text-gray-300"}`}>{ct.label}</span>
                        <span className="text-xs text-gray-400">{ct.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-publish */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-publish</p>
                    <p className="text-xs text-gray-500">Publish instantly instead of draft</p>
                  </div>
                  <button
                    onClick={() => setAutoPublish(!autoPublish)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoPublish ? "bg-green-500 dark:bg-accent" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${autoPublish ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleStep2}
                disabled={updateAutopilot.isPending}
                className="mt-2 w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black"
              >
                {updateAutopilot.isPending ? "Saving…" : (autopilotEnabled ? "Start Autopilot →" : "Skip for now →")}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Integration ── */}
        {step === 3 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-accent/10">
                <SvgIcon path="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" className="h-6 w-6 text-green-600 dark:text-accent" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add to your codebase</h1>
              <p className="mt-1 text-sm text-gray-500">Copy these 2 files into your Next.js project and content will appear automatically</p>
            </div>

            {/* API Key */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-accent/20 dark:bg-accent/5">
              <SvgIcon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="h-4 w-4 shrink-0 text-green-600 dark:text-accent" />
              <code className="flex-1 text-xs font-mono text-green-700 dark:text-accent truncate">{apiKey}</code>
              <button
                onClick={() => { navigator.clipboard.writeText(apiKey); }}
                className="text-xs text-green-600 hover:text-green-800 dark:text-accent"
              >
                Copy key
              </button>
            </div>

            {/* Snippet tabs */}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-1">
                {(["list", "single", "env"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setSnippetTab(t)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      snippetTab === t
                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                  >
                    {t === "list" ? "Blog index" : t === "single" ? "Single post" : ".env"}
                  </button>
                ))}
              </div>
              <button
                onClick={copySnippet}
                className="flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="mb-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs font-mono leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              {snippets[snippetTab]}
            </pre>

            {/* llms.txt tip */}
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/20 dark:bg-blue-500/5">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Bonus: AI discoverability</p>
              <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-500">
                Add <code className="font-mono">/llms.txt</code> to your site so ChatGPT, Perplexity and Claude can find your content.
                {" "}<a href={`${APP_URL}/api/v1/llms.txt?project_key=${apiKey}`} target="_blank" className="underline">Preview your llms.txt →</a>
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black"
            >
              Go to my project →
            </button>
          </div>
        )}

        {step < 3 && (
          <button onClick={handleFinish} className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            Skip setup, I'll do this later
          </button>
        )}
      </div>
    </div>
  );
}
