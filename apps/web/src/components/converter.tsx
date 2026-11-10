"use client";

import { Callout } from "@editorcn/extensions/callout";
import { Markdown } from "@editorcn/extensions/markdown";
import { Table } from "@editorcn/extensions/table";
import { StaticRenderer } from "@editorcn/static-renderer";
import { Editor } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { StarterKit } from "@tiptap/starter-kit";
import { RotateCcwIcon, Trash2Icon, UploadIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { HighlighterCore } from "shiki/core";
import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Format } from "@/lib/tools";
import { FORMAT_LABEL } from "@/lib/tools";
import { cn } from "@/lib/utils";

import "@editorcn/static-renderer/style.css";

const ACCEPT: Record<Format, string> = {
  html: ".html,.htm,text/html",
  json: ".json,application/json",
  markdown: ".md,.markdown,text/markdown,text/plain",
};

const load = (editor: Editor, input: string, from: Format) => {
  if (from === "json") {
    editor.commands.setContent(JSON.parse(input), {
      errorOnInvalidContent: true,
    });
  } else if (from === "markdown") {
    editor.commands.setContent(input, { contentType: "markdown" });
  } else {
    editor.commands.setContent(input);
  }
};

const BLOCK_END =
  /(<\/(?:p|h[1-6]|li|ul|ol|blockquote|pre|table|colgroup|tbody|thead|tr)>|<hr>)/g;

const formatHtml = (html: string) => html.replace(BLOCK_END, "$1\n").trim();

const read = (editor: Editor, to: Format) => {
  if (to === "json") {
    return JSON.stringify(editor.getJSON(), null, 2);
  }
  return to === "markdown"
    ? editor.getMarkdown()
    : formatHtml(editor.getHTML());
};

const createEditor = () =>
  new Editor({
    element: null,
    extensions: [
      StarterKit.configure({ gapcursor: false }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table,
      Callout,
      Markdown,
    ],
  });

const convert = (editor: Editor, input: string, from: Format, to: Format) => {
  if (from === "json" && !input.trim()) {
    return { error: "", html: "", output: "" };
  }
  try {
    load(editor, input, from);
    return { error: "", html: editor.getHTML(), output: read(editor, to) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      html: "",
      output: "",
    };
  }
};

const SHIKI_LANG: Record<Format, string> = {
  html: "html",
  json: "json",
  markdown: "markdown",
};

const MAX_HIGHLIGHT_LENGTH = 50_000;

let highlighter: Promise<HighlighterCore> | undefined;

const getHighlighter = () => {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [
      import("shiki/langs/html.mjs"),
      import("shiki/langs/json.mjs"),
      import("shiki/langs/markdown.mjs"),
    ],
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ],
  });
  return highlighter;
};

const useHighlight = (code: string, format: Format) => {
  const [result, setResult] = useState({ code: "", html: "" });

  useEffect(() => {
    if (code.length > MAX_HIGHLIGHT_LENGTH) {
      return;
    }
    let active = true;
    const highlight = async () => {
      const instance = await getHighlighter();
      if (active) {
        setResult({
          code,
          html: instance.codeToHtml(code, {
            defaultColor: false,
            lang: SHIKI_LANG[format],
            structure: "inline",
            themes: { dark: "github-dark", light: "github-light" },
          }),
        });
      }
    };
    void highlight();
    return () => {
      active = false;
    };
  }, [code, format]);

  return result.code === code ? result.html : "";
};

const Highlighted = ({ code, html }: { code: string; html: string }) =>
  html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : code;

const PANE_HEIGHT = "h-[clamp(28rem,65vh,48rem)]";

const paneHeaderClassName =
  "flex h-11 items-center justify-between gap-2 border-b border-border/60 pr-1.5 pl-3";

const scrollAreaClassName = cn(
  PANE_HEIGHT,
  "overflow-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]"
);

const codeClassName =
  "m-0 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap wrap-break-word [tab-size:2] [&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)";

const PaneLabel = ({ children, id }: { children: string; id?: string }) => (
  <span className="text-sm font-medium" id={id}>
    {children}
  </span>
);

const ConverterClient = ({
  from,
  sample,
  to,
}: {
  from: Format;
  sample: string;
  to: Format;
}) => {
  const [input, setInput] = useState(sample);
  const [editor] = useState(createEditor);

  const { error, html, output } = useMemo(
    () => convert(editor, input, from, to),
    [editor, input, from, to]
  );

  const inputHtml = useHighlight(input, from);
  const outputHtml = useHighlight(output, to);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = await event.target.files?.[0]?.text();
    if (text !== undefined) {
      setInput(text);
    }
    event.target.value = "";
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/50 p-1">
      <div className="grid overflow-hidden rounded-lg border border-border/60 bg-card text-card-foreground md:grid-cols-2 md:divide-x md:divide-border/60">
        <div className="flex min-w-0 flex-col border-b border-border/60 md:border-b-0">
          <div className={paneHeaderClassName}>
            <PaneLabel id="converter-input">{FORMAT_LABEL[from]}</PaneLabel>
            <div className="flex items-center gap-1">
              <Button
                asChild
                className="h-7 rounded-md px-2 text-xs"
                size="sm"
                variant="ghost"
              >
                <label className="cursor-pointer has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/50">
                  <UploadIcon />
                  <span className="sr-only sm:not-sr-only">Upload</span>
                  <input
                    accept={ACCEPT[from]}
                    className="sr-only"
                    onChange={onUpload}
                    type="file"
                  />
                </label>
              </Button>
              <Button
                className="h-7 rounded-md px-2 text-xs"
                onClick={() => setInput(sample)}
                size="sm"
                variant="ghost"
              >
                <RotateCcwIcon />
                <span className="sr-only sm:not-sr-only">Sample</span>
              </Button>
              <Button
                className="h-7 rounded-md px-2 text-xs"
                onClick={() => setInput("")}
                size="sm"
                variant="ghost"
              >
                <Trash2Icon />
                <span className="sr-only sm:not-sr-only">Clear</span>
              </Button>
            </div>
          </div>
          <div className={scrollAreaClassName}>
            <div className="grid min-h-full">
              <pre
                aria-hidden
                className={cn(
                  codeClassName,
                  "pointer-events-none [grid-area:1/1]"
                )}
              >
                <Highlighted code={input} html={inputHtml} />
                {"\n"}
              </pre>
              <textarea
                aria-labelledby="converter-input"
                className={cn(
                  codeClassName,
                  "resize-none overflow-hidden bg-transparent text-transparent caret-foreground outline-none [grid-area:1/1] placeholder:text-muted-foreground"
                )}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Paste ${FORMAT_LABEL[from]} here…`}
                spellCheck={false}
                value={input}
              />
            </div>
          </div>
        </div>

        <Tabs className="min-w-0 gap-0" defaultValue="code">
          <div className={paneHeaderClassName}>
            <TabsList className="h-8 rounded-lg border border-border/60 bg-background p-0.5">
              <TabsTrigger
                className="h-7 rounded-md px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-muted"
                value="code"
              >
                {FORMAT_LABEL[to]}
              </TabsTrigger>
              <TabsTrigger
                className="h-7 rounded-md px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:shadow-none dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-muted"
                value="preview"
              >
                Preview
              </TabsTrigger>
            </TabsList>
            <CopyButton className="static size-7 rounded-md" value={output} />
          </div>
          <TabsContent value="code">
            <div className={scrollAreaClassName}>
              <pre
                aria-label={`${FORMAT_LABEL[to]} output`}
                className={cn(codeClassName, error && "text-destructive")}
              >
                {error || <Highlighted code={output} html={outputHtml} />}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div className={cn(scrollAreaClassName, "p-4")}>
              {html ? (
                <StaticRenderer content={html} sanitize />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nothing to preview yet.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-2 pb-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              error ? "bg-destructive" : "bg-emerald-500"
            )}
          />
          <output>
            {error
              ? "Couldn't convert this input"
              : "Converted in your browser"}
          </output>
        </span>
        <span className="tabular-nums">
          {input.length.toLocaleString()} → {output.length.toLocaleString()}{" "}
          characters
        </span>
      </div>
    </div>
  );
};

export const Converter = dynamic(() => Promise.resolve(ConverterClient), {
  loading: () => (
    <div className="h-[calc(clamp(28rem,65vh,48rem)+4.75rem)] animate-pulse rounded-xl border border-border/60 bg-muted/50" />
  ),
  ssr: false,
});
