"use client";

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
import { useMemo, useState } from "react";

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
      StarterKit,
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table,
      Markdown,
    ],
  });

const convert = (editor: Editor, input: string, from: Format, to: Format) => {
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

const PANE_HEIGHT = "h-[26rem]";

const paneHeaderClassName =
  "flex h-11 items-center justify-between gap-2 border-b bg-muted/40 px-3";

const textareaClassName = cn(
  PANE_HEIGHT,
  "w-full resize-none bg-transparent p-4 font-mono text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground"
);

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

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = await event.target.files?.[0]?.text();
    if (text !== undefined) {
      setInput(text);
    }
    event.target.value = "";
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="grid md:grid-cols-2 md:divide-x">
        <div className="flex min-w-0 flex-col border-b md:border-b-0">
          <div className={paneHeaderClassName}>
            <PaneLabel id="converter-input">{FORMAT_LABEL[from]}</PaneLabel>
            <div className="flex items-center gap-1">
              <Button asChild size="sm" variant="ghost">
                <label className="cursor-pointer">
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
                onClick={() => setInput(sample)}
                size="sm"
                variant="ghost"
              >
                <RotateCcwIcon />
                <span className="sr-only sm:not-sr-only">Sample</span>
              </Button>
              <Button onClick={() => setInput("")} size="sm" variant="ghost">
                <Trash2Icon />
                <span className="sr-only sm:not-sr-only">Clear</span>
              </Button>
            </div>
          </div>
          <textarea
            aria-labelledby="converter-input"
            className={textareaClassName}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Paste ${FORMAT_LABEL[from]} here…`}
            spellCheck={false}
            value={input}
          />
        </div>

        <Tabs className="min-w-0 gap-0" defaultValue="code">
          <div className={paneHeaderClassName}>
            <TabsList className="h-8">
              <TabsTrigger className="text-xs" value="code">
                {FORMAT_LABEL[to]}
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="preview">
                Preview
              </TabsTrigger>
            </TabsList>
            <CopyButton className="static" value={output} />
          </div>
          <TabsContent value="code">
            <textarea
              aria-label={`${FORMAT_LABEL[to]} output`}
              className={cn(textareaClassName, error && "text-destructive")}
              readOnly
              spellCheck={false}
              value={error || output}
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className={cn(PANE_HEIGHT, "overflow-auto p-4")}>
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "size-2 rounded-full",
              error ? "bg-destructive" : "bg-emerald-500"
            )}
          />
          {error ? "Couldn't convert this input" : "Converted in your browser"}
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
    <div className="h-[31rem] animate-pulse rounded-xl border bg-muted/40" />
  ),
  ssr: false,
});
