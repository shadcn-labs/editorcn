import type { AiPreset, AiRequest } from "./types";

/**
 * Framework-free helpers. Import them in your API route to turn an AiRequest
 * into model input, for example:
 *
 *   streamText({ model, system: AI_SYSTEM_PROMPT, prompt: buildAiPrompt(request) })
 */

export const AI_SYSTEM_PROMPT = [
  "You are a writing assistant inside a rich text editor.",
  "Reply with Markdown only: the exact content to put in the document.",
  "Do not add a preamble, an explanation, or code fences around the whole reply.",
  "Match the language and tone of the document unless asked otherwise.",
].join(" ");

export const buildAiPrompt = (request: AiRequest) => {
  const { after, before, mode, prompt, selection } = request;
  const marker = selection
    ? `<selection>\n${selection}\n</selection>`
    : "<cursor/>";
  const task =
    mode === "replace"
      ? "Return only the content that replaces <selection>."
      : `Return only the new content to insert at ${selection ? "the end of <selection>" : "<cursor/>"}.`;
  return [
    `<document>\n${before}${marker}${after}\n</document>`,
    `Instruction: ${prompt}`,
    task,
  ].join("\n\n");
};

export const DEFAULT_AI_PRESETS: AiPreset[] = [
  {
    group: "Edit",
    id: "improve",
    label: "Improve writing",
    mode: "replace",
    prompt: "Improve the writing. Keep the meaning, fix awkward phrasing.",
  },
  {
    group: "Edit",
    id: "fix-spelling",
    label: "Fix spelling & grammar",
    mode: "replace",
    prompt:
      "Fix spelling and grammar mistakes. Keep the wording and meaning otherwise unchanged.",
  },
  {
    group: "Edit",
    id: "shorter",
    label: "Make shorter",
    mode: "replace",
    prompt: "Make the text more concise. Remove filler words and redundancy.",
  },
  {
    group: "Edit",
    id: "longer",
    label: "Make longer",
    mode: "replace",
    prompt: "Expand the text with more detail while keeping the same tone.",
  },
  {
    group: "Edit",
    id: "simplify",
    label: "Simplify language",
    mode: "replace",
    prompt: "Rewrite the text in simpler, plain language.",
  },
  {
    group: "Write",
    id: "continue",
    label: "Continue writing",
    mode: "insert",
    prompt: "Continue writing from where the text leaves off.",
  },
  {
    group: "Write",
    id: "summarize",
    label: "Summarize",
    mode: "insert",
    prompt: "Write a short summary of the text.",
  },
  {
    group: "Write",
    id: "action-items",
    label: "Find action items",
    mode: "insert",
    prompt: "List the action items in the text as a task checklist.",
  },
];
