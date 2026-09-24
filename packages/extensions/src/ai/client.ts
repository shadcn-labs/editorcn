import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

export interface AiGenerateOptions {
  /** OpenAI API key. */
  apiKey: string;
  /** OpenAI model id. Defaults to `gpt-4o-mini`. */
  model?: string;
  /** The user's free-prompt instruction. */
  prompt: string;
  /** Optional context, e.g. the current editor selection. */
  context?: string;
  /**
   * Where to send the request. Defaults to OpenAI directly, which browsers
   * block via CORS — pass your own server route (e.g. `/api/ai`) to proxy it.
   * Accepts an absolute URL or a same-origin path.
   */
  endpoint?: string;
}

const DEFAULT_MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT =
  "You are a writing assistant inside a rich text editor. Follow the user's instruction about the provided text. Respond with plain text only, no markdown fences and no explanations.";

export const generateAiText = async ({
  apiKey,
  model = DEFAULT_MODEL,
  prompt,
  context,
  endpoint,
}: AiGenerateOptions): Promise<string> => {
  // Same-origin endpoints dodge OpenAI's missing CORS headers entirely.
  if (endpoint) {
    const response = await fetch(endpoint, {
      body: JSON.stringify({ apiKey, context, model, prompt }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(data?.error || `AI request failed (${response.status}).`);
    }
    const data = (await response.json()) as { text?: string };
    if (!data.text) {
      throw new Error("AI request returned no text.");
    }
    return data.text.trim();
  }
  // Direct browser → OpenAI call. Works only where the endpoint allows CORS.
  const openai = createOpenAI({ apiKey });
  const { text } = await generateText({
    model: openai(model),
    prompt:
      context && context.trim().length > 0
        ? `Text:\n${context}\n\nInstruction:\n${prompt}`
        : prompt,
    system: SYSTEM_PROMPT,
  });
  return text.trim();
};

export { DEFAULT_MODEL };
