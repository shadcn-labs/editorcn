import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "You are a writing assistant inside a rich text editor. Follow the user's instruction about the provided text. Respond with plain text only, no markdown fences and no explanations.";

interface AiRouteBody {
  apiKey?: string;
  model?: string;
  prompt?: string;
  context?: string;
}

export const POST = async (request: Request) => {
  const {
    apiKey,
    model = "gpt-4o-mini",
    prompt,
    context,
  } = (await request.json()) as AiRouteBody;

  // BYOK first, server env as fallback.
  const key = apiKey?.trim() || process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Missing OpenAI API key." },
      { status: 400 }
    );
  }
  if (!prompt || prompt.trim() === "") {
    return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
  }

  try {
    const openai = createOpenAI({ apiKey: key });
    const { text } = await generateText({
      model: openai(model),
      prompt:
        context && context.trim().length > 0
          ? `Text:\n${context}\n\nInstruction:\n${prompt.trim()}`
          : prompt.trim(),
      system: SYSTEM_PROMPT,
    });
    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed." },
      { status: 500 }
    );
  }
};
