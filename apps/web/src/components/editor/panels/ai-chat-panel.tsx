"use client";

import * as React from "react";

// ─── Types ──────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Quick Actions ──────────────────────────────────────
const QUICK_ACTIONS = [
  "Improve writing",
  "Fix grammar",
  "Make shorter",
  "Add SEO keywords",
  "Generate outline",
  "Suggest title",
];

// ─── Typing Indicator ───────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex gap-1">
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

// ─── Message Bubble ─────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
          isUser
            ? "bg-gray-800 text-gray-200"
            : "bg-gray-900 text-gray-300"
        }`}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 1l1.2 2.4L10 4l-2 2 .5 3L6 7.9 3.5 9l.5-3-2-2 2.8-.6L6 1z"
                fill="#39FF14"
                fillOpacity="0.6"
              />
            </svg>
            <span className="text-[10px] font-medium text-[#39FF14]/60">
              AI Assistant
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed">
          {message.content}
        </p>
        <p
          className={`mt-1 text-[10px] ${
            isUser ? "text-gray-500" : "text-gray-600"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            d="M14 3l2.5 5 5.5 1.5-4 3.5 1 5.5L14 15.5 9 18.5l1-5.5-4-3.5L11.5 8 14 3z"
            stroke="#39FF14"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="#39FF14"
            fillOpacity="0.1"
          />
          <path
            d="M6 22l1.5-3M22 22l-1.5-3M4 14h2M22 14h2"
            stroke="#39FF14"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-medium text-gray-300">
        How can I help with your post?
      </h3>
      <p className="mt-1 text-center text-[11px] leading-relaxed text-gray-600">
        Ask me to improve writing, generate ideas, fix grammar, or help with
        SEO optimization.
      </p>
    </div>
  );
}

// ─── AI Chat Panel ──────────────────────────────────────
export function AiChatPanel() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [input]);

  const sendMessage = React.useCallback(
    (text: string) => {
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

      // Simulate AI response after a delay
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: getSimulatedResponse(trimmed),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 1500);
    },
    [],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  const handleQuickAction = React.useCallback((action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  }, []);

  const clearChat = React.useCallback(() => {
    setMessages([]);
    setIsTyping(false);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2l1.8 3.6L14 6.4l-3 2.6.7 4L8 11.2 4.3 13l.7-4-3-2.6 4.2-.8L8 2z"
              stroke="#39FF14"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="#39FF14"
              fillOpacity="0.15"
            />
          </svg>
          <span className="text-sm font-medium text-white">AI Assistant</span>
          <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            GPT-4
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-[11px] text-gray-500 transition-colors hover:text-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
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
      <div className="border-t border-gray-800/50 px-4 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => handleQuickAction(action)}
              className="rounded-full border border-gray-800 bg-gray-950 px-2.5 py-1 text-[11px] text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-800 hover:text-gray-300"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-gray-800/50 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-gray-800 bg-gray-950 p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your post..."
            rows={1}
            className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1 text-[13px] text-gray-300 placeholder:text-gray-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#39FF14] text-black transition-opacity disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M14 2L7 9M14 2l-4.5 12-2-5.5L2 6.5 14 2z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-gray-600">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── Simulated AI Responses ─────────────────────────────
function getSimulatedResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("improve") || lower.includes("writing")) {
    return "I can help improve your writing. Select the text block you'd like me to enhance, and I'll suggest revisions for clarity, flow, and engagement. Would you like me to focus on a specific section?";
  }
  if (lower.includes("grammar") || lower.includes("fix")) {
    return "I'll scan your post for grammar issues. Common things I check for include subject-verb agreement, punctuation, sentence fragments, and word choice. Paste the text you'd like me to review.";
  }
  if (lower.includes("shorter") || lower.includes("concise")) {
    return "I'll help make your content more concise. I can typically reduce word count by 20-30% while preserving the key message. Which section would you like me to tighten up?";
  }
  if (lower.includes("seo") || lower.includes("keyword")) {
    return "For SEO optimization, I'd recommend:\n\n1. Include your primary keyword in the first paragraph\n2. Use related keywords naturally throughout\n3. Add descriptive alt text to images\n4. Ensure your meta description includes the target keyword\n\nWhat topic is your post about?";
  }
  if (lower.includes("outline") || lower.includes("generate")) {
    return "Here's a suggested outline structure:\n\n1. Hook / Introduction\n2. Problem Statement\n3. Main Solution (2-3 key points)\n4. Supporting Evidence\n5. Practical Tips / Takeaways\n6. Conclusion with CTA\n\nWould you like me to flesh out any of these sections?";
  }
  if (lower.includes("title") || lower.includes("suggest")) {
    return "Here are some title suggestions:\n\n1. A clear, benefit-driven title\n2. A question-based title to spark curiosity\n3. A how-to format for actionable content\n4. A numbered list for scannable posts\n\nTell me your post's main topic and I'll generate specific titles.";
  }

  return "I understand your request. As an AI writing assistant, I can help with improving content, fixing grammar, optimizing for SEO, generating outlines, and suggesting titles. What specific aspect of your post would you like to work on?";
}
