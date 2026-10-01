"use client";

import type { Editor } from "@tiptap/core";
import { Sparkles } from "lucide-react";
import { useCallback, useState } from "react";

import { useToolbarEditor } from "../core/context";
import { useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";
import { generateAiText } from "./client";

export interface AiLabels {
  /** Tooltip / aria-label for the toolbar button. */
  title: string;
  /** Placeholder of the prompt input. */
  placeholder: string;
  /** Label of the submit button. */
  submit: string;
  /** Hint shown when no API key was provided. */
  missingKey: string;
}

export const DEFAULT_AI_LABELS: AiLabels = {
  missingKey: "Add your OpenAI API key to use AI.",
  placeholder: "Ask AI anything…",
  submit: "Generate",
  title: "Ask AI",
};

export interface AiToolbarProps extends ToolbarComponentProps {
  /** OpenAI API key (BYOK). */
  apiKey?: string;
  /** OpenAI model id. Defaults to `gpt-4o-mini`. */
  model?: string;
  /**
   * Optional proxy endpoint (e.g. `/api/ai`). Required for OpenAI, whose API
   * sends no CORS headers and rejects direct browser calls.
   */
  endpoint?: string;
  labels?: Partial<AiLabels>;
}

export const AiToolbar = ({
  className,
  editor: editorProp,
  apiKey,
  model,
  endpoint,
  labels: labelOverrides,
}: AiToolbarProps) => {
  const editor = useToolbarEditor(editorProp);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const text: AiLabels = { ...DEFAULT_AI_LABELS, ...labelOverrides };

  const disabled =
    useEditorState(
      editor,
      (edit) => edit.isDestroyed || !apiKey,
      (a, b) => a === b
    ) ?? true;

  const insertResult = useCallback((edit: Editor, result: string) => {
    const { from, to } = edit.state.selection;
    if (from === to) {
      edit.chain().focus().insertContentAt(from, result).run();
    } else {
      edit
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, result)
        .run();
    }
  }, []);

  const onSubmit = useCallback(async () => {
    if (
      !editor ||
      editor.isDestroyed ||
      !apiKey ||
      prompt.trim() === "" ||
      pending
    ) {
      return;
    }
    setPending(true);
    setRequestError(null);
    try {
      const { from, to } = editor.state.selection;
      const context =
        from === to ? undefined : editor.state.doc.textBetween(from, to, " ");
      const result = await generateAiText({
        apiKey,
        context,
        endpoint,
        model,
        prompt: prompt.trim(),
      });
      insertResult(editor, result);
      setPrompt("");
      setOpen(false);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "AI request failed."
      );
    } finally {
      setPending(false);
    }
  }, [apiKey, editor, endpoint, insertResult, model, pending, prompt]);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      sideOffset={6}
      trigger={
        <Button
          aria-label={apiKey ? text.title : text.missingKey}
          className={["ext-btn--icon-sm", className].filter(Boolean).join(" ")}
          disabled={disabled}
          title={apiKey ? text.title : text.missingKey}
        >
          <Sparkles />
        </Button>
      }
    >
      <PopoverContent className="ext-ai-popover">
        <form
          className="ext-ai-form"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <Input
            autoFocus
            className="ext-ai-input"
            disabled={pending}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={text.placeholder}
            value={prompt}
          />
          <Button
            className="ext-ai-submit"
            disabled={pending || prompt.trim() === ""}
            type="submit"
          >
            {pending ? "…" : text.submit}
          </Button>
        </form>
        {requestError ? <p className="ext-ai-error">{requestError}</p> : null}
      </PopoverContent>
    </Popover>
  );
};
