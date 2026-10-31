"use client";

import { Markdown } from "@editorcn/extensions/markdown";
import { Table } from "@editorcn/extensions/table";
import { StaticRenderer } from "@editorcn/static-renderer";
import { Editor } from "@tiptap/core";
import { Image } from "@tiptap/extension-image";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { StarterKit } from "@tiptap/starter-kit";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import type { Format } from "@/lib/tools";
import { FORMAT_LABEL } from "@/lib/tools";

import "@editorcn/static-renderer/style.css";

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

const read = (editor: Editor, to: Format) => {
  if (to === "json") {
    return JSON.stringify(editor.getJSON(), null, 2);
  }
  return to === "markdown" ? editor.getMarkdown() : editor.getHTML();
};

const textareaClassName =
  "border-input bg-background h-80 w-full resize-y rounded-md border p-3 font-mono text-xs leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          {FORMAT_LABEL[from]}
          <textarea
            className={textareaClassName}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            value={input}
          />
        </label>
        <div className="flex flex-col gap-2 text-sm font-medium">
          <div className="flex items-center justify-between">
            <span id="converter-output">{FORMAT_LABEL[to]}</span>
            <CopyButton className="static" value={output} />
          </div>
          <textarea
            aria-labelledby="converter-output"
            className={textareaClassName}
            readOnly
            spellCheck={false}
            value={error ? `Error: ${error}` : output}
          />
        </div>
      </div>
      {html ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Preview</h2>
          <div className="rounded-md border p-4">
            <StaticRenderer content={html} sanitize />
          </div>
        </section>
      ) : null}
    </div>
  );
};

export const Converter = dynamic(() => Promise.resolve(ConverterClient), {
  loading: () => <div className="h-[22rem]" />,
  ssr: false,
});
