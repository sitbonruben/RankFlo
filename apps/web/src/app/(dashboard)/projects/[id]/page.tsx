"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

type Tab = "content" | "deployments" | "autopilot" | "branding" | "settings";

const PLATFORMS: Record<string, string> = {
  NEXTJS: "Next.js", REACT: "React", VUE: "Vue.js", ANGULAR: "Angular",
  SVELTE: "Svelte", SHOPIFY: "Shopify", WIX: "Wix", WORDPRESS: "WordPress",
  SQUARESPACE: "Squarespace", WEBFLOW: "Webflow", HUGO: "Hugo",
  GATSBY: "Gatsby", ASTRO: "Astro", REMIX: "Remix", NUXT: "Nuxt", CUSTOM: "Custom",
};

const CONTENT_TYPES = [
  { value: "blog-post", label: "Blog Post" },
  { value: "tutorial", label: "Tutorial" },
  { value: "how-to", label: "How-To Guide" },
  { value: "listicle", label: "Listicle" },
  { value: "comparison", label: "Comparison" },
  { value: "landing-page", label: "Landing Page" },
];

function SvgIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-500 dark:bg-accent", SETUP: "bg-amber-400",
    PAUSED: "bg-gray-400", PUBLISHED: "bg-green-500 dark:bg-accent",
    DRAFT: "bg-gray-400", SCHEDULED: "bg-blue-400",
    SUCCESS: "bg-green-500 dark:bg-accent", FAILED: "bg-red-400",
    PENDING: "bg-amber-400", DEPLOYING: "bg-blue-400",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[status] ?? "bg-gray-400"}`} />;
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return d.toLocaleDateString();
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.rankflo.io";

type SnippetTab = "list" | "single" | "env";

function ApiKeySection({
  project,
  showApiKey,
  setShowApiKey,
  copied,
  copyApiKey,
}: {
  project: { apiKey?: string | null };
  showApiKey: boolean;
  setShowApiKey: (v: boolean) => void;
  copied: boolean;
  copyApiKey: () => void;
}) {
  const [snippetTab, setSnippetTab] = useState<SnippetTab>("list");
  const apiKey = project.apiKey ?? "rf_YOUR_KEY";
  const maskedKey = "rf_" + "•".repeat(40);
  const displayKey = showApiKey ? apiKey : maskedKey;

  const snippets: Record<SnippetTab, { label: string; code: string }> = {
    list: {
      label: "Blog index",
      code: `// app/blog/page.tsx — lists all posts (server component, SEO-friendly)
export default async function BlogPage() {
  const res = await fetch('${APP_URL}/api/v1/content', {
    headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY },
    next: { revalidate: 60 }, // ISR: revalidate every 60s
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
    },
    single: {
      label: "Single post",
      code: `// app/blog/[slug]/page.tsx — single post with SEO meta tags
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const res = await fetch(\`${APP_URL}/api/v1/content?slug=\${params.slug}\`, {
    headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY },
  })
  const { data: post } = await res.json()
  return {
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    openGraph: { images: [post.seo?.ogImage || post.featuredImage] },
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const res = await fetch(\`${APP_URL}/api/v1/content?slug=\${params.slug}&format=html\`, {
    headers: { Authorization: 'Bearer ' + process.env.RANKFLO_API_KEY },
    next: { revalidate: 60 },
  })
  const { data: post } = await res.json()

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}`,
    },
    env: {
      label: ".env setup",
      code: `# .env.local — add your RankFlo API key
RANKFLO_API_KEY=${showApiKey ? apiKey : "rf_paste_your_key_here"}

# Then access it in server components:
# process.env.RANKFLO_API_KEY`,
    },
  };

  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[snippetTab].code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Headless CMS API Key</h3>
      <p className="mb-4 text-xs text-gray-500">
        Add this to your Next.js project to automatically display all published content
      </p>

      {/* API key row */}
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-mono text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {displayKey}
        </code>
        <button
          onClick={() => setShowApiKey(!showApiKey)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          title={showApiKey ? "Hide" : "Show"}
        >
          <SvgIcon path={showApiKey
            ? "M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
            : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          } />
        </button>
        <button
          onClick={copyApiKey}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Snippet tabs */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-1">
            {(Object.keys(snippets) as SnippetTab[]).map((k) => (
              <button
                key={k}
                onClick={() => setSnippetTab(k)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  snippetTab === k
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {snippets[k].label}
              </button>
            ))}
          </div>
          <button
            onClick={copySnippet}
            className="flex h-7 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 text-xs text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            {copiedSnippet ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs font-mono leading-relaxed text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {snippets[snippetTab].code}
        </pre>
        <p className="mt-2 text-xs text-gray-400">
          Content is server-rendered — Google indexes it the same as static HTML. Revalidates every 60 seconds via Next.js ISR.
        </p>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-green-500 dark:bg-accent" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tab, setTab] = useState<Tab>("content");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  // Autopilot form state
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [autopilotFrequency, setAutopilotFrequency] = useState(2);
  const [autopilotContentType, setAutopilotContentType] = useState("blog-post");
  const [autopilotAutoPublish, setAutopilotAutoPublish] = useState(false);

  // AI context form state
  const [aiDescription, setAiDescription] = useState("");
  const [aiContentScope, setAiContentScope] = useState("");
  const [aiContextSaved, setAiContextSaved] = useState(false);

  const { data: project, isLoading, refetch } = trpc.project.getById.useQuery({ id });

  const updateProject = trpc.project.update.useMutation({
    onSuccess: () => {
      refetch();
      setAiContextSaved(true);
      setTimeout(() => setAiContextSaved(false), 2000);
    },
  });

  const updateAutopilot = trpc.project.updateAutopilot.useMutation({
    onSuccess: () => refetch(),
  });

  // Sync form state from loaded project
  useEffect(() => {
    if (project) {
      setAutopilotEnabled(project.autopilotEnabled ?? false);
      setAutopilotFrequency(project.autopilotFrequency ?? 2);
      setAutopilotContentType(project.autopilotContentType ?? "blog-post");
      setAutopilotAutoPublish(project.autopilotAutoPublish ?? false);
      setAiDescription(project.description ?? "");
      const bs = project.brandStyle as Record<string, unknown> | null;
      setAiContentScope(typeof bs?.contentScope === "string" ? bs.contentScope : "");
    }
  }, [project]);

  const handleSaveAiContext = () => {
    const existingBrandStyle = (project?.brandStyle ?? {}) as Record<string, unknown>;
    updateProject.mutate({
      id,
      description: aiDescription || undefined,
      brandStyle: { ...existingBrandStyle, contentScope: aiContentScope },
    });
  };

  const handleSaveAutopilot = () => {
    updateAutopilot.mutate({
      id,
      autopilotEnabled,
      autopilotFrequency,
      autopilotContentType: autopilotContentType as "blog-post" | "tutorial" | "how-to" | "listicle" | "comparison" | "landing-page",
      autopilotAutoPublish,
    });
  };

  const router = useRouter();
  const [aiCreating, setAiCreating] = useState(false);
  const createPostWithAI = trpc.ai.createPost.useMutation();

  const handleCreateWithAI = useCallback(async () => {
    setAiCreating(true);
    try {
      const result = await createPostWithAI.mutateAsync({ projectId: id });
      router.push(`/posts/${result.slug}/edit`);
    } catch (err) {
      console.error("AI create post failed:", err);
      setAiCreating(false);
    }
  }, [id, createPostWithAI, router]);

  const copyApiKey = () => {
    if (project?.apiKey) {
      navigator.clipboard.writeText(project.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project not found</h2>
        <Link href="/projects" className="mt-4 text-sm text-green-600 hover:underline dark:text-accent">
          Back to projects
        </Link>
      </div>
    );
  }

  const platformLabel = PLATFORMS[project.platform] ?? "Custom";
  const posts = project.posts ?? [];
  const deployments = project.deployments ?? [];
  const brandColors = (project.brandColors ?? {}) as Record<string, string>;
  const brandFonts = (project.brandFonts ?? {}) as Record<string, { family: string; weight: string }>;
  const integrationConfig = (project.integrationConfig ?? {}) as Record<string, string>;

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "content", label: "Content", count: project._count?.posts },
    { id: "deployments", label: "Deployments", count: project._count?.deployments },
    { id: "autopilot", label: "Autopilot" },
    { id: "branding", label: "Branding" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/projects"
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-gray-800 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 overflow-hidden text-lg font-bold text-gray-700 dark:bg-gray-800 dark:text-white">
              {project.brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.brandLogo} alt={project.name} className="h-10 w-10 object-cover" />
              ) : (
                project.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{project.name}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                  project.status === "ACTIVE"
                    ? "bg-green-50 text-green-700 border border-green-200 dark:bg-accent-1 dark:text-accent dark:border-accent/20"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  <StatusDot status={project.status} />
                  {project.status}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium text-gray-700 dark:text-gray-300">{platformLabel}</span>
                {project.url && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700">·</span>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-green-600 dark:hover:text-accent">
                      {project.url.replace("https://", "")}
                    </a>
                  </>
                )}
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => void handleCreateWithAI()}
          disabled={aiCreating}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-4 text-sm font-semibold text-green-600 transition-colors hover:bg-green-500/10 disabled:opacity-60 dark:border-accent/30 dark:bg-accent/5 dark:text-accent dark:hover:bg-accent/10"
          title="Research a unique topic and generate a full blog post with AI"
        >
          {aiCreating ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500 dark:border-accent/30 dark:border-t-accent" />
              Generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5l1.4 2.8L12 5l-2.5 2.1.6 3.4L7 9.1 4 10.5l.6-3.4L2 5l3.6-.7L7 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
              </svg>
              Write with AI
            </>
          )}
        </button>
        <Link
          href="/posts/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
        >
          <SvgIcon path="M12 4.5v15m7.5-7.5h-15" />
          New post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Posts",
            value: (project._count?.posts ?? 0).toString(),
            icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
          },
          {
            label: "Total views",
            value: formatViews(project.totalViews ?? 0),
            icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z",
          },
          {
            label: "Last deployed",
            value: project.lastDeployedAt ? timeAgo(project.lastDeployedAt) : "Never",
            icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
          },
          {
            label: "Autopilot",
            value: project.autopilotEnabled ? `${project.autopilotFrequency ?? 2}/wk` : "Off",
            icon: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-2">
              <SvgIcon path={stat.icon} className="h-4 w-4 text-gray-400 dark:text-gray-600" />
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800">{t.count}</span>
            )}
            {t.id === "autopilot" && project.autopilotEnabled && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-accent" />
            )}
            {tab === t.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-500 dark:bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {tab === "content" && (
        <div className="flex flex-col gap-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900">
                <SvgIcon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No posts yet</h3>
              <p className="mt-1 text-xs text-gray-500">Create a post or enable Autopilot to generate content automatically</p>
              <div className="mt-4 flex gap-2">
                <Link href="/posts/new" className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-accent dark:text-black">
                  Create post
                </Link>
                <button onClick={() => setTab("autopilot")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900">
                  Enable Autopilot
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="hidden px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">Published</th>
                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                  {posts.map((post) => (
                    <tr key={post.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-5 py-4">
                        <Link href={`/posts/${post.slug}/edit`} className="text-sm font-medium text-gray-900 transition-colors hover:text-green-600 dark:text-white dark:hover:text-accent">
                          {post.title}
                        </Link>
                        <p className="text-xs text-gray-400 dark:text-gray-600">/{post.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                          post.status === "PUBLISHED"
                            ? "border border-green-200 bg-green-50 text-green-700 dark:border-accent/20 dark:bg-accent-1 dark:text-accent"
                            : post.status === "SCHEDULED"
                            ? "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          <StatusDot status={post.status} />
                          {post.status}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 lg:table-cell">
                        <span className="text-sm text-gray-400 dark:text-gray-600">
                          {post.publishedAt ? timeAgo(post.publishedAt) : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/posts/${post.slug}/edit`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                          title="Edit"
                        >
                          <SvgIcon path="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(project._count?.posts ?? 0) > 10 && (
                <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800/50">
                  <Link href="/posts" className="text-xs text-gray-500 hover:text-green-600 dark:hover:text-accent">
                    View all {project._count?.posts} posts →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deployments Tab */}
      {tab === "deployments" && (
        <div className="flex flex-col gap-4">
          {deployments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 dark:border-gray-800">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">No deployments yet</h3>
              <p className="mt-1 text-xs text-gray-500">Deployments will appear here once you publish content to this project</p>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
              <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                {deployments.map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        dep.status === "SUCCESS" ? "bg-green-50 dark:bg-accent/10" : dep.status === "FAILED" ? "bg-red-50 dark:bg-red-500/10" : "bg-amber-50 dark:bg-amber-500/10"
                      }`}>
                        {dep.status === "SUCCESS" ? (
                          <SvgIcon path="M4.5 12.75l6 6 9-13.5" className="h-4 w-4 text-green-600 dark:text-accent" />
                        ) : dep.status === "FAILED" ? (
                          <SvgIcon path="M6 18L18 6M6 6l12 12" className="h-4 w-4 text-red-500" />
                        ) : (
                          <SvgIcon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {dep.post?.title ?? "Unknown post"}
                        </p>
                        <span className="text-xs text-gray-400 dark:text-gray-600">
                          {dep.deployedAt ? timeAgo(dep.deployedAt) : timeAgo(dep.createdAt)}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${
                      dep.status === "SUCCESS"
                        ? "border border-green-200 bg-green-50 text-green-700 dark:border-accent/20 dark:bg-accent-1 dark:text-accent"
                        : dep.status === "FAILED"
                        ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
                        : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      <StatusDot status={dep.status} />
                      {dep.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Autopilot Tab */}
      {tab === "autopilot" && (
        <div className="flex flex-col gap-6 max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Autopilot</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Automatically generate and publish SEO-optimized content on a schedule. Each post costs 3 AI credits.
                </p>
              </div>
              <Toggle checked={autopilotEnabled} onChange={setAutopilotEnabled} />
            </div>

            <div className={`flex flex-col gap-5 transition-opacity ${autopilotEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              {/* Frequency */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Posts per week
                  <span className="ml-2 text-green-600 dark:text-accent font-semibold">{autopilotFrequency}</span>
                </label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Runs every {(7 / autopilotFrequency).toFixed(1)} day{autopilotFrequency === 1 ? "" : "s"}
                </p>
                <input
                  type="range"
                  min={1}
                  max={7}
                  step={1}
                  value={autopilotFrequency}
                  onChange={(e) => setAutopilotFrequency(Number(e.target.value))}
                  className="mt-2 w-full accent-green-500"
                />
                <div className="mt-1 flex justify-between text-xs text-gray-400">
                  <span>1/wk</span>
                  <span>7/wk</span>
                </div>
              </div>

              {/* Content type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Content type</label>
                <select
                  value={autopilotContentType}
                  onChange={(e) => setAutopilotContentType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white"
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>

              {/* Auto-publish */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-publish</p>
                  <p className="text-xs text-gray-500">Publish immediately instead of saving as draft</p>
                </div>
                <Toggle checked={autopilotAutoPublish} onChange={setAutopilotAutoPublish} />
              </div>
            </div>
          </div>

          {/* Status */}
          {(project.autopilotLastRunAt || project.autopilotNextRunAt) && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Schedule</h3>
              <div className="flex flex-col gap-2">
                {project.autopilotLastRunAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Last run</span>
                    <span className="text-sm text-gray-900 dark:text-white">{timeAgo(project.autopilotLastRunAt)}</span>
                  </div>
                )}
                {project.autopilotNextRunAt && project.autopilotEnabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Next run</span>
                    <span className="text-sm text-gray-900 dark:text-white">{timeAgo(project.autopilotNextRunAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSaveAutopilot}
              disabled={updateAutopilot.isPending}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
            >
              {updateAutopilot.isPending ? "Saving…" : "Save autopilot settings"}
            </button>
          </div>
        </div>
      )}

      {/* Branding Tab */}
      {tab === "branding" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {Object.keys(brandColors).length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Brand Colors</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(brandColors).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-gray-500 dark:text-gray-400">{key}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded border border-gray-200 dark:border-gray-700" style={{ backgroundColor: value }} />
                      <code className="text-xs text-gray-400 font-mono dark:text-gray-500">{value}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 dark:border-gray-800">
              <p className="text-sm text-gray-500">No brand colors configured</p>
            </div>
          )}

          {Object.keys(brandFonts).length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Typography</h3>
              <div className="flex flex-col gap-3">
                {Object.entries(brandFonts).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-gray-500 dark:text-gray-400">{key}</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {value?.family} ({value?.weight})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 p-5 dark:border-gray-800">
              <p className="text-sm text-gray-500">No typography configured</p>
            </div>
          )}

          {Object.keys(brandColors).length > 0 && (
            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white overflow-hidden dark:border-gray-800 dark:bg-gray-950">
              <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-800">
                <span className="text-xs text-gray-500">Live preview</span>
              </div>
              <div className="p-8" style={{ backgroundColor: brandColors.background || "#ffffff" }}>
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="h-2 w-16 rounded" style={{ backgroundColor: brandColors.primary || "#39FF14", opacity: 0.8 }} />
                  <div className="h-6 w-3/4 rounded" style={{ backgroundColor: brandColors.text || "#000000", opacity: 0.9 }} />
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded" style={{ height: "10px", width: `${100 - i * 10}%`, backgroundColor: brandColors.text || "#000000", opacity: 0.2 }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === "settings" && (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* AI Context */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">AI Context</h3>
            <p className="mb-4 text-xs text-gray-500">
              Help the AI understand your project. This context is used when generating posts, suggesting topics, and answering questions in the editor.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Project description
                </label>
                <textarea
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. RankFlo is a headless CMS for developers who want SEO-optimized blog content."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Content scope <span className="ml-1 text-gray-400">(what topics should AI focus on?)</span>
                </label>
                <textarea
                  value={aiContentScope}
                  onChange={(e) => setAiContentScope(e.target.value)}
                  rows={3}
                  placeholder="e.g. Focus on SEO tips, headless CMS tutorials, Next.js blog integrations, and content marketing for SaaS companies. Avoid social media and paid ads topics."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
                />
              </div>
              <div className="flex items-center justify-between">
                {aiContextSaved && (
                  <span className="text-xs text-green-600 dark:text-accent">Saved!</span>
                )}
                <div className="ml-auto">
                  <button
                    onClick={handleSaveAiContext}
                    disabled={updateProject.isPending}
                    className="inline-flex h-8 items-center gap-2 rounded-lg bg-green-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-accent dark:text-black dark:hover:bg-accent-9"
                  >
                    {updateProject.isPending ? "Saving…" : "Save AI context"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Integration */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Integration</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                <span className="text-sm text-gray-900 dark:text-white">{project.integrationType ?? "None"}</span>
              </div>
              {integrationConfig.repoOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Repository</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {integrationConfig.repoOwner}/{integrationConfig.repoName}
                  </span>
                </div>
              )}
              {integrationConfig.branch && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Branch</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{integrationConfig.branch}</span>
                </div>
              )}
              {project.contentFormat && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Content format</span>
                  <span className="text-sm text-gray-900 dark:text-white">{project.contentFormat}</span>
                </div>
              )}
              {project.contentDir && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Content directory</span>
                  <span className="font-mono text-sm text-gray-900 dark:text-white">{project.contentDir}</span>
                </div>
              )}
            </div>
          </div>

          {/* API Key + Integration Guide */}
          <ApiKeySection project={project} showApiKey={showApiKey} setShowApiKey={setShowApiKey} copied={copied} copyApiKey={copyApiKey} />

          {/* Danger zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/30 dark:bg-red-950/10">
            <h3 className="mb-2 text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h3>
            <p className="mb-4 text-xs text-gray-500">These actions are irreversible. Posts will be unlinked but not deleted.</p>
            <div className="flex gap-3">
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-500 transition-colors hover:border-amber-300 hover:text-amber-600 dark:border-gray-800 dark:text-gray-400">
                Pause project
              </button>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:text-red-400">
                Delete project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
