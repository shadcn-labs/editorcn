"use client";

import { NodeViewWrapper } from "@tiptap/react";
import type { ReactNodeViewProps } from "@tiptap/react";
import { Check, Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useEditable } from "../core/editor-state";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { MermaidPreview } from "./preview";

const PLACEHOLDER = `graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Ship it]
  B -->|No| D[Debug]
  D --> B`;

const TOOLBAR_BUTTON_CLASS = "size-6 rounded-sm [&>svg]:size-3.5";

export const MermaidView = ({
  deleteNode,
  editor,
  node,
  updateAttributes,
}: ReactNodeViewProps<HTMLDivElement>) => {
  const editable = useEditable(editor);
  const value = (node.attrs.value as string | null) ?? "";
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  const [copied, setCopied] = useState(false);

  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <NodeViewWrapper className="ext-mermaid my-2" data-type="mermaid">
      <Tabs
        defaultValue={value ? "preview" : "code"}
        className="ext-mermaid-box rounded-[var(--radius)] border border-border bg-[color-mix(in_srgb,var(--muted)_60%,transparent)]"
      >
        <div
          className="ext-mermaid-header flex items-center justify-between gap-2 px-2 pt-2"
          contentEditable={false}
        >
          <TabsList className="ext-mermaid-tabs p-0.5">
            <TabsTrigger value="preview" className="px-2 py-0.5 text-xs">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="px-2 py-0.5 text-xs">
              Code
            </TabsTrigger>
          </TabsList>
          <div className="ext-mermaid-toolbar flex gap-0.5 text-muted-foreground">
            <Button
              size="icon-sm"
              className={TOOLBAR_BUTTON_CLASS}
              aria-label="Copy"
              tooltip="Copy"
              disabled={!value}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
            {editable && (
              <Button
                size="icon-sm"
                className={TOOLBAR_BUTTON_CLASS}
                aria-label="Delete"
                tooltip="Delete"
                danger
                onClick={deleteNode}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </div>
        <TabsContent value="preview" className="pt-0" contentEditable={false}>
          <MermaidPreview value={value} />
        </TabsContent>
        <TabsContent value="code" className="pt-0">
          <textarea
            aria-label="Mermaid source"
            className="ext-mermaid-source block min-h-40 w-full resize-y border-0 bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
            placeholder={PLACEHOLDER}
            readOnly={!editable}
            spellCheck={false}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              updateAttributes({ value: event.target.value || null });
            }}
          />
        </TabsContent>
      </Tabs>
    </NodeViewWrapper>
  );
};
