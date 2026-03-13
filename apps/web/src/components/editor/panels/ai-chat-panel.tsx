"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useEditorStore } from "@/stores/editor-store";

// ─── Types ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isCreatingPost?: boolean;
  pendingBlocks?: unknown[];
}

// ─── Intent Detection ────────────────────────────────────
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

function isCreatePostIntent(msg: string): boolean {
  const lower = msg.toLowerCase();
  return (
    (lower.includes("create") || lower.includes("write") || lower.includes("generate") || lower.includes("make")) &&
    (lower.includes("post") || lower.includes("article") || lower.includes("blog"))
  );
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
      <div className={`max-w-[85%] ${isUser ? "" : "w-full"}`}>
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
              <span className="text-[10px] font-medium text-[#39FF14]/60">AI Assistant</span>
            </div>
          )}
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
          <p className={`mt-1 text-[10px] ${isUser ? "text-gray-500" : "text-gray-600"}`}>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Apply/Dismiss for pending edit blocks */}
        {message.pendingBlocks && message.pendingBlocks.length > 0 && (
          <div className="mt-1.5 flex gap-2">
            <button
              onClick={() => onApply?.(message.pendingBlocks!)}
              className="flex-1 rounded-lg bg-[#39FF14]/10 px-3 py-1.5 text-[11px] font-semibold text-[#39FF14] transition-colors hover:bg-[#39FF14]/20"
            >
              ✓ Apply changes
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
      <h3 className="mt-4 text-sm font-medium text-gray-300">AI Editor Assistant</h3>
      <p className="mt-1 text-center text-[11px] leading-relaxed text-gray-600">
        {hasContent
          ? 'Say "improve writing", "add a callout", "make shorter", or ask any question about your post.'
          : 'Start with "write an introduction" or "generate an outline" to build your post.'}
      </p>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Improve writing", icon: "✨" },
  { label: "Make shorter", icon: "✂" },
  { label: "Add a callout tip", icon: "💡" },
  { label: "Add a quote", icon: "❝" },
  { label: "Add an image", icon: "🖼" },
  { label: "SEO optimize", icon: "📈" },
  { label: "Fix grammar", icon: "✓" },
  { label: "Generate outline", icon: "📋" },
];

// ─── AI Chat Panel ───────────────────────────────────────
export function AiChatPanel() {
  const router = useRouter();
  const projectId = useEditorStore((s) => s.projectId);
  const title = useEditorStore((s) => s.title);
  const document = useEditorStore((s) => s.document);
  const setDocument = useEditorStore((s) => s.setDocument);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const hasContent = (document?.blocks?.length ?? 0) > 0;

  const { data: providerInfo } = trpc.ai.getProvider.useQuery(undefined, { staleTime: 60_000 });

  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation();
  const createPostMutation = trpc.ai.createPost.useMutation();
  const editDocumentMutation = trpc.ai.editDocument.useMutation();

  // Auto-scroll
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  React.useEffect(() => {
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`; }
  }, [input]);

  // Apply pending blocks to the editor
  const applyBlocks = React.useCallback(
    (blocks: unknown[], msgId: string) => {
      setDocument({ version: 1, blocks: blocks as never[], metadata: {} });
      // Remove the apply buttons after applying
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

  const sendMessage = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // ── Create-post intent ─────────────────────────────
      if (projectId && isCreatePostIntent(trimmed)) {
        try {
          const result = await createPostMutation.mutateAsync({ projectId });
          const aiMsg: ChatMessage = {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: `✅ Done! Generated:\n\n**${result.title}**\n\nOpening editor…`,
            timestamp: new Date(),
            isCreatingPost: true,
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
          setTimeout(() => router.push(`/posts/${result.slug}/edit`), 1500);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-ai`,
              role: "assistant",
              content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        }
        return;
      }

      // ── Edit intent: modify blocks in real-time ────────
      if (isEditIntent(trimmed) && (document?.blocks?.length ?? 0) > 0) {
        try {
          const result = await editDocumentMutation.mutateAsync({
            instruction: trimmed,
            currentBlocks: document?.blocks ?? [],
            postTitle: title || undefined,
          });

          const msgId = `msg-${Date.now()}-ai`;
          const aiMsg: ChatMessage = {
            id: msgId,
            role: "assistant",
            content: `I've prepared the changes for "${trimmed}". Preview them and click Apply to update your post.`,
            timestamp: new Date(),
            pendingBlocks: result.blocks,
          };
          setMessages((prev) => [...prev, aiMsg]);
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-ai`,
              role: "assistant",
              content: `Couldn't edit: ${err instanceof Error ? err.message : "Unknown error"}`,
              timestamp: new Date(),
            },
          ]);
        } finally {
          setIsTyping(false);
        }
        return;
      }

      // ── Regular chat ───────────────────────────────────
      try {
        const plainContext = (document?.blocks ?? [])
          .map((b) => {
            const p = b.props as Record<string, unknown>;
            return (p.text ?? p.html ?? p.content ?? "") as string;
          })
          .join("\n\n")
          .replace(/<[^>]+>/g, "")
          .slice(0, 3000);

        const result = await chatMutation.mutateAsync({
          message: trimmed,
          context: (title ? `Title: ${title}\n\n` : "") + plainContext || undefined,
          projectId: projectId ?? undefined,
        });
        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-ai`, role: "assistant", content: result.reply, timestamp: new Date() },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-ai`,
            role: "assistant",
            content: `Error: ${err instanceof Error ? err.message : "Check your AI settings."}`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [projectId, title, document, chatMutation, createPostMutation, editDocumentMutation, router],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); }
    },
    [input, sendMessage],
  );

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
        {messages.length > 0 && (
          <button type="button" onClick={() => setMessages([])} className="text-[11px] text-gray-500 transition-colors hover:text-gray-300">
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
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
                <div className="rounded-xl bg-gray-900"><TypingIndicator /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="border-t border-gray-800/50 px-3 pt-3">
        <div className="flex flex-wrap gap-1">
          {projectId && (
            <button
              type="button"
              onClick={() => void sendMessage("create a new blog post")}
              disabled={isTyping}
              className="rounded-full border border-[#39FF14]/20 bg-[#39FF14]/5 px-2.5 py-1 text-[11px] text-[#39FF14]/70 transition-colors hover:border-[#39FF14]/40 hover:bg-[#39FF14]/10 hover:text-[#39FF14] disabled:opacity-40"
            >
              ✨ New post
            </button>
          )}
          {QUICK_ACTIONS.map((action) => (
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
            placeholder={hasContent ? 'Say "improve writing", "add a callout"…' : "Ask anything about your post…"}
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
          {hasContent ? "Editing commands apply to your current blocks" : "Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
}
