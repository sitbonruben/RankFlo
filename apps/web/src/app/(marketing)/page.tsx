import Link from "next/link";
import { SiteCheckForm } from "@/components/marketing/site-check-form";

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "RankFlo",
            applicationCategory: "WebApplication",
            operatingSystem: "Web",
            description: "The headless blog platform with built-in SEO, analytics, and LLM visibility tracking. Rank on Google and get cited by AI.",
            url: process.env.NEXT_PUBLIC_APP_URL ?? "https://rankflo.io",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", ratingCount: "127" },
          }),
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black pb-0 pt-24">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[radial-gradient(ellipse_at_top,rgba(57,255,20,0.12)_0%,transparent_65%)]" />

        <div className="relative mx-auto max-w-wide px-6">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/5 px-4 py-1.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_rgba(57,255,20,0.8)]" />
              Blog · Analytics · LLM Visibility — all in one
            </span>
          </div>

          {/* Headline */}
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Rank on Google.
              <br />
              <span className="text-accent">Get cited by AI.</span>
              <br />
              Track everything.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-400">
              RankFlo is the headless blog platform with built-in SEO tools, analytics, and LLM visibility tracking — everything your content needs to win.
            </p>
          </div>

          {/* Quick site check */}
          <div className="mx-auto mt-10 flex flex-col items-center gap-3">
            <p className="text-sm font-medium text-gray-300">
              See what&apos;s holding your site back — enter your URL:
            </p>
            <SiteCheckForm />
            <div className="flex items-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Free plan forever</span>
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> No credit card</span>
              <span className="flex items-center gap-1.5"><span className="text-accent">✓</span> Self-hostable</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="rounded-t-2xl border border-b-0 border-gray-800 bg-gray-950 shadow-[0_-8px_60px_rgba(57,255,20,0.07)]">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-gray-800 px-5 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                <div className="mx-auto flex items-center gap-6 text-xs text-gray-600">
                  <span className="rounded bg-gray-800 px-3 py-1">Blog & SEO</span>
                  <span className="px-3 py-1">Analytics</span>
                  <span className="px-3 py-1">LLM Search</span>
                </div>
                <div className="text-xs text-gray-700">app.rankflo.io</div>
              </div>

              {/* Dashboard content */}
              <div className="p-6">
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Organic visitors", value: "24,891", delta: "+31%", color: "text-accent" },
                    { label: "AI citations", value: "847", delta: "+12%", color: "text-accent" },
                    { label: "SEO score", value: "94", delta: "Excellent", color: "text-accent" },
                    { label: "LLM visibility", value: "78/100", delta: "Grade B+", color: "text-amber-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-800 bg-black p-4">
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
                      <p className={`mt-0.5 text-xs font-medium ${s.color}`}>{s.delta}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Mini chart */}
                  <div className="col-span-2 rounded-xl border border-gray-800 bg-black p-4">
                    <p className="mb-3 text-xs text-gray-500">Organic traffic · Last 30 days</p>
                    <div className="flex items-end gap-1 h-24">
                      {[20,28,22,35,30,42,38,50,44,55,60,52,68,65,72,70,80,75,85,82,90,88,95,92,100,96,88,94,98,100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: `rgba(57,255,20,${0.08 + (h / 100) * 0.35})` }} />
                      ))}
                    </div>
                  </div>
                  {/* AI citations breakdown */}
                  <div className="rounded-xl border border-gray-800 bg-black p-4">
                    <p className="mb-3 text-xs text-gray-500">AI platform citations</p>
                    {[
                      { name: "ChatGPT", pct: 42, color: "bg-green-500" },
                      { name: "Perplexity", pct: 31, color: "bg-blue-500" },
                      { name: "Claude", pct: 18, color: "bg-purple-500" },
                      { name: "Others", pct: 9, color: "bg-gray-600" },
                    ].map((p) => (
                      <div key={p.name} className="mb-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>{p.name}</span><span>{p.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-800">
                          <div className={`h-1.5 rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── THREE MODES ──────────────────────────────────────── */}
      <section className="bg-white py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-accent">One platform. Three growth engines.</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Everything your content needs
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500">
              Most tools do one thing. RankFlo does all three — and they work together.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                badge: "Blog & SEO",
                badgeColor: "bg-green-50 text-green-700 dark:bg-accent/10 dark:text-accent",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                ),
                title: "Publish content that ranks",
                desc: "AI-powered editor that generates SEO-optimized posts in your brand voice. Built-in scoring, meta optimization, and structured data — without plugins.",
                bullets: ["AI content generation", "Real-time SEO scoring", "Auto JSON-LD & Open Graph", "Full-text search API"],
                glow: "hover:shadow-[0_0_40px_rgba(57,255,20,0.08)]",
                accent: "border-green-200 dark:border-green-900/40",
              },
              {
                badge: "Analytics",
                badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
                title: "Know exactly what's working",
                desc: "Cookieless, privacy-first analytics with one line of JavaScript. See pageviews, traffic sources, top content, and Core Web Vitals — all in one dashboard.",
                bullets: ["One-line tracker.js setup", "Content performance tracking", "Traffic source attribution", "Custom events API"],
                glow: "hover:shadow-[0_0_40px_rgba(59,130,246,0.08)]",
                accent: "border-blue-200 dark:border-blue-900/40",
              },
              {
                badge: "LLM Visibility",
                badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                ),
                title: "Get cited by ChatGPT & Perplexity",
                desc: "Track when AI assistants mention your brand, log citations, monitor competitors' AI visibility, and optimize your content to appear in AI-generated answers.",
                bullets: ["Brand mention tracking", "Share of Voice vs. competitors", "Prompt testing & monitoring", "AI citation optimization"],
                glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.08)]",
                accent: "border-purple-200 dark:border-purple-900/40",
              },
            ].map((mode) => (
              <div
                key={mode.badge}
                className={`group relative rounded-2xl border bg-white p-8 transition-all ${mode.accent} ${mode.glow} dark:bg-gray-950`}
              >
                <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${mode.badgeColor} mb-4`}>
                  {mode.badge}
                </div>
                <div className="mb-3 text-gray-400 dark:text-gray-500">{mode.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{mode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{mode.desc}</p>
                <ul className="mt-5 space-y-2">
                  {mode.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="h-3.5 w-3.5 shrink-0 text-green-500 dark:text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-24 dark:border-gray-800 dark:bg-black">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-accent">Setup in minutes</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">From zero to publishing in 3 steps</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add one line to your site",
                desc: "Drop the tracker snippet into your website. It starts collecting analytics instantly — no cookies, no GDPR headaches.",
                code: `<script src="https://app.rankflo.io/tracker.js"\n  data-project-key="blg_xxx" async></script>`,
              },
              {
                step: "02",
                title: "Publish AI-optimized content",
                desc: "Write in the rich editor or let AI draft it. Every post gets automatic SEO scoring, meta tags, and structured data before you hit publish.",
                code: `// Fetch your published posts\nawait fetch('/api/v1/content?\n  project_key=blg_xxx')`,
              },
              {
                step: "03",
                title: "Track rankings, traffic & AI mentions",
                desc: "Watch your organic traffic grow. Monitor when ChatGPT and Perplexity cite your content. Optimize what's working.",
                code: `// Custom events\nwindow.rankflo.track(\n  'signup', { plan: 'pro' })`,
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-5xl font-bold text-gray-100 dark:text-gray-900 select-none">{s.step}</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.desc}</p>
                <pre className="mt-4 overflow-x-auto rounded-xl border border-gray-200 bg-gray-900 p-4 text-xs leading-relaxed text-gray-300 dark:border-gray-800">
                  <code>{s.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ────────────────────────────────────── */}
      <section className="py-24 dark:bg-gray-950">
        <div className="mx-auto max-w-wide px-6">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold text-green-600 dark:text-accent">Built different</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">No plugins. No bloat. Just features.</h2>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 dark:border-gray-800 dark:bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Block editor", desc: "14+ block types including code, embeds, callouts, and custom HTML. Content stored as portable JSON.", icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" },
              { title: "REST + tRPC API", desc: "Type-safe APIs for posts, tags, search, sitemaps, and RSS. Plus webhooks on every publish event.", icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" },
              { title: "Full-text search", desc: "Postgres-powered FTS with autocomplete, tag filtering, and built-in search analytics.", icon: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" },
              { title: "AI writer", desc: "Generate full posts from a prompt. Supports OpenAI, Claude, Gemini, and local Ollama models.", icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
              { title: "Media library", desc: "S3-compatible storage with drag-and-drop upload, image dimensions, and one-click URL copy.", icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" },
              { title: "Team & RBAC", desc: "Admin, Editor, Author, Viewer roles. Invite by email. Org-level permissions built in.", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
              { title: "Custom domains", desc: "Point any domain to your blog with CNAME. Automatic HTTPS via your existing CDN.", icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3" },
              { title: "Self-hostable", desc: "Docker + PostgreSQL + Redis. Deploy on any VPS. Own your data. No vendor lock-in.", icon: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008z" },
            ].map((f) => (
              <div key={f.title} className="group bg-white p-7 transition-colors hover:bg-gray-50 dark:bg-black dark:hover:bg-gray-950">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-green-600 dark:bg-gray-900 dark:text-accent">
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OPEN SOURCE + PRICING STRIP ──────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-20 dark:border-gray-800 dark:bg-black">
        <div className="mx-auto max-w-wide px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Open source */}
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400 mb-4">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                MIT License · Open Source
              </span>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Self-host free, forever</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                RankFlo is fully open source. Deploy on your own server with Docker — no usage limits, no monthly fees, no vendor lock-in.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://github.com/sitbonruben/RankFlo" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub repo
                </a>
                <a href="https://dev.rankflo.io" className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600">
                  Self-hosting guide →
                </a>
              </div>
            </div>

            {/* Pricing cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  name: "Free",
                  price: "$0",
                  period: "forever",
                  features: ["50 posts", "10 AI credits/mo", "Full analytics", "REST API"],
                  cta: "Start free",
                  href: "/signup",
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "$29",
                  period: "per month",
                  features: ["Unlimited posts", "200 AI credits/mo", "1 year analytics", "Custom domain"],
                  cta: "Try free 7 days",
                  href: "/signup?plan=pro",
                  highlight: true,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 ${plan.highlight ? "border-accent/40 bg-accent/5 dark:bg-accent/5" : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"}`}
                >
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.name}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-gray-500">{plan.period}</span>
                  </div>
                  <ul className="my-4 space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <svg className="h-3 w-3 shrink-0 text-green-500 dark:text-accent" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full rounded-lg py-2 text-center text-sm font-semibold transition-all ${plan.highlight ? "bg-accent text-black hover:bg-accent-9" : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
              <div className="col-span-2">
                <Link href="/pricing" className="flex w-full items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-2">
                  See full pricing including Enterprise →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-24 dark:bg-gray-950">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                { "@type": "Question", name: "Is RankFlo free?", acceptedAnswer: { "@type": "Answer", text: "Yes. RankFlo has a free plan with 50 posts, 10 AI credits/month, and full API access. You can also self-host the open-source version for free with no limits." } },
                { "@type": "Question", name: "How is it different from WordPress or Ghost?", acceptedAnswer: { "@type": "Answer", text: "RankFlo is headless — content is served via a fast REST API. AI generation, SEO scoring, analytics, and LLM visibility tracking are all built in, not plugins." } },
                { "@type": "Question", name: "What is LLM Visibility?", acceptedAnswer: { "@type": "Answer", text: "LLM Visibility tracks when AI assistants like ChatGPT, Perplexity, and Claude mention or cite your brand. You can log mentions, monitor competitor AI presence, and optimize your content to appear in AI-generated answers." } },
                { "@type": "Question", name: "What AI models does it use?", acceptedAnswer: { "@type": "Answer", text: "RankFlo supports OpenAI (GPT-4), Anthropic (Claude), Google (Gemini), and local models via Ollama. Bring your own API key or use built-in credits." } },
                { "@type": "Question", name: "Can I self-host RankFlo?", acceptedAnswer: { "@type": "Answer", text: "Yes. RankFlo is MIT-licensed and ships as a Docker Compose stack. Deploy on any VPS with PostgreSQL and Redis." } },
                { "@type": "Question", name: "Do I need a credit card?", acceptedAnswer: { "@type": "Answer", text: "No. The free plan needs no card. Pro includes a 7-day free trial — no card required until the trial ends." } },
              ],
            }),
          }}
        />
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Frequently asked questions</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { q: "Is RankFlo free?", a: "The free plan includes 50 posts, 10 AI credits/month, and full API access. Self-host the open-source version for zero cost with no limits." },
              { q: "How is it different from Ghost?", a: "RankFlo is headless — content via fast API, not themes. AI writing, SEO scoring, analytics, and LLM tracking are all built in, not plugins." },
              { q: "What is LLM Visibility?", a: "Track when ChatGPT, Perplexity, and Claude mention your brand. Log citations, monitor competitors, and optimize to appear in AI answers." },
              { q: "What AI models work with it?", a: "OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini), and local Ollama models. Bring your own key or use built-in credits." },
              { q: "Can I self-host?", a: "Yes. MIT license, Docker Compose stack. One command to start: postgres + redis + web. Own your data, zero monthly fees." },
              { q: "Credit card required?", a: "No. Free plan starts immediately. Pro has a 7-day trial — card only needed if you keep it after the trial." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{q}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.1)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        <div className="relative mx-auto max-w-xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Start ranking in<br /><span className="text-accent">days, not months</span>
          </h2>
          <p className="mt-5 text-lg text-gray-400">
            Free plan. No credit card. Works in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-13 w-full items-center justify-center rounded-xl bg-accent px-8 text-base font-semibold text-black transition-all hover:bg-accent-9 hover:shadow-[0_0_32px_rgba(57,255,20,0.4)] sm:w-auto"
            >
              Get started free
            </Link>
            <a
              href="https://dev.rankflo.io"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 px-8 text-base font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white sm:w-auto"
            >
              Read the docs
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            Or{" "}
            <a href="https://github.com/sitbonruben/RankFlo" className="text-gray-500 underline underline-offset-2 hover:text-gray-300">
              self-host for free on GitHub
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
