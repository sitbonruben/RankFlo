"use client";

import type {
  EditorDocument,
  EditorBlock,
  BlockPropsMap,
} from "@rankflo/core/types";

// ─── Props ──────────────────────────────────────────────

interface PostRendererProps {
  document: EditorDocument;
  className?: string;
}

// ─── Main Renderer ──────────────────────────────────────

export function PostRenderer({ document, className = "" }: PostRendererProps) {
  if (!document || !document.blocks || document.blocks.length === 0) {
    return null;
  }

  return (
    <article className={`post-renderer ${className}`}>
      {document.blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </article>
  );
}

// ─── Block Router ───────────────────────────────────────

function RenderBlock({ block }: { block: EditorBlock }) {
  switch (block.type) {
    case "hero":
      return <HeroBlock props={block.props as BlockPropsMap["hero"]} />;
    case "heading":
      return <HeadingBlock props={block.props as BlockPropsMap["heading"]} />;
    case "text":
      return <TextBlock props={block.props as BlockPropsMap["text"]} />;
    case "image":
      return <ImageBlock props={block.props as BlockPropsMap["image"]} />;
    case "quote":
      return <QuoteBlock props={block.props as BlockPropsMap["quote"]} />;
    case "code":
      return <CodeBlock props={block.props as BlockPropsMap["code"]} />;
    case "callout":
      return <CalloutBlock props={block.props as BlockPropsMap["callout"]} />;
    case "divider":
      return <DividerBlock props={block.props as BlockPropsMap["divider"]} />;
    case "two-column":
      return (
        <TwoColumnBlock props={block.props as BlockPropsMap["two-column"]} />
      );
    case "list":
      return <ListBlock props={block.props as BlockPropsMap["list"]} />;
    case "embed":
      return <EmbedBlock props={block.props as BlockPropsMap["embed"]} />;
    case "table-of-contents":
      return (
        <TableOfContentsBlock
          props={block.props as BlockPropsMap["table-of-contents"]}
        />
      );
    case "newsletter-cta":
      return (
        <NewsletterCtaBlock
          props={block.props as BlockPropsMap["newsletter-cta"]}
        />
      );
    case "author-bio":
      return (
        <AuthorBioBlock props={block.props as BlockPropsMap["author-bio"]} />
      );
    default:
      return null;
  }
}

// ─── Hero ───────────────────────────────────────────────

function HeroBlock({ props }: { props: BlockPropsMap["hero"] }) {
  const heightClasses: Record<string, string> = {
    small: "min-h-[280px]",
    medium: "min-h-[400px]",
    large: "min-h-[560px]",
    full: "min-h-screen",
  };

  const alignmentClasses: Record<string, string> = {
    left: "items-start text-left",
    center: "items-center text-center",
    right: "items-end text-right",
  };

  const overlayClasses: Record<string, string> = {
    none: "",
    light: "bg-white/30",
    dark: "bg-black/60",
    gradient:
      "bg-gradient-to-b from-black/70 via-black/40 to-black/80",
  };

  return (
    <header
      className={`relative flex w-full flex-col justify-center ${heightClasses[props.height] || heightClasses.medium} ${alignmentClasses[props.alignment] || alignmentClasses.center} overflow-hidden px-6 py-16`}
      style={{
        backgroundImage: props.backgroundImage
          ? `url(${props.backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      {props.overlay !== "none" && props.backgroundImage && (
        <div
          className={`absolute inset-0 ${overlayClasses[props.overlay] || ""}`}
        />
      )}

      {/* Default dark background when no image */}
      {!props.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      )}

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <h1
          className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "'Newsreader', serif" }}
        >
          {props.title}
        </h1>
        {props.subtitle && (
          <p className="mt-4 text-lg text-gray-300 sm:text-xl">
            {props.subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

// ─── Heading ────────────────────────────────────────────

function HeadingBlock({ props }: { props: BlockPropsMap["heading"] }) {
  const Tag = `h${props.level}` as "h1" | "h2" | "h3" | "h4";

  const sizeClasses: Record<number, string> = {
    1: "text-3xl sm:text-4xl font-bold tracking-tight mt-12 mb-6",
    2: "text-2xl sm:text-3xl font-bold tracking-tight mt-10 mb-4",
    3: "text-xl sm:text-2xl font-semibold mt-8 mb-3",
    4: "text-lg sm:text-xl font-semibold mt-6 mb-2",
  };

  const fontClass =
    props.level === 1 ? "font-serif" : "";

  return (
    <div className="mx-auto max-w-prose px-6">
      <Tag
        className={`text-white ${sizeClasses[props.level] || sizeClasses[2]} ${fontClass}`}
        style={{ textAlign: props.alignment }}
        id={slugifyText(props.text)}
      >
        {props.text}
      </Tag>
    </div>
  );
}

// ─── Text ───────────────────────────────────────────────

function TextBlock({ props }: { props: BlockPropsMap["text"] }) {
  return (
    <div className="mx-auto max-w-prose px-6">
      <div
        className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed [&_a]:text-[#39FF14] [&_a]:no-underline hover:[&_a]:underline [&_strong]:text-white [&_em]:text-gray-200"
        style={{ textAlign: props.alignment }}
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    </div>
  );
}

// ─── Image ──────────────────────────────────────────────

function ImageBlock({ props }: { props: BlockPropsMap["image"] }) {
  if (!props.src) return null;

  const widthClasses: Record<string, string> = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    full: "max-w-full",
  };

  return (
    <figure
      className={`mx-auto my-8 px-6 ${widthClasses[props.width] || widthClasses.large}`}
    >
      <img
        src={props.src}
        alt={props.alt}
        className={`w-full ${props.rounded ? "rounded-xl" : ""} ${props.shadow ? "shadow-2xl shadow-black/50" : ""}`}
        loading="lazy"
      />
      {props.caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-500">
          {props.caption}
        </figcaption>
      )}
    </figure>
  );
}

// ─── Quote ──────────────────────────────────────────────

function QuoteBlock({ props }: { props: BlockPropsMap["quote"] }) {
  return (
    <div className="mx-auto my-10 max-w-prose px-6">
      <blockquote
        className={`relative py-4 ${
          props.style === "highlighted"
            ? "rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/20 px-8 py-6"
            : props.style === "bordered"
              ? "border-l-4 border-[#39FF14] pl-6"
              : "border-l-2 border-gray-700 pl-6"
        }`}
      >
        <p className="text-lg italic leading-relaxed text-gray-200 sm:text-xl">
          &ldquo;{props.text}&rdquo;
        </p>
        {props.author && (
          <cite className="mt-4 block text-sm font-medium not-italic text-gray-500">
            &mdash; {props.author}
          </cite>
        )}
      </blockquote>
    </div>
  );
}

// ─── Code ───────────────────────────────────────────────

function CodeBlock({ props }: { props: BlockPropsMap["code"] }) {
  return (
    <div className="mx-auto my-8 max-w-prose px-6">
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2">
          <div className="flex items-center gap-2">
            {/* Traffic light dots */}
            <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-700" />
            {props.filename && (
              <span className="ml-2 text-xs text-gray-500">
                {props.filename}
              </span>
            )}
          </div>
          <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            {props.language}
          </span>
        </div>

        {/* Code content */}
        <div className="overflow-x-auto p-4">
          <pre className="text-sm leading-relaxed">
            <code className="font-mono text-gray-300">
              {props.showLineNumbers
                ? props.code.split("\n").map((line, i) => (
                    <div key={i} className="flex">
                      <span className="mr-4 inline-block w-8 select-none text-right text-gray-700">
                        {i + 1}
                      </span>
                      <span>{line}</span>
                    </div>
                  ))
                : props.code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// ─── Callout ────────────────────────────────────────────

function CalloutBlock({ props }: { props: BlockPropsMap["callout"] }) {
  const styles: Record<
    string,
    { border: string; bg: string; icon: string; iconColor: string }
  > = {
    info: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/5",
      icon: "\u2139\uFE0F",
      iconColor: "text-blue-400",
    },
    warning: {
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/5",
      icon: "\u26A0\uFE0F",
      iconColor: "text-yellow-400",
    },
    success: {
      border: "border-green-500/30",
      bg: "bg-green-500/5",
      icon: "\u2705",
      iconColor: "text-green-400",
    },
    error: {
      border: "border-red-500/30",
      bg: "bg-red-500/5",
      icon: "\u274C",
      iconColor: "text-red-400",
    },
  };

  const s = styles[props.type] || styles.info;

  return (
    <div className="mx-auto my-6 max-w-prose px-6">
      <aside
        className={`rounded-xl border ${s.border} ${s.bg} px-6 py-5`}
      >
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 text-lg ${s.iconColor}`}>{s.icon}</span>
          <div>
            <p className="font-semibold text-white">{props.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-300">
              {props.text}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

// ─── Divider ────────────────────────────────────────────

function DividerBlock({ props }: { props: BlockPropsMap["divider"] }) {
  const spacingClasses: Record<string, string> = {
    small: "my-4",
    medium: "my-8",
    large: "my-12",
  };

  const spacing = spacingClasses[props.spacing] || spacingClasses.medium;

  if (props.style === "dots") {
    return (
      <div
        className={`mx-auto flex max-w-prose items-center justify-center gap-3 px-6 ${spacing}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-gray-700" />
      </div>
    );
  }

  if (props.style === "space") {
    return <div className={spacing} />;
  }

  // Default: line
  return (
    <div className={`mx-auto max-w-prose px-6 ${spacing}`}>
      <hr className="border-gray-800" />
    </div>
  );
}

// ─── Two Column ─────────────────────────────────────────

function TwoColumnBlock({
  props,
}: {
  props: BlockPropsMap["two-column"];
}) {
  const ratioClasses: Record<string, string> = {
    "50-50": "grid-cols-1 md:grid-cols-2",
    "60-40": "grid-cols-1 md:grid-cols-[3fr_2fr]",
    "40-60": "grid-cols-1 md:grid-cols-[2fr_3fr]",
    "70-30": "grid-cols-1 md:grid-cols-[7fr_3fr]",
    "30-70": "grid-cols-1 md:grid-cols-[3fr_7fr]",
  };

  const gapClasses: Record<string, string> = {
    small: "gap-4",
    medium: "gap-8",
    large: "gap-12",
  };

  return (
    <div className="mx-auto my-8 max-w-5xl px-6">
      <div
        className={`grid ${ratioClasses[props.ratio] || ratioClasses["50-50"]} ${gapClasses[props.gap] || gapClasses.medium}`}
      >
        <div>
          {props.leftChildren.map((block) => (
            <RenderBlock key={block.id} block={block} />
          ))}
        </div>
        <div>
          {props.rightChildren.map((block) => (
            <RenderBlock key={block.id} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── List ───────────────────────────────────────────────

function ListBlock({ props }: { props: BlockPropsMap["list"] }) {
  const Tag = props.style === "number" ? "ol" : "ul";

  return (
    <div className="mx-auto my-6 max-w-prose px-6">
      <Tag
        className={`space-y-2 pl-1 text-gray-300 ${
          props.style === "number"
            ? "list-decimal pl-6"
            : props.style === "check"
              ? "list-none"
              : "list-disc pl-6"
        }`}
      >
        {props.items.map((item, i) => (
          <li
            key={i}
            className={`text-base leading-relaxed ${
              props.style === "check" ? "flex items-start gap-2" : ""
            }`}
          >
            {props.style === "check" && (
              <span className="mt-1 text-[#39FF14]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </Tag>
    </div>
  );
}

// ─── Embed ──────────────────────────────────────────────

function EmbedBlock({ props }: { props: BlockPropsMap["embed"] }) {
  if (!props.url) return null;

  const aspectClasses: Record<string, string> = {
    "16:9": "aspect-video",
    "4:3": "aspect-[4/3]",
    "1:1": "aspect-square",
  };

  // YouTube embed
  if (props.type === "youtube") {
    const videoId = extractYouTubeId(props.url);
    if (videoId) {
      return (
        <div className="mx-auto my-8 max-w-3xl px-6">
          <div
            className={`overflow-hidden rounded-xl ${aspectClasses[props.aspectRatio] || aspectClasses["16:9"]}`}
          >
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded video"
            />
          </div>
        </div>
      );
    }
  }

  // Generic link card
  return (
    <div className="mx-auto my-8 max-w-prose px-6">
      <a
        href={props.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {props.url}
          </p>
          <p className="text-xs text-gray-500">Open in new tab</p>
        </div>
      </a>
    </div>
  );
}

// ─── Table of Contents ──────────────────────────────────

function TableOfContentsBlock({
  props,
}: {
  props: BlockPropsMap["table-of-contents"];
}) {
  // This would normally be hydrated with real heading data
  // For the renderer, we show a placeholder that client-side JS can populate
  return (
    <div className="mx-auto my-8 max-w-prose px-6">
      <nav
        className={`rounded-xl ${
          props.style === "boxed"
            ? "border border-gray-800 bg-gray-950 p-6"
            : "py-4"
        }`}
      >
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Table of Contents
        </p>
        <div className="space-y-1.5 text-sm text-gray-400">
          <p className="text-gray-600">
            Contents are generated automatically from headings.
          </p>
        </div>
      </nav>
    </div>
  );
}

// ─── Newsletter CTA ─────────────────────────────────────

function NewsletterCtaBlock({
  props,
}: {
  props: BlockPropsMap["newsletter-cta"];
}) {
  if (props.style === "banner") {
    return (
      <div className="my-12 w-full bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 py-12">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h3 className="text-2xl font-bold text-white">{props.title}</h3>
          <p className="mt-2 text-gray-400">{props.description}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <input
              type="email"
              placeholder={props.placeholder}
              className="h-11 w-full max-w-xs rounded-lg border border-gray-700 bg-gray-900 px-4 text-sm text-white placeholder:text-gray-600 focus:border-[#39FF14]/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/20"
              readOnly
            />
            <button
              type="button"
              className="h-11 shrink-0 rounded-lg bg-[#39FF14] px-6 text-sm font-semibold text-black transition-colors hover:bg-[#32e012]"
            >
              {props.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (props.style === "minimal") {
    return (
      <div className="mx-auto my-10 max-w-prose px-6">
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="font-medium text-white">{props.title}</p>
          <p className="text-sm text-gray-400">{props.description}</p>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder={props.placeholder}
              className="h-9 w-60 rounded-lg border border-gray-700 bg-gray-900 px-3 text-sm text-white placeholder:text-gray-600 focus:border-[#39FF14]/50 focus:outline-none"
              readOnly
            />
            <button
              type="button"
              className="h-9 rounded-lg bg-[#39FF14] px-4 text-sm font-semibold text-black"
            >
              {props.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: card
  return (
    <div className="mx-auto my-10 max-w-prose px-6">
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
        <h3 className="text-xl font-bold text-white">{props.title}</h3>
        <p className="mt-2 text-sm text-gray-400">{props.description}</p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <input
            type="email"
            placeholder={props.placeholder}
            className="h-10 w-full max-w-xs rounded-lg border border-gray-700 bg-gray-950 px-4 text-sm text-white placeholder:text-gray-600 focus:border-[#39FF14]/50 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/20"
            readOnly
          />
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg bg-[#39FF14] px-6 text-sm font-semibold text-black transition-colors hover:bg-[#32e012]"
          >
            {props.buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Author Bio ─────────────────────────────────────────

function AuthorBioBlock({
  props,
}: {
  props: BlockPropsMap["author-bio"];
}) {
  return (
    <div className="mx-auto my-10 max-w-prose px-6">
      <div className="flex items-center gap-5 rounded-2xl border border-gray-800 bg-gray-900 p-6">
        {/* Avatar */}
        <div className="shrink-0">
          {props.avatar ? (
            <img
              src={props.avatar}
              alt={props.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 text-lg font-bold text-gray-400">
              {props.name
                ? props.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">
            {props.name || "Author"}
          </p>
          {props.bio && (
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              {props.bio}
            </p>
          )}
          {props.links && props.links.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {props.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#39FF14] hover:underline"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? match[1] : null;
}
