import type { AIConfig } from "./types";

const DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-20250514",
  google: "gemini-2.0-flash",
};

const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const MAX_RETRIES = 3;
const BASE_TIMEOUT_MS = 60_000;
const LONG_FORM_TIMEOUT_MS = 120_000;
const RETRY_BASE_DELAY_MS = 1_000;

export interface LLMRequest {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  /** Use a longer timeout for long-form content generation */
  longForm?: boolean;
}

export interface LLMResponse {
  content: string;
  usage: { inputTokens: number; outputTokens: number };
}

class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export class AIProviderClient {
  private readonly config: AIConfig;
  private readonly model: string;

  constructor(config: AIConfig) {
    this.config = config;
    this.model = config.model ?? DEFAULT_MODELS[config.provider] ?? "gpt-4o";
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(() => {
      switch (this.config.provider) {
        case "openai":
          return this.openaiComplete(request);
        case "anthropic":
          return this.anthropicComplete(request);
        case "google":
          return this.googleComplete(request);
        default:
          throw new AIProviderError(
            `Unsupported provider: ${this.config.provider}`,
            this.config.provider,
          );
      }
    }, request.longForm);
  }

  async *stream(request: LLMRequest): AsyncGenerator<string> {
    switch (this.config.provider) {
      case "openai":
        yield* this.openaiStream(request);
        break;
      case "anthropic":
        yield* this.anthropicStream(request);
        break;
      case "google":
        yield* this.googleStream(request);
        break;
      default:
        throw new AIProviderError(
          `Unsupported provider: ${this.config.provider}`,
          this.config.provider,
        );
    }
  }

  // ---------------------------------------------------------------------------
  // OpenAI
  // ---------------------------------------------------------------------------

  private async openaiComplete(request: LLMRequest): Promise<LLMResponse> {
    const messages = [
      { role: "system" as const, content: request.system },
      ...request.messages,
    ];

    const body = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
    };

    const response = await this.fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    if (!data.choices?.[0]?.message?.content) {
      throw new AIProviderError(
        "Empty response from OpenAI",
        "openai",
        response.status,
        true,
      );
    }

    return {
      content: data.choices[0].message.content,
      usage: {
        inputTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
      },
    };
  }

  private async *openaiStream(request: LLMRequest): AsyncGenerator<string> {
    const messages = [
      { role: "system" as const, content: request.system },
      ...request.messages,
    ];

    const body = {
      model: this.model,
      messages,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
      stream: true,
    };

    const response = await this.fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    yield* this.parseSSEStream(response, (event: string) => {
      if (event === "[DONE]") return null;
      try {
        const parsed = JSON.parse(event) as {
          choices: { delta: { content?: string } }[];
        };
        return parsed.choices?.[0]?.delta?.content ?? null;
      } catch {
        return null;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Anthropic
  // ---------------------------------------------------------------------------

  private async anthropicComplete(request: LLMRequest): Promise<LLMResponse> {
    const body = {
      model: this.model,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
      system: request.system,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    const response = await this.fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    const data = (await response.json()) as {
      content: { type: string; text: string }[];
      usage?: { input_tokens: number; output_tokens: number };
    };

    const textBlock = data.content?.find((b) => b.type === "text");
    if (!textBlock?.text) {
      throw new AIProviderError(
        "Empty response from Anthropic",
        "anthropic",
        response.status,
        true,
      );
    }

    return {
      content: textBlock.text,
      usage: {
        inputTokens: data.usage?.input_tokens ?? 0,
        outputTokens: data.usage?.output_tokens ?? 0,
      },
    };
  }

  private async *anthropicStream(request: LLMRequest): AsyncGenerator<string> {
    const body = {
      model: this.model,
      max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
      system: request.system,
      messages: request.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    };

    const response = await this.fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    yield* this.parseSSEStream(response, (event: string) => {
      try {
        const parsed = JSON.parse(event) as {
          type: string;
          delta?: { type: string; text?: string };
        };
        if (parsed.type === "content_block_delta" && parsed.delta?.text) {
          return parsed.delta.text;
        }
        return null;
      } catch {
        return null;
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Google (Gemini)
  // ---------------------------------------------------------------------------

  private async googleComplete(request: LLMRequest): Promise<LLMResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.config.apiKey}`;

    const contents = this.buildGoogleContents(request);

    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: request.system }],
      },
      generationConfig: {
        maxOutputTokens:
          request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature:
          request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
      },
    };

    const response = await this.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    const data = (await response.json()) as {
      candidates?: { content: { parts: { text: string }[] } }[];
      usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
      };
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new AIProviderError(
        "Empty response from Google AI",
        "google",
        response.status,
        true,
      );
    }

    return {
      content: text,
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  private async *googleStream(request: LLMRequest): AsyncGenerator<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.config.apiKey}`;

    const contents = this.buildGoogleContents(request);

    const body = {
      contents,
      systemInstruction: {
        parts: [{ text: request.system }],
      },
      generationConfig: {
        maxOutputTokens:
          request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature:
          request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
      },
    };

    const response = await this.fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeoutMs: request.longForm ? LONG_FORM_TIMEOUT_MS : BASE_TIMEOUT_MS,
    });

    yield* this.parseSSEStream(response, (event: string) => {
      try {
        const parsed = JSON.parse(event) as {
          candidates?: { content: { parts: { text: string }[] } }[];
        };
        return parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
      } catch {
        return null;
      }
    });
  }

  private buildGoogleContents(
    request: LLMRequest,
  ): { role: string; parts: { text: string }[] }[] {
    return request.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  }

  // ---------------------------------------------------------------------------
  // Shared utilities
  // ---------------------------------------------------------------------------

  private async fetch(
    url: string,
    init: RequestInit & { timeoutMs: number },
  ): Promise<Response> {
    const { timeoutMs, ...fetchInit } = init;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await globalThis.fetch(url, {
        ...fetchInit,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "unknown error");
        const retryable = response.status >= 500 || response.status === 429;
        throw new AIProviderError(
          `API request failed (${response.status}): ${errorBody}`,
          this.config.provider,
          response.status,
          retryable,
        );
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async withRetry(
    fn: () => Promise<LLMResponse>,
    longForm?: boolean,
  ): Promise<LLMResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof AIProviderError && !error.retryable) {
          throw error;
        }

        if (attempt < MAX_RETRIES - 1) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          const jitter = Math.random() * delay * 0.1;
          await this.sleep(delay + jitter);
        }
      }
    }

    throw lastError ?? new Error("All retries exhausted");
  }

  private async *parseSSEStream(
    response: Response,
    extractContent: (event: string) => string | null,
  ): AsyncGenerator<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new AIProviderError(
        "No response body for streaming",
        this.config.provider,
      );
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const data = trimmed.slice(6);
          if (data === "[DONE]") return;

          const content = extractContent(data);
          if (content) yield content;
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data !== "[DONE]") {
            const content = extractContent(data);
            if (content) yield content;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
