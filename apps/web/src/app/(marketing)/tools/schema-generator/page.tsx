"use client";

import { useState } from "react";
import Link from "next/link";

type SchemaType = "Article" | "FAQ" | "HowTo" | "Organization";

const DEFAULTS: Record<SchemaType, Record<string, string>> = {
  Article: { headline: "", author: "", datePublished: new Date().toISOString().slice(0, 10), image: "", description: "" },
  FAQ: { q1: "", a1: "", q2: "", a2: "", q3: "", a3: "" },
  HowTo: { name: "", description: "", step1: "", step2: "", step3: "" },
  Organization: { name: "", url: "", logo: "", description: "" },
};

function generateSchema(type: SchemaType, data: Record<string, string>): string {
  if (type === "Article") {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: data.headline,
      author: { "@type": "Person", name: data.author },
      datePublished: data.datePublished,
      image: data.image || undefined,
      description: data.description,
    }, null, 2);
  }
  if (type === "FAQ") {
    const questions = [
      { q: data.q1, a: data.a1 },
      { q: data.q2, a: data.a2 },
      { q: data.q3, a: data.a3 },
    ].filter((x) => x.q && x.a);
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    }, null, 2);
  }
  if (type === "HowTo") {
    const steps = [data.step1, data.step2, data.step3].filter(Boolean);
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: data.name,
      description: data.description,
      step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
    }, null, 2);
  }
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
    logo: data.logo || undefined,
    description: data.description,
  }, null, 2);
}

export default function SchemaGeneratorPage() {
  const [type, setType] = useState<SchemaType>("Article");
  const [fields, setFields] = useState<Record<string, string>>(DEFAULTS.Article);
  const [copied, setCopied] = useState(false);

  const output = generateSchema(type, fields);
  const set = (key: string, val: string) => setFields((f) => ({ ...f, [key]: val }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold text-white">JSON-LD Schema Generator</h1>
      <p className="mt-2 text-gray-400">Generate structured data markup for your blog posts, FAQs, how-to guides, and organization pages. Paste the output into your HTML <code className="text-accent text-xs bg-gray-900 px-1.5 py-0.5 rounded">&lt;head&gt;</code>.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-xl border border-gray-800 bg-gray-950 p-6">
          <div className="mb-5 flex gap-2">
            {(["Article", "FAQ", "HowTo", "Organization"] as SchemaType[]).map((t) => (
              <button key={t} onClick={() => { setType(t); setFields(DEFAULTS[t]); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${type === t ? "bg-accent/15 text-accent" : "text-gray-500 hover:text-gray-300 border border-gray-800"}`}
              >{t}</button>
            ))}
          </div>

          <div className="space-y-3">
            {type === "Article" && (
              <>
                <Input label="Headline" value={fields.headline} onChange={(v) => set("headline", v)} placeholder="Your blog post title" />
                <Input label="Author name" value={fields.author} onChange={(v) => set("author", v)} placeholder="Jane Smith" />
                <Input label="Publish date" value={fields.datePublished} onChange={(v) => set("datePublished", v)} type="date" />
                <Input label="Image URL" value={fields.image} onChange={(v) => set("image", v)} placeholder="https://..." />
                <Input label="Description" value={fields.description} onChange={(v) => set("description", v)} placeholder="A short description" />
              </>
            )}
            {type === "FAQ" && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Input label={`Question ${i}`} value={fields[`q${i}`]} onChange={(v) => set(`q${i}`, v)} placeholder="What is...?" />
                    <Input label={`Answer ${i}`} value={fields[`a${i}`]} onChange={(v) => set(`a${i}`, v)} placeholder="The answer is..." />
                  </div>
                ))}
              </>
            )}
            {type === "HowTo" && (
              <>
                <Input label="Guide title" value={fields.name} onChange={(v) => set("name", v)} placeholder="How to..." />
                <Input label="Description" value={fields.description} onChange={(v) => set("description", v)} placeholder="A guide to..." />
                {[1, 2, 3].map((i) => (
                  <Input key={i} label={`Step ${i}`} value={fields[`step${i}`]} onChange={(v) => set(`step${i}`, v)} placeholder={`Step ${i} instruction`} />
                ))}
              </>
            )}
            {type === "Organization" && (
              <>
                <Input label="Organization name" value={fields.name} onChange={(v) => set("name", v)} placeholder="RankFlo" />
                <Input label="Website URL" value={fields.url} onChange={(v) => set("url", v)} placeholder="https://rankflo.io" />
                <Input label="Logo URL" value={fields.logo} onChange={(v) => set("logo", v)} placeholder="https://..." />
                <Input label="Description" value={fields.description} onChange={(v) => set("description", v)} placeholder="What your organization does" />
              </>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="rounded-xl border border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center justify-between border-b border-gray-800/60 px-4 py-2">
            <span className="text-[11px] font-medium text-gray-500">json-ld</span>
            <button onClick={() => { navigator.clipboard.writeText(`<script type="application/ld+json">\n${output}\n</script>`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-800 hover:text-gray-300">
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-gray-300"><code>{`<script type="application/ld+json">\n${output}\n</script>`}</code></pre>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-gray-800 bg-gray-950 p-8 text-center">
        <h2 className="text-lg font-bold text-white">RankFlo generates structured data automatically</h2>
        <p className="mt-2 text-sm text-gray-400">Every published post gets JSON-LD schema markup without manual setup.</p>
        <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-black hover:bg-accent-9">Start free</Link>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-accent/50 focus:outline-none" />
    </div>
  );
}
