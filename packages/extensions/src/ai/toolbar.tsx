"use client";

import type { Editor } from "@tiptap/core";
import {
  ArrowUp,
  CheckCheck,
  ChevronUp,
  CircleHelp,
  FileText,
  ListChecks,
  LoaderCircle,
  Shrink,
  Sparkles,
  TextQuote,
  TextSelect,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";

import { useToolbarEditor } from "../core/context";
import { shallowEqual, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";
import { Separator } from "../ui/separator";

export interface AiLabels {
  placeholder: string;
  submit: string;
  selection: string;
  document: string;
  tasks: string;
}

export const DEFAULT_AI_LABELS: AiLabels = {
  document: "Whole document",
  placeholder: "Ask AI anything…",
  selection: "Selection",
  submit: "Generate",
  tasks: "Tasks",
};

export interface AiTask {
  id: string;
  label: string;
  group: string;
  prompt: string;
  apply: "replace" | "append";
  icon?: ReactNode;
}

export const DEFAULT_AI_TASKS: AiTask[] = [
  {
    apply: "replace",
    group: "Edit",
    icon: <CheckCheck />,
    id: "fix-spelling",
    label: "Fix Spelling",
    prompt:
      "Fix spelling and grammar mistakes. Keep the wording and meaning otherwise unchanged.",
  },
  {
    apply: "replace",
    group: "Edit",
    icon: <Shrink />,
    id: "tighten",
    label: "Tighten Wording",
    prompt: "Make the text more concise. Remove filler words and redundancy.",
  },
  {
    apply: "append",
    group: "Add",
    icon: <TextQuote />,
    id: "summary",
    label: "Write Summary",
    prompt: "Write a short summary of the text.",
  },
  {
    apply: "append",
    group: "Add",
    icon: <ListChecks />,
    id: "checklist",
    label: "Add Checklist",
    prompt: "Turn the action items in the text into a checklist.",
  },
  {
    apply: "append",
    group: "Review",
    icon: <CircleHelp />,
    id: "open-questions",
    label: "Open Questions",
    prompt: "List the open questions and unresolved decisions in the text.",
  },
  {
    apply: "append",
    group: "Review",
    icon: <Users />,
    id: "owners",
    label: "List Owners",
    prompt: "List the people mentioned as owners and what each one owns.",
  },
];

export interface AiGenerateInput {
  prompt: string;
  context: string;
  scope: "selection" | "document";
  task?: string;
}

export interface AiPromptBarProps extends ToolbarComponentProps {
  onGenerate: (input: AiGenerateInput) => Promise<string>;
  tasks?: AiTask[];
  disabled?: boolean;
  labels?: Partial<AiLabels>;
}

const HTML_TAG = /<[a-z][\s\S]*>/i;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const toContent = (result: string) => {
  if (HTML_TAG.test(result) || !result.includes("\n")) {
    return result;
  }
  return result
    .split(/\n+/)
    .filter((line) => line.trim() !== "")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
};

const groupTasks = (tasks: AiTask[]) => {
  const groups = new Map<string, AiTask[]>();
  for (const task of tasks) {
    groups.set(task.group, [...(groups.get(task.group) ?? []), task]);
  }
  return [...groups];
};

const targetRange = (
  editor: Editor,
  from: number,
  to: number,
  task?: AiTask
) => {
  const { size } = editor.state.doc.content;
  if (!task) {
    return { from: Math.min(from, size), to: Math.min(to, size) };
  }
  const hasSelection = from !== to;
  if (task.apply === "replace") {
    return hasSelection
      ? { from: Math.min(from, size), to: Math.min(to, size) }
      : { from: 0, to: size };
  }
  const at = hasSelection ? Math.min(to, size) : size;
  return { from: at, to: at };
};

export const AiPromptBar = ({
  className,
  editor: editorProp,
  onGenerate,
  tasks = DEFAULT_AI_TASKS,
  disabled: disabledProp = false,
  labels: labelOverrides,
}: AiPromptBarProps) => {
  const editor = useToolbarEditor(editorProp);
  const [prompt, setPrompt] = useState("");
  const [pending, setPending] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const text: AiLabels = { ...DEFAULT_AI_LABELS, ...labelOverrides };

  const state = useEditorState(
    editor,
    (edit) => ({
      destroyed: edit.isDestroyed,
      selectionWords: edit.state.selection.empty
        ? 0
        : edit.state.doc
            .textBetween(
              edit.state.selection.from,
              edit.state.selection.to,
              " "
            )
            .split(/\s+/)
            .filter(Boolean).length,
    }),
    shallowEqual
  );

  const disabled = disabledProp || !editor || (state?.destroyed ?? true);
  const hasSelection = (state?.selectionWords ?? 0) > 0;

  const run = useCallback(
    async (instruction: string, task?: AiTask) => {
      if (!editor || editor.isDestroyed || disabledProp || pending) {
        return;
      }
      setPending(true);
      setRequestError(null);
      try {
        const { from, to } = editor.state.selection;
        const { doc } = editor.state;
        const scope = from === to ? "document" : "selection";
        const context =
          scope === "document"
            ? doc.textBetween(0, doc.content.size, "\n")
            : doc.textBetween(from, to, "\n");
        const result = await onGenerate({
          context,
          prompt: instruction,
          scope,
          task: task?.id,
        });
        if (editor.isDestroyed) {
          return;
        }
        editor
          .chain()
          .focus()
          .insertContentAt(
            targetRange(editor, from, to, task),
            toContent(result)
          )
          .run();
        if (!task) {
          setPrompt("");
        }
      } catch (error) {
        setRequestError(
          error instanceof Error ? error.message : "AI request failed."
        );
      } finally {
        setPending(false);
      }
    },
    [disabledProp, editor, onGenerate, pending]
  );

  return (
    <div className={["ext-ai-bar", className].filter(Boolean).join(" ")}>
      <form
        className="ext-ai-panel"
        data-disabled={disabled ? "" : undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (prompt.trim() !== "") {
            void run(prompt.trim());
          }
        }}
      >
        <div className="ext-ai-context">
          {tasks.length > 0 ? (
            <Popover
              open={tasksOpen}
              onOpenChange={setTasksOpen}
              side="top"
              align="start"
              sideOffset={8}
              trigger={
                <button
                  className="ext-ai-tasks-trigger"
                  disabled={disabled || pending}
                  type="button"
                >
                  {text.tasks}
                  <ChevronUp />
                </button>
              }
            >
              <PopoverContent className="ext-ai-tasks" role="menu">
                {groupTasks(tasks).map(([group, items], index) => (
                  <div key={group}>
                    {index > 0 ? <Separator /> : null}
                    <p className="ext-ai-tasks-label">{group}</p>
                    {items.map((task) => (
                      <DropdownMenuItem
                        key={task.id}
                        onClick={() => {
                          setTasksOpen(false);
                          void run(task.prompt, task);
                        }}
                      >
                        {task.icon}
                        {task.label}
                      </DropdownMenuItem>
                    ))}
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          ) : null}
          <span className="ext-ai-chip">
            {hasSelection ? <TextSelect /> : <FileText />}
            {hasSelection
              ? `${text.selection} · ${state?.selectionWords}`
              : text.document}
          </span>
        </div>
        <div className="ext-ai-row">
          <Sparkles className="ext-ai-icon" aria-hidden="true" />
          <input
            aria-label={text.placeholder}
            className="ext-ai-input"
            disabled={disabled || pending}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={text.placeholder}
            value={prompt}
          />
          <button
            aria-label={text.submit}
            className="ext-ai-submit"
            disabled={disabled || pending || prompt.trim() === ""}
            title={text.submit}
            type="submit"
          >
            {pending ? <LoaderCircle className="ext-ai-spin" /> : <ArrowUp />}
          </button>
        </div>
      </form>
      {requestError ? (
        <p className="ext-ai-error" role="alert">
          {requestError}
        </p>
      ) : null}
    </div>
  );
};
