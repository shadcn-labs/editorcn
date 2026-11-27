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

const ICON_BUTTON_CLASS =
  "size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3.5";

const KBD_CLASS =
  "rounded-md border border-border/60 bg-background px-1.5 py-px font-sans text-[0.6875rem] text-muted-foreground";

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

interface MermaidCardProps {
  editable: boolean;
  onDelete: () => void;
  onEdit: () => void;
  selected: boolean;
  value: string;
}

const MermaidCard = ({
  editable,
  onDelete,
  onEdit,
  selected,
  value,
}: MermaidCardProps) => {
  const { copied, copy } = useCopy(value);

  return (
    <div
      className={cn(
        "ext-mermaid-box group/mermaid relative rounded-xl border border-border/60 bg-card select-none [transition:box-shadow_150ms_ease-out]",
        selected && "ring-2 ring-ring/50"
      )}
      contentEditable={false}
      onDoubleClick={editable ? onEdit : undefined}
    >
      <div className="ext-mermaid-actions absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5 opacity-0 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)] [transition:opacity_150ms_ease-out] group-hover/mermaid:opacity-100 focus-within:opacity-100 motion-reduce:transition-none">
        <Button
          size="icon-sm"
          className={ICON_BUTTON_CLASS}
          aria-label="Copy source"
          tooltip={copied ? "Copied" : "Copy source"}
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
              aria-label="Edit diagram"
              tooltip="Edit"
              onClick={onEdit}
            >
              <Pencil />
            </Button>
            <div className="mx-0.5 h-4 w-px bg-border" />
            <Button
              size="icon-sm"
              className={cn(
                ICON_BUTTON_CLASS,
                "hover:bg-destructive/10 hover:text-destructive"
              )}
              aria-label="Delete diagram"
              tooltip="Delete"
              onClick={onDelete}
            >
              <Trash2 />
            </Button>
          </>
        )}
      </div>
      <MermaidPreview value={value} className="min-h-40 px-6 py-8" />
    </div>
  );
};

export const MermaidView = ({
  deleteNode,
  editor,
  node,
  selected,
  updateAttributes,
}: ReactNodeViewProps<HTMLDivElement>) => {
  const editable = useEditable(editor);
  const value = (node.attrs.value as string | null) ?? "";
  const [editing, setEditing] = useState(() => editable && !value);
  const [draft, setDraft] = useState(value);
  const [layout, setLayout] = useState<Layout>("split");
  const { copied, copy } = useCopy(draft);

  const isEditing = editing && editable;
  const lines = draft ? draft.split("\n").length : 0;
  const dirty = draft !== value;

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
      <NodeViewWrapper className="ext-mermaid my-3" data-type="mermaid">
        <MermaidCard
          editable={editable}
          selected={selected}
          value={value}
          onDelete={deleteNode}
          onEdit={startEditing}
        />
      </NodeViewWrapper>
    );
  }

  const showCode = layout !== "preview";
  const showPreview = layout !== "code";

  return (
    <NodeViewWrapper className="ext-mermaid my-3" data-type="mermaid">
      <div
        className="ext-mermaid-frame @container/mermaid rounded-xl border border-border/60 bg-muted/50 p-1 select-none"
        contentEditable={false}
      >
        <div className="ext-mermaid-header flex items-center justify-between gap-2 py-1 pr-1 pl-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Workflow className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Diagram</span>
            <span className="hidden text-xs text-muted-foreground tabular-nums @sm/mermaid:inline">
              {lines} {lines === 1 ? "line" : "lines"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <fieldset
              className="ext-mermaid-layout m-0 flex h-8 min-w-0 items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5"
              aria-label="Layout"
            >
              {LAYOUTS.map((option) => (
                <Button
                  key={option.value}
                  className={cn(
                    "h-7 gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground [&>svg]:size-3.5",
                    layout === option.value &&
                      "bg-muted text-foreground hover:bg-muted"
                  )}
                  active={layout === option.value}
                  aria-label={option.label}
                  onClick={() => setLayout(option.value)}
                >
                  {option.icon}
                  <span className="hidden @lg/mermaid:inline">
                    {option.label}
                  </span>
                </Button>
              ))}
            </fieldset>
            <Button
              size="icon-sm"
              className={cn(ICON_BUTTON_CLASS, "size-8")}
              aria-label="Copy source"
              tooltip={copied ? "Copied" : "Copy source"}
              disabled={!draft}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        </div>
        <div
          className={cn(
            "ext-mermaid-panel grid min-h-64 overflow-hidden rounded-lg border border-border/60 bg-card",
            showCode && showPreview && "@xl/mermaid:grid-cols-2"
          )}
        >
          {showCode && (
            <textarea
              aria-label="Mermaid source"
              autoFocus
              className={cn(
                "ext-mermaid-source block min-h-64 w-full resize-none border-0 bg-transparent p-4 font-mono text-[0.8125rem] leading-relaxed text-foreground outline-none select-text placeholder:text-muted-foreground/50",
                showPreview &&
                  "border-b border-border/60 @xl/mermaid:border-r @xl/mermaid:border-b-0"
              )}
              placeholder={PLACEHOLDER}
              spellCheck={false}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
            />
          )}
          {showPreview && (
            <MermaidPreview value={draft} className="min-h-64 justify-center" />
          )}
        </div>
        <div className="ext-mermaid-footer flex items-center justify-between gap-2 py-1.5 pr-1 pl-2.5">
          <div className="hidden items-center gap-3 text-xs text-muted-foreground @md/mermaid:flex">
            <span className="flex items-center gap-1">
              <kbd className={KBD_CLASS}>{IS_MAC ? "⌘" : "Ctrl"}</kbd>
              <kbd className={KBD_CLASS}>Enter</kbd>
              <span>to apply</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className={KBD_CLASS}>Esc</kbd>
              <span>to cancel</span>
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <Button
              className="h-7 rounded-lg border border-border bg-background px-2.5 text-xs font-medium hover:bg-muted"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              className="h-7 rounded-lg border-transparent bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground disabled:opacity-50"
              disabled={!dirty && Boolean(value)}
              onClick={apply}
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
