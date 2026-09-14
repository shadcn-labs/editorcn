"use client";

import type { RichTextEditorVariant } from "@editorcn/editor";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrowRightIcon } from "@/components/animated-icons/arrow-right";
import type { ArrowRightIconHandle } from "@/components/animated-icons/arrow-right";
import { BlockEditorPreview } from "@/components/block-editor-preview";
import { ComponentCode } from "@/components/component-code";
import { EditorPreview } from "@/components/editor-preview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useIconAnimation } from "@/hooks/use-icon-animation";
import { highlightCode } from "@/lib/highlight-code";

interface CodeFile {
  language: string;
  filename: string;
  code: string;
}

interface EditorSectionProps {
  type: "editor" | "block-editor";
  title: string;
  badge: string;
  badgeClass?: string;
  description: string;
  codeData: CodeFile[];
  docsHref: string;
}

const VARIANTS: { label: string; value: RichTextEditorVariant }[] = [
  { label: "Default", value: "default" },
  { label: "Subtle", value: "subtle" },
  { label: "Compact", value: "compact" },
];

interface CodeViewerState {
  code: string;
  html: string | null;
  error: string | null;
}

const CodeViewer = ({ files }: { files: CodeFile[] }) => {
  const [activeFile, setActiveFile] = useState(files[0]?.filename);
  const [state, setState] = useState<CodeViewerState | null>(null);

  const current = files.find((f) => f.filename === activeFile) ?? files[0];
  const active = state && current && state.code === current.code ? state : null;
  const error = active?.error ?? null;
  const isLoading = !active || (active.html === null && !active.error);

  useEffect(() => {
    if (!current) {
      return;
    }
    let cancelled = false;

    const render = async () => {
      try {
        const html = await highlightCode(current.code, current.language);
        if (!cancelled) {
          setState({ code: current.code, error: null, html });
        }
      } catch (renderError) {
        if (!cancelled) {
          setState({
            code: current.code,
            error:
              renderError instanceof Error
                ? renderError.message
                : "Failed to render code.",
            html: null,
          });
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [current]);

  if (!files.length) {
    return (
      <div className="flex h-full min-h-72 items-center justify-center text-sm text-muted-foreground">
        No code available.
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-140 bg-code text-code-foreground lg:min-h-0">
      {files.length > 1 ? (
        <div className="mb-2 flex gap-1 border-b border-border/40 px-1">
          {files.map((f) => (
            <button
              key={f.filename}
              onClick={() => setActiveFile(f.filename)}
              className={
                f.filename === current?.filename
                  ? "border-b-2 border-foreground px-2 py-1 text-xs font-medium text-foreground"
                  : "border-b-2 border-transparent px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              }
            >
              {f.filename}
            </button>
          ))}
        </div>
      ) : null}

      <div className="no-scrollbar min-h-0 flex-1 overflow-auto px-3">
        {isLoading ? (
          <output className="flex h-full min-h-72 items-center justify-center text-sm text-code-foreground/60">
            Rendering code…
          </output>
        ) : null}
        {error ? (
          <div
            className="flex h-full min-h-72 items-center justify-center px-6 text-center text-sm text-red-400"
            role="alert"
          >
            {error}
          </div>
        ) : null}
        {current && active?.html && !isLoading && !error ? (
          <ComponentCode
            code={current.code}
            highlightedCode={active.html}
            language={current.language}
            title={current.filename}
            className="mt-0"
            copyButtonClassName="right-4"
          />
        ) : null}
      </div>
    </div>
  );
};

export const EditorSection = (props: EditorSectionProps) => {
  const [variant, setVariant] = useState<RichTextEditorVariant>("default");
  const { iconRef, onMouseEnter, onMouseLeave } =
    useIconAnimation<ArrowRightIconHandle>();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-lg font-medium tracking-tight text-foreground">
          {props.title}
        </h2>
      </div>
      <p className="mb-4 text-base text-muted-foreground">
        {props.description}
      </p>

      <Tabs defaultValue="preview">
        <div className="flex flex-col-reverse gap-2 items-start sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          {props.type === "editor" && (
            <div className="flex w-full sm:w-auto gap-2">
              {VARIANTS.map((v) => (
                <Button
                  key={v.value}
                  variant={variant === v.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1 sm:flex-auto"
                  onClick={() => setVariant(v.value)}
                >
                  {v.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        <TabsContent value="preview">
          {props.type === "editor" ? (
            <EditorPreview variant={variant} />
          ) : (
            <BlockEditorPreview />
          )}
        </TabsContent>
        <TabsContent value="code">
          <CodeViewer files={props.codeData} />
        </TabsContent>
      </Tabs>
      <div className="mt-2">
        <Button
          variant="link"
          className="h-auto px-0"
          asChild
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Link href={props.docsHref} prefetch={false}>
            View docs <ArrowRightIcon ref={iconRef} />
          </Link>
        </Button>
      </div>
    </div>
  );
};
