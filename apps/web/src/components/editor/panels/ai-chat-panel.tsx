"use client";

import * as React from "react";
import { trpc } from "@/trpc/client";
import { useEditorStore } from "@/stores/editor-store";

// ─── Types ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  pendingBlocks?: unknown[];
}

// Blog types the AI can create
const BLOG_TYPES = [
  { id: "how-to", label: "How-To Guide", icon: "📝", description: "Step-by-step instructions" },
  { id: "listicle", label: "Listicle", icon: "📋", description: "Numbered tips or items" },
  { id: "tutorial", label: "Tutorial", icon: "🎓", description: "In-depth technical walkthrough" },
  { id: "comparison", label: "Comparison", icon: "⚔️", description: "Compare options side-by-side" },
  { id: "case-study", label: "Case Study", icon: "📊", description: "Real-world example & results" },
  { id: "opinion", label: "Opinion", icon: "💭", description: "Thought leadership piece" },
  { id: "roundup", label: "Roundup", icon: "📰", description: "Curated list of resources" },
  { id: "blog-post", label: "Blog Post", icon: "✍️", description: "Standard SEO article" },
] as const;

type BlogTypeId = (typeof BLOG_TYPES)[number]["id"];

// Pending blog creation state
interface PendingBlog {
  contentType: BlogTypeId;
  topic?: string;
}

// ─── Intent helpers ──────────────────────────────────────
const EDIT_PATTERNS = [
  /\b(improve|enhance|better|refine)\b/i,
  /\bfix\s+(grammar|spelling|writing|typos?)\b/i,
  /\bmake\s+(it\s+)?(shorter|longer|concise|simpler|engaging|professional)\b/i,
  /\b(rewrite|rephrase|paraphrase|restructure|reorganize)\b/i,
  /\badd\s+(a\s+)?(section|paragraph|image|callout|tip|warning|quote|example|introduction|conclusion)\b/i,
  /\bexpand\b/i,
  /\bsimplify\b/i,
  /\bseo\s+optim/i,
  /\badd\s+keyword/i,
  /\bformat\b.*\b(better|properly)\b/i,
];

function isEditIntent(msg: string): boolean {
  return EDIT_PATTERNS.some((p) => p.test(msg));
}

function detectBlogType(msg: string): BlogTypeId | null {
  const lower = msg.toLowerCase();
  if (lower.includes("how-to") || lower.includes("how to")) return "how-to";
  if (lower.includes("listicle") || lower.includes("list of") || /\d+\s+(ways|tips|tricks|strategies|ideas)/.test(lower)) return "listicle";
  if (lower.includes("tutorial")) return "tutorial";
  if (lower.includes("comparison") || lower.includes("vs ") || lower.includes("versus")) return "comparison";
  if (lower.includes("case study") || lower.includes("case-study")) return "case-study";
  if (lower.includes("opinion") || lower.includes("thought leadership")) return "opinion";
  if (lower.includes("roundup")) return "roundup";
  return "blog-post";
}

function isWriteIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    (lower.includes("write") || lower.includes("create") || lower.includes("generate") || lower.includes("make")) &&
    (lower.includes("post") || lower.includes("article") || lower.includes("blog") || lower.includes("guide") ||
      lower.includes("tutorial") || lower.includes("listicle") || lower.includes("comparison") || lower.includes("case study"))
  );
}

/** Extract topic from natural language, e.g. "create a blog about X", "write a listicle X", "create a blog show me what you can do X" */
function extractTopic(msg: string): string | null {
  // Try explicit preposition patterns first
  const explicit = [
    /(?:write|create|generate|make)\s+(?:a\s+)?(?:blog\s+)?(?:post|article|guide|tutorial|listicle|comparison|roundup|piece|content)?\s+(?:about|on|for|covering)\s+(.+)/i,
    /(?:about|on|for|covering|regarding)\s+(.+)/i,
  ];
  for (const p of explicit) {
    const m = msg.match(p);
    if (m?.[1]) return m[1].trim().replace(/[?.!]+$/, "");
  }
  // Strip intent/filler words and see what topic remains
  const stripped = msg
    .replace(/\b(write|create|generate|make|build)\b/gi, "")
    .replace(/\b(a|an|the)\b/gi, "")
    .replace(/\bblog\s*(post|article)?\b/gi, "")
    .replace(/\b(post|article|guide|tutorial|listicle|comparison|roundup|case\s*study|opinion)\b/gi, "")
    .replace(/\bshow\s+me\s+(what\s+you\s+can\s+do|your\s+capabilities?|what\s+it\s+can\s+do)\b/gi, "")
    .replace(/\b(can\s+do|how\s+it\s+works?|demo|example)\b/gi, "")
    .replace(/[?.!,]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length >= 3) return stripped;
  return null;
}

// ─── Typing Indicator ────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="ml-1 text-[11px] text-gray-600">Writing to editor…</span>
    </div>
  );
}

// ─── Message Bubble ──────────────────────────────────────
function MessageBubble({
  message,
  onApply,
  onDismiss,
}: {
  message: ChatMessage;
  onApply?: (blocks: unknown[]) => void;
  onDismiss?: (id: string) => void;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${isUser ? "" : "w-full"}`}>
        <div
          className={`rounded-xl px-3.5 py-2.5 ${
            isUser ? "bg-gray-800 text-gray-200" : "bg-gray-900 text-gray-300"
          }`}
        >
          {!isUser && (
            <div className="mb-1 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1l1.2 2.4L10 4l-2 2 .5 3L6 7.9 3.5 9l.5-3-2-2 2.8-.6L6 1z" fill="#39FF14" fillOpacity="0.6" />
              </svg>
              <span className="text-[10px] font-medium text-[#39FF14]/60">AI Editor</span>
            </div>
          )}
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
          <p className={`mt-1 text-[10px] ${isUser ? "text-gray-500" : "text-gray-600"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Apply/Dismiss — only for edit suggestions (not creation) */}
        {message.pendingBlocks && message.pendingBlocks.length > 0 && (
          <div className="mt-1.5 flex gap-2">
            <button
              onClick={() => onApply?.(message.pendingBlocks!)}
              className="flex-1 rounded-lg bg-[#39FF14]/10 px-3 py-1.5 text-[11px] font-semibold text-[#39FF14] transition-colors hover:bg-[#39FF14]/20"
            >
              ✓ Apply to editor
            </button>
            <button
              onClick={() => onDismiss?.(message.id)}
              className="rounded-lg border border-gray-800 px-3 py-1.5 text-[11px] text-gray-500 transition-colors hover:text-gray-400"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Blog Type Picker ─────────────────────────────────────
function BlogTypePicker({ onSelect }: { onSelect: (type: BlogTypeId) => void }) {
  return (
    <div className="px-3 py-3">
      <p className="mb-2 text-[11px] text-gray-500">Choose a blog format:</p>
      <div className="grid grid-cols-2 gap-1.5">
        {BLOG_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className="flex flex-col rounded-lg border border-gray-800 bg-gray-950 p-2 text-left transition-colors hover:border-[#39FF14]/30 hover:bg-gray-900"
          >
            <span className="text-base leading-none">{t.icon}</span>
            <span className="mt-1 text-[11px] font-medium text-gray-300">{t.label}</span>
            <span className="mt-0.5 text-[10px] text-gray-600">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState({ hasContent }: { hasContent: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 3l2.5 5 5.5 1.5-4 3.5 1 5.5L14 15.5 9 18.5l1-5.5-4-3.5L11.5 8 14 3z" stroke="#39FF14" strokeWidth="1.5" strokeLinejoin="round" fill="#39FF14" fillOpacity="0.1" />
          <path d="M6 22l1.5-3M22 22l-1.5-3M4 14h2M22 14h2" stroke="#39FF14" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-300">AI Editor Control</h3>
      <p className="mt-1 text-center text-[11px] leading-relaxed text-gray-600">
        {hasContent
          ? "Tell me to improve writing, add sections, SEO optimize, or make changes. I'll edit the canvas directly."
          : "Pick a blog format below or describe what you want. I'll write it straight into the editor."}
      </p>
    </div>
  );
}

const EDIT_QUICK_ACTIONS = [
  { label: "Improve writing", icon: "✨" },
  { label: "Make shorter", icon: "✂" },
  { label: "Add a callout tip", icon: "💡" },
  { label: "Add a quote", icon: "❝" },
  { label: "Add an image", icon: "🖼" },
  { label: "SEO optimize", icon: "📈" },
  { label: "Fix grammar", icon: "✓" },
  { label: "Generate outline", icon: "📋" },
];

// ─── Block label helper ──────────────────────────────────
function blockLabel(block: { type: string; props: Record<string, unknown> }): string {
  switch (block.type) {
    case "heading": return `H${block.props.level ?? 2}: "${String(block.props.text ?? "").slice(0, 40)}"`;
    case "text": return `Paragraph: "${String(block.props.html ?? "").replace(/<[^>]+>/g, "").slice(0, 40)}…"`;
    case "image": return `Image: ${String(block.props.alt ?? block.props.caption ?? "").slice(0, 40)}`;
    case "list": return `List (${(block.props.items as string[] | undefined)?.length ?? 0} items)`;
    case "callout": return `Callout: "${String(block.props.title ?? "").slice(0, 40)}"`;
    case "quote": return `Quote: "${String(block.props.text ?? "").slice(0, 40)}…"`;
    case "divider": return "Divider";
    default: return block.type.charAt(0).toUpperCase() + block.type.slice(1) + " block";
  }
}

// ─── Selected Section Banner ─────────────────────────────
function SelectedSectionBanner({
  block,
  onClear,
}: {
  block: { type: string; props: Record<string, unknown> };
  onClear: () => void;
}) {
  return (
    <div className="mx-3 mb-2 flex items-center justify-between rounded-lg border border-[#39FF14]/20 bg-[#39FF14]/5 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium text-[#39FF14]/60 uppercase tracking-wider">Working on section</p>
        <p className="mt-0.5 truncate text-[11px] text-gray-300">{blockLabel(block)}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="ml-2 shrink-0 rounded p-1 text-gray-500 hover:text-gray-300"
        title="Clear selection — work on whole post"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── AI Chat Panel ───────────────────────────────────────
export function AiChatPanel() {
  const projectId = useEditorStore((s) => s.projectId);
  const title = useEditorStore((s) => s.title);
  const document = useEditorStore((s) => s.document);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const setDocument = useEditorStore((s) => s.setDocument);
  const setTitle = useEditorStore((s) => s.setTitle);
  const setSlug = useEditorStore((s) => s.setSlug);
  const setExcerpt = useEditorStore((s) => s.setExcerpt);
  const setFeaturedImage = useEditorStore((s) => s.setFeaturedImage);
  const setOgImage = useEditorStore((s) => s.setOgImage);
  const setMetaTitle = useEditorStore((s) => s.setMetaTitle);
  const setMetaDescription = useEditorStore((s) => s.setMetaDescription);

  // Derived: the currently selected block (if any)
  const selectedBlock = React.useMemo(
    () => selectedBlockId ? (document?.blocks ?? []).find((b) => b.id === selectedBlockId) ?? null : null,
    [selectedBlockId, document?.blocks],
  ) as { id: string; type: string; props: Record<string, unknown> } | null;

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [pendingBlog, setPendingBlog] = React.useState<PendingBlog | null>(null);
  const [showBlogPicker, setShowBlogPicker] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const hasContent = (document?.blocks?.length ?? 0) > 0;

  const { data: providerInfo } = trpc.ai.getProvider.useQuery(undefined, { staleTime: 60_000 });

  const chatMutation = trpc.ai.chat.useMutation();
  const buildBlocksMutation = trpc.ai.buildBlocks.useMutation();
  const editDocumentMutation = trpc.ai.editDocument.useMutation();

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  React.useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, [input]);

  const addAiMessage = React.useCallback((content: string, extra?: Partial<ChatMessage>) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-ai`, role: "assistant", content, timestamp: new Date(), ...extra },
    ]);
  }, []);

  // Write blocks progressively (streaming effect) + all metadata directly to the editor
  const writeToEditor = React.useCallback(
    (result: {
      blocks: unknown[];
      title?: string;
      slug?: string;
      excerpt?: string;
      metaTitle?: string;
      metaDescription?: string;
      featuredImage?: string;
      ogImage?: string;
      tags?: string[];
    }) => {
      // Set metadata immediately
      if (result.title) setTitle(result.title);
      if (result.slug) setSlug(result.slug);
      if (result.excerpt) setExcerpt(result.excerpt);
      if (result.metaTitle) setMetaTitle(result.metaTitle);
      if (result.metaDescription) setMetaDescription(result.metaDescription);
      if (result.featuredImage) setFeaturedImage(result.featuredImage);
      if (result.ogImage) setOgImage(result.ogImage);
      // NOTE: AI tags are keyword strings, not DB tag IDs — do NOT set tagIds

      // Stream blocks into editor one by one for visual effect
      const blocks = result.blocks;
      if (!blocks.length) return;

      // Show first block immediately
      setDocument({ version: 1, blocks: [blocks[0]] as never[], metadata: {} });

      // Add remaining blocks with staggered delay
      for (let i = 1; i < blocks.length; i++) {
        const snapshot = blocks.slice(0, i + 1);
        setTimeout(() => {
          setDocument({ version: 1, blocks: snapshot as never[], metadata: {} });
        }, i * 80);
      }
    },
    [setDocument, setTitle, setSlug, setExcerpt, setMetaTitle, setMetaDescription, setFeaturedImage, setOgImage],
  );

  // Apply pending edit blocks (edit flow still keeps review step)
  const applyBlocks = React.useCallback(
    (blocks: unknown[], msgId: string) => {
      setDocument({ version: 1, blocks: blocks as never[], metadata: {} });
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, pendingBlocks: undefined } : m)),
      );
    },
    [setDocument],
  );

  const dismissPending = React.useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, pendingBlocks: undefined } : m)),
    );
  }, []);

  // ── Handle blog type selection ──────────────────────────
  const handleBlogTypeSelected = React.useCallback(
    async (contentType: BlogTypeId) => {
      setShowBlogPicker(false);
      const typeLabel = BLOG_TYPES.find((t) => t.id === contentType)?.label ?? contentType;

      // If we have a pending topic already, write immediately
      if (pendingBlog?.topic) {
        const topic = pendingBlog.topic;
        setPendingBlog(null);

        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-user`, role: "user", content: typeLabel, timestamp: new Date() },
        ]);
        addAiMessage(`Writing your ${typeLabel.toLowerCase()} on "${topic}"… This appears in the editor in a moment.`);
        setIsTyping(true);

        try {
          const result = await buildBlocksMutation.mutateAsync({
            topic,
            contentType,
            projectId: projectId ?? undefined,
          });
          writeToEditor(result);
          addAiMessage(`Done! "${result.title}" is ready in the editor (${result.blocks.length} blocks). SEO meta, excerpt, and tags are filled in too. Want me to adjust anything?`);
        } catch (err) {
          addAiMessage(`Couldn't generate content: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
          setIsTyping(false);
        }
        return;
      }

      // Ask for topic
      setPendingBlog({ contentType });
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}-user`, role: "user", content: typeLabel, timestamp: new Date() },
      ]);
      addAiMessage(`Great! What topic should the ${typeLabel.toLowerCase()} cover? (Optional: mention your target audience or keywords too.)`);
    },
    [pendingBlog, buildBlocksMutation, projectId, writeToEditor, addAiMessage],
  );

  // ── Main send handler ────────────────────────────────────
  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // ── Awaiting topic for pending blog ──────────────────
      if (pendingBlog && !pendingBlog.topic) {
        const { contentType } = pendingBlog;
        const typeLabel = BLOG_TYPES.find((t) => t.id === contentType)?.label ?? contentType;
        setPendingBlog(null);

        addAiMessage(`Writing your ${typeLabel.toLowerCase()} on "${trimmed}"… Watch the editor canvas.`);

        try {
          const result = await buildBlocksMutation.mutateAsync({
            topic: trimmed,
            contentType,
            projectId: projectId ?? undefined,
          });
          writeToEditor(result);
          addAiMessage(`Done! "${result.title}" is live in the editor (${result.blocks.length} blocks). SEO meta, excerpt, and tags set. Want me to tweak anything?`);
        } catch (err) {
          addAiMessage(`Couldn't generate: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
          setIsTyping(false);
        }
        return;
      }

      // ── Write intent: detect type + optional topic ────────
      if (isWriteIntent(trimmed)) {
        const contentType = detectBlogType(trimmed);
        const topic = extractTopic(trimmed);
        const typeLabel = BLOG_TYPES.find((t) => t.id === contentType)?.label ?? contentType;

        if (topic) {
          // Have both type and topic — write immediately
          addAiMessage(`Writing your ${typeLabel.toLowerCase()} on "${topic}"… Watch the editor.`);
          try {
            const result = await buildBlocksMutation.mutateAsync({
              topic,
              contentType: contentType ?? "blog-post",
              projectId: projectId ?? undefined,
            });
            writeToEditor(result);
            addAiMessage(`Done! "${result.title}" is in the editor (${result.blocks.length} blocks). SEO meta, excerpt, and tags filled in. Need any changes?`);
          } catch (err) {
            addAiMessage(`Generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
          } finally {
            setIsTyping(false);
          }
        } else {
          // No clear topic — write immediately using the raw message as hint
          // (so "create a blog" → AI picks a relevant topic)
          addAiMessage(`Got it! Writing a ${typeLabel.toLowerCase()} now… watch the editor.`);
          try {
            const result = await buildBlocksMutation.mutateAsync({
              topic: trimmed, // pass full message; AI will pick a relevant topic from it
              contentType: contentType ?? "blog-post",
              projectId: projectId ?? undefined,
            });
            writeToEditor(result);
            addAiMessage(`Done! "${result.title}" is in the editor (${result.blocks.length} blocks). SEO, excerpt, and tags filled in. Want me to change anything?`);
          } catch (err) {
            addAiMessage(`Generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
          } finally {
            setIsTyping(false);
          }
        }
        return;
      }

      // ── Edit intent: modify selected block OR whole document ──
      if ((isEditIntent(trimmed) || selectedBlock) && hasContent) {
        try {
          if (selectedBlock) {
            // Single-block mode: only edit the focused section
            const result = await editDocumentMutation.mutateAsync({
              instruction: trimmed,
              currentBlocks: [selectedBlock],
              postTitle: title || undefined,
            });

            // Splice the result back into the full document
            const allBlocks = document?.blocks ?? [];
            const idx = allBlocks.findIndex((b) => b.id === selectedBlock.id);
            if (idx !== -1) {
              const updated = [
                ...allBlocks.slice(0, idx),
                ...result.blocks,
                ...allBlocks.slice(idx + 1),
              ];
              const msgId = `msg-${Date.now()}-ai`;
              setMessages((prev) => [
                ...prev,
                {
                  id: msgId,
                  role: "assistant",
                  content: `Prepared changes to the selected section. Apply when ready.`,
                  timestamp: new Date(),
                  pendingBlocks: updated,
                },
              ]);
            }
          } else {
            // Full-document mode
            const result = await editDocumentMutation.mutateAsync({
              instruction: trimmed,
              currentBlocks: document?.blocks ?? [],
              postTitle: title || undefined,
            });

            const msgId = `msg-${Date.now()}-ai`;
            setMessages((prev) => [
              ...prev,
              {
                id: msgId,
                role: "assistant",
                content: `I've prepared changes for your request. Preview and apply when ready.`,
                timestamp: new Date(),
                pendingBlocks: result.blocks,
              },
            ]);
          }
        } catch (err) {
          addAiMessage(`Edit failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
          setIsTyping(false);
        }
        return;
      }

      // ── Regular chat ─────────────────────────────────────
      try {
        const plainContext = (document?.blocks ?? [])
          .map((b) => {
            const p = b.props as Record<string, unknown>;
            return (p.text ?? p.html ?? p.content ?? "") as string;
          })
          .join("\n\n")
          .replace(/<[^>]+>/g, "")
          .slice(0, 2000);

        const result = await chatMutation.mutateAsync({
          message: trimmed,
          context: (title ? `Title: ${title}\n\n` : "") + plainContext || undefined,
          projectId: projectId ?? undefined,
        });
        addAiMessage(result.reply);
      } catch (err) {
        addAiMessage(`Error: ${err instanceof Error ? err.message : "Check your AI settings."}`);
      } finally {
        setIsTyping(false);
      }
    },
    [
      pendingBlog,
      projectId,
      title,
      document,
      hasContent,
      selectedBlock,
      chatMutation,
      buildBlocksMutation,
      editDocumentMutation,
      writeToEditor,
      addAiMessage,
    ],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  // Show blog picker (replaces messages temporarily)
  const triggerBlogPicker = React.useCallback(() => {
    setPendingBlog(null);
    setShowBlogPicker(true);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l1.8 3.6L14 6.4l-3 2.6.7 4L8 11.2 4.3 13l.7-4-3-2.6 4.2-.8L8 2z" stroke="#39FF14" strokeWidth="1.2" strokeLinejoin="round" fill="#39FF14" fillOpacity="0.15" />
          </svg>
          <span className="text-sm font-medium text-white">AI Editor</span>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            {providerInfo?.label ?? "AI"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {pendingBlog && (
            <button
              type="button"
              onClick={() => { setPendingBlog(null); setShowBlogPicker(false); }}
              className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
            >
              Cancel
            </button>
          )}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => { setMessages([]); setPendingBlog(null); setShowBlogPicker(false); }}
              className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Selected section banner */}
      {selectedBlock && !showBlogPicker && (
        <div className="pt-2">
          <SelectedSectionBanner block={selectedBlock} onClear={() => selectBlock(null)} />
        </div>
      )}

      {/* Messages / Blog picker */}
      <div className="flex-1 overflow-y-auto">
        {showBlogPicker ? (
          <BlogTypePicker onSelect={(type) => void handleBlogTypeSelected(type)} />
        ) : messages.length === 0 ? (
          <EmptyState hasContent={hasContent} />
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onApply={(blocks) => applyBlocks(blocks, msg.id)}
                onDismiss={dismissPending}
              />
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-gray-900">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="border-t border-gray-800/50 px-3 pt-3">
        <div className="flex flex-wrap gap-1">
          {/* New post button → opens blog type picker */}
          <button
            type="button"
            onClick={triggerBlogPicker}
            disabled={isTyping}
            className="rounded-full border border-[#39FF14]/20 bg-[#39FF14]/5 px-2.5 py-1 text-[11px] text-[#39FF14]/70 transition-colors hover:border-[#39FF14]/40 hover:bg-[#39FF14]/10 hover:text-[#39FF14] disabled:opacity-40"
          >
            ✨ New post
          </button>

          {/* Edit quick actions (only meaningful when there's content) */}
          {hasContent &&
            EDIT_QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => { setInput(action.label); textareaRef.current?.focus(); }}
                disabled={isTyping}
                className="rounded-full border border-gray-800 bg-gray-950 px-2.5 py-1 text-[11px] text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-800 hover:text-gray-300 disabled:opacity-40"
              >
                {action.icon} {action.label}
              </button>
            ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-800/50 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-gray-800 bg-gray-950 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingBlog
                ? `Topic for your ${BLOG_TYPES.find((t) => t.id === pendingBlog.contentType)?.label ?? "post"}…`
                : selectedBlock
                ? `Edit this ${selectedBlock.type} block — add image, rewrite, expand…`
                : hasContent
                ? "Improve writing, add a section, SEO optimize…"
                : "Describe what you want to write…"
            }
            rows={1}
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1 text-[13px] text-gray-300 placeholder:text-gray-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#39FF14] text-black transition-opacity disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L7 9M14 2l-4.5 12-2-5.5L2 6.5 14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-600">
          {pendingBlog
            ? "AI writes directly into the editor canvas"
            : hasContent
            ? "Edit commands apply instantly to the canvas"
            : "AI writes content directly into the editor"}
        </p>
      </div>
    </div>
  );
}
