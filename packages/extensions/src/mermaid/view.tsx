"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import {
  Check,
  Code,
  Columns2,
  Copy,
  Eye,
  Pencil,
  Trash2,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

import { useEditable } from "../core/editor-state";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { MermaidPreview } from "./preview";

type Layout = "code" | "split" | "preview";

const PLACEHOLDER = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Ship it]
  B -->|No| D[Debug]
  D --> B`;

const LAYOUTS: { icon: ReactNode; label: string; value: Layout }[] = [
  { icon: <Code />, label: "Code", value: "code" },
  { icon: <Columns2 />, label: "Split", value: "split" },
  { icon: <Eye />, label: "Preview", value: "preview" },
];

const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent);

const ICON_BUTTON_CLASS = "size-7 rounded-sm [&>svg]:size-3.5";

const useCopy = (text: string) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return { copied, copy };
};

export const MermaidView = ({
  deleteNode,
  editor,
  node,
  updateAttributes,
}: ReactNodeViewProps<HTMLDivElement>) => {
  const editable = useEditable(editor);
  const value = (node.attrs.value as string | null) ?? "";
  const [editing, setEditing] = useState(() => editable && !value);
  const [draft, setDraft] = useState(value);
  const [layout, setLayout] = useState<Layout>("split");
  const { copied, copy } = useCopy(editing ? draft : value);

  const isEditing = editing && editable;
  const lines = draft ? draft.split("\n").length : 0;

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
  };

  const apply = () => {
    updateAttributes({ value: draft.trim() ? draft : null });
    setEditing(false);
  };

  const cancel = () => {
    if (value) {
      setDraft(value);
      setEditing(false);
    } else {
      deleteNode();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      apply();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  };

  if (!isEditing) {
    return (
      <NodeViewWrapper className="ext-mermaid my-2" data-type="mermaid">
        <div
          className="ext-mermaid-box group/mermaid relative rounded-[var(--radius)] border border-border bg-background"
          contentEditable={false}
        >
          <div className="ext-mermaid-actions absolute top-1.5 right-1.5 z-10 flex gap-0.5 rounded-md border border-border bg-background p-0.5 text-muted-foreground opacity-0 shadow-xs [transition:opacity_150ms_ease-out] group-hover/mermaid:opacity-100 focus-within:opacity-100">
            <Button
              size="icon-sm"
              className={ICON_BUTTON_CLASS}
              aria-label="Copy"
              tooltip="Copy"
              disabled={!value}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
            {editable && (
              <>
                <Button
                  size="icon-sm"
                  className={ICON_BUTTON_CLASS}
                  aria-label="Edit"
                  tooltip="Edit"
                  onClick={startEditing}
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  className={ICON_BUTTON_CLASS}
                  aria-label="Delete"
                  tooltip="Delete"
                  danger
                  onClick={deleteNode}
                >
                  <Trash2 />
                </Button>
              </>
            )}
          </div>
          <MermaidPreview value={value} className="min-h-32 py-4" />
        </div>
      </NodeViewWrapper>
    );
  }

  const showCode = layout !== "preview";
  const showPreview = layout !== "code";

  return (
    <NodeViewWrapper className="ext-mermaid my-2" data-type="mermaid">
      <div
        className="ext-mermaid-box @container/mermaid overflow-hidden rounded-[var(--radius)] border border-border bg-background"
        contentEditable={false}
      >
        <div className="ext-mermaid-header flex items-center justify-between gap-2 border-b border-border bg-muted/40 py-1.5 pr-1.5 pl-3">
          <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <Workflow className="size-3.5 shrink-0" />
            <span className="text-xs font-medium tracking-wide uppercase">
              Mermaid
            </span>
            <span className="text-[0.6875rem] whitespace-nowrap opacity-70">
              {lines} {lines === 1 ? "line" : "lines"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <fieldset
              className="ext-mermaid-layout m-0 flex min-w-0 gap-0.5 rounded-md border-0 bg-muted p-0.5"
              aria-label="Layout"
            >
              {LAYOUTS.map((option) => (
                <Button
                  key={option.value}
                  size="icon-sm"
                  className={cn(
                    ICON_BUTTON_CLASS,
                    "text-muted-foreground",
                    layout === option.value &&
                      "bg-background text-foreground shadow-xs hover:bg-background"
                  )}
                  active={layout === option.value}
                  aria-label={option.label}
                  tooltip={option.label}
                  onClick={() => setLayout(option.value)}
                >
                  {option.icon}
                </Button>
              ))}
            </fieldset>
            <Button
              size="icon-sm"
              className={cn(ICON_BUTTON_CLASS, "text-muted-foreground")}
              aria-label="Copy"
              tooltip="Copy"
              disabled={!draft}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
            <div className="mx-0.5 h-4 w-px bg-border" />
            <Button className="h-7 px-2.5 text-xs" onClick={cancel}>
              Cancel
            </Button>
            <Button
              className="h-7 border-transparent bg-primary px-2.5 text-xs text-primary-foreground hover:bg-[color-mix(in_srgb,var(--primary)_85%,black)] hover:text-primary-foreground"
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "ext-mermaid-body grid min-h-64",
            showCode && showPreview && "@xl/mermaid:grid-cols-2"
          )}
        >
          {showCode && (
            <div
              className={cn(
                "relative flex flex-col",
                showPreview &&
                  "border-b border-border @xl/mermaid:border-r @xl/mermaid:border-b-0"
              )}
            >
              <textarea
                aria-label="Mermaid source"
                autoFocus
                className="ext-mermaid-source block min-h-64 w-full flex-1 resize-none border-0 bg-transparent p-4 pb-8 font-mono text-[0.8125rem] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60"
                placeholder={PLACEHOLDER}
                spellCheck={false}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="pointer-events-none absolute right-3 bottom-2 flex gap-2 text-[0.625rem] text-muted-foreground/70">
                <span>{IS_MAC ? "⌘↵" : "Ctrl+↵"} Apply</span>
                <span>Esc Cancel</span>
              </div>
            </div>
          )}
          {showPreview && (
            <MermaidPreview value={draft} className="min-h-64 justify-center" />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};
