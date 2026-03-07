"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "platform" | "details" | "integration" | "branding";

const PLATFORM_OPTIONS = [
  { id: "NEXTJS", label: "Next.js", desc: "React framework with SSR/SSG", category: "Frameworks", color: "#fff" },
  { id: "REACT", label: "React", desc: "Client-side React application", category: "Frameworks", color: "#61DAFB" },
  { id: "VUE", label: "Vue.js", desc: "Progressive JavaScript framework", category: "Frameworks", color: "#4FC08D" },
  { id: "REMIX", label: "Remix", desc: "Full-stack web framework", category: "Frameworks", color: "#fff" },
  { id: "NUXT", label: "Nuxt", desc: "Vue.js meta-framework", category: "Frameworks", color: "#00DC82" },
  { id: "SVELTE", label: "Svelte", desc: "Cybernetically enhanced apps", category: "Frameworks", color: "#FF3E00" },
  { id: "ANGULAR", label: "Angular", desc: "Platform for web apps", category: "Frameworks", color: "#DD0031" },
  { id: "SHOPIFY", label: "Shopify", desc: "E-commerce platform", category: "Platforms", color: "#96BF48" },
  { id: "WORDPRESS", label: "WordPress", desc: "Content management system", category: "Platforms", color: "#21759B" },
  { id: "WIX", label: "Wix", desc: "Website builder platform", category: "Platforms", color: "#FAAD4D" },
  { id: "WEBFLOW", label: "Webflow", desc: "Visual web design tool", category: "Platforms", color: "#4353FF" },
  { id: "SQUARESPACE", label: "Squarespace", desc: "Website builder & hosting", category: "Platforms", color: "#fff" },
  { id: "GATSBY", label: "Gatsby", desc: "Static site generator", category: "Static Sites", color: "#663399" },
  { id: "ASTRO", label: "Astro", desc: "Content-focused framework", category: "Static Sites", color: "#FF5D01" },
  { id: "HUGO", label: "Hugo", desc: "Fast static site generator", category: "Static Sites", color: "#FF4088" },
  { id: "CUSTOM", label: "Custom / Other", desc: "Any website or app via API", category: "Other", color: "#9CA3AF" },
] as const;

const INTEGRATION_OPTIONS = [
  { id: "GITHUB", label: "GitHub", desc: "Deploy content via Git commits to your repository", icon: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" },
  { id: "GITLAB", label: "GitLab", desc: "Deploy content via GitLab repository", icon: null },
  { id: "SHOPIFY_API", label: "Shopify API", desc: "Publish directly to your Shopify blog", icon: null },
  { id: "WORDPRESS_API", label: "WordPress API", desc: "Publish via WordPress REST API", icon: null },
  { id: "WIX_API", label: "Wix API", desc: "Publish directly to your Wix site", icon: null },
  { id: "WEBFLOW_API", label: "Webflow API", desc: "Push to Webflow CMS collections", icon: null },
  { id: "REST_API", label: "REST API", desc: "Push content to any REST endpoint", icon: null },
  { id: "SDK", label: "RankFlo SDK", desc: "Fetch content client-side with our JavaScript SDK", icon: null },
] as const;

function SvgIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function StepIndicator({ steps, current }: { steps: { id: Step; label: string }[]; current: Step }) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
            i < currentIdx ? "bg-green-600 text-white dark:bg-accent dark:text-black" : i === currentIdx ? "bg-green-600 text-white dark:bg-accent dark:text-black" : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
          }`}>
            {i < currentIdx ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          <span className={`text-xs font-medium ${i <= currentIdx ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-600"}`}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px w-8 ${i < currentIdx ? "bg-accent" : "h-px bg-gray-200 dark:bg-gray-800"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("platform");
  const [platform, setPlatform] = useState<string>("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [integration, setIntegration] = useState<string>("");
  const [contentFormat, setContentFormat] = useState("MARKDOWN");

  // Branding
  const [primaryColor, setPrimaryColor] = useState("#39FF14");
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");

  const steps: { id: Step; label: string }[] = [
    { id: "platform", label: "Platform" },
    { id: "details", label: "Details" },
    { id: "integration", label: "Integration" },
    { id: "branding", label: "Branding" },
  ];

  const categories = [...new Set(PLATFORM_OPTIONS.map((p) => p.category))];

  const handleCreate = () => {
    // TODO: Wire to tRPC mutation
    router.push("/projects");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/projects"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 text-gray-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-white"
        >
          <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Connect a Project</h1>
          <p className="mt-0.5 text-sm text-gray-500">Link your website, app, or store to start creating content</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={steps} current={step} />

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        {/* ─── STEP 1: PLATFORM ─── */}
        {step === "platform" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What type of project?</h2>
              <p className="mt-1 text-sm text-gray-500">Select the platform or framework your project uses</p>
            </div>

            {categories.map((cat) => (
              <div key={cat}>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-600">{cat}</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {PLATFORM_OPTIONS.filter((p) => p.category === cat).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={`flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                        platform === p.id
                          ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                      }`}
                    >
                      <span
                        className="text-sm font-semibold"
                        style={{ color: platform === p.id ? p.color : undefined }}
                      >
                        {platform === p.id ? (
                          <span style={{ color: p.color }}>{p.label}</span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">{p.label}</span>
                        )}
                      </span>
                      <span className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={() => platform && setStep("details")}
                disabled={!platform}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 dark:bg-accent px-5 text-sm font-semibold text-white dark:text-black transition-colors hover:bg-green-700 dark:hover:bg-accent-9 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <SvgIcon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: DETAILS ─── */}
        {step === "details" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project details</h2>
              <p className="mt-1 text-sm text-gray-500">Tell us about your project</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Project name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome Blog"
                  className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-600 transition-colors focus:border-green-500 dark:focus:border-accent focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://mysite.com"
                  className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white placeholder-gray-600 transition-colors focus:border-green-500 dark:focus:border-accent focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of your project..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-600 transition-colors focus:border-green-500 dark:focus:border-accent focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Content format</label>
                <div className="flex gap-2">
                  {["MARKDOWN", "MDX", "HTML", "JSON"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setContentFormat(fmt)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        contentFormat === fmt
                          ? "bg-accent/10 text-green-600 dark:text-accent border border-accent/30"
                          : "border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("platform")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-4 text-sm text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-white"
              >
                <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                Back
              </button>
              <button
                onClick={() => name && setStep("integration")}
                disabled={!name}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 dark:bg-accent px-5 text-sm font-semibold text-white dark:text-black transition-colors hover:bg-green-700 dark:hover:bg-accent-9 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <SvgIcon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: INTEGRATION ─── */}
        {step === "integration" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How should we connect?</h2>
              <p className="mt-1 text-sm text-gray-500">Choose how RankFlo delivers content to your project</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {INTEGRATION_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setIntegration(opt.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    integration === opt.id
                      ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                      : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    integration === opt.id ? "bg-accent/20" : "bg-gray-100 dark:bg-gray-800"
                  }`}>
                    {opt.icon ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d={opt.icon} />
                      </svg>
                    ) : (
                      <SvgIcon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    )}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${integration === opt.id ? "text-green-600 dark:text-accent" : "text-gray-900 dark:text-white"}`}>
                      {opt.label}
                    </span>
                    <p className="mt-0.5 text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 p-4">
              <div className="flex items-start gap-3">
                <SvgIcon path="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" className="h-5 w-5 text-green-600 dark:text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Not sure which to pick?</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Start with <strong className="text-gray-700 dark:text-gray-300">RankFlo SDK</strong> for the easiest setup — just add a script tag.
                    Use <strong className="text-gray-700 dark:text-gray-300">GitHub</strong> for full control with Git-based content deployment.
                    Platform APIs (Shopify, WordPress, etc.) publish directly to those platforms.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("details")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-4 text-sm text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-white"
              >
                <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                Back
              </button>
              <button
                onClick={() => integration && setStep("branding")}
                disabled={!integration}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 dark:bg-accent px-5 text-sm font-semibold text-white dark:text-black transition-colors hover:bg-green-700 dark:hover:bg-accent-9 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
                <SvgIcon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: BRANDING ─── */}
        {step === "branding" && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brand & Design</h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure your brand colors so generated content matches your project. You can update these later.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Primary color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white font-mono focus:border-green-500 dark:focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Background color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-10 w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white font-mono focus:border-green-500 dark:focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Text color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-10 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-32 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-900 dark:text-white font-mono focus:border-green-500 dark:focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <SvgIcon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" className="h-4 w-4 text-green-600 dark:text-accent" />
                    <span>AI can auto-detect branding from your URL</span>
                  </div>
                  <button
                    disabled={!url}
                    className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Extract from website
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2">
                  <span className="text-xs text-gray-500">Preview</span>
                </div>
                <div className="p-6" style={{ backgroundColor: bgColor }}>
                  <div className="space-y-4">
                    <div className="h-3 w-24 rounded" style={{ backgroundColor: primaryColor }} />
                    <div className="h-6 w-3/4 rounded" style={{ backgroundColor: textColor, opacity: 0.9 }} />
                    <div className="space-y-2">
                      <div className="h-2.5 w-full rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
                      <div className="h-2.5 w-5/6 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
                      <div className="h-2.5 w-4/6 rounded" style={{ backgroundColor: textColor, opacity: 0.3 }} />
                    </div>
                    <div className="inline-flex h-8 items-center rounded-lg px-4 text-xs font-semibold" style={{ backgroundColor: primaryColor, color: bgColor }}>
                      Read more
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("integration")}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-4 text-sm text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-700 dark:hover:text-white"
              >
                <SvgIcon path="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                Back
              </button>
              <button
                onClick={handleCreate}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-green-600 dark:bg-accent px-5 text-sm font-semibold text-white dark:text-black transition-colors hover:bg-green-700 dark:hover:bg-accent-9"
              >
                <SvgIcon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.193-9.193a4.5 4.5 0 00-6.364 0l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                Connect Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
