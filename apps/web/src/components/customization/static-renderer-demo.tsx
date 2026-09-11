"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import { StaticRenderer } from "@editorcn/static-renderer";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Eye } from "lucide-react";
import { useState } from "react";

import "@editorcn/editor/style.css";
import "@editorcn/static-renderer/style.css";

const CONTENT = `
<h1>Writing on the web</h1>
<h2>Why prose matters</h2>
<p>
  Your saved document can be rendered anywhere — a blog post, an email, a chat
  message, a print view. The <strong>StaticRenderer</strong> styles the exact
  HTML the editor serializes, so it keeps your <em>typesetting</em> without
  needing a markdown pipeline.
</p>
<ul>
  <li>Headings and paragraphs</li>
  <li>Lists, nesting, and inline <code>code</code></li>
  <li>
    Links like the <a href="https://editorcn.vercel.app">project site</a>
  </li>
</ul>
<ol>
  <li>Write in the editor</li>
  <li>Save <code>editor.getHTML()</code></li>
  <li>Render it with <code>StaticRenderer</code> — read only</li>
</ol>
<ul>
  <li>
    Nested lists
    <ul>
      <li>… nest just like you would in the editor</li>
    </ul>
  </li>
</ul>
<blockquote>
  <p>Good typography is invisible, and that visible page is all that matters.</p>
</blockquote>
<hr>
<p>
  Block elements and inline styles pass through untouched, so you can keep
  <strong>emphasis</strong>, <em>italics</em>, <u>underlines</u>, or
  <s>struck-through</s> text exactly as the author left it.
</p>
`.trim();

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Underline,
  Link,
  Placeholder.configure({ placeholder: "Start typing..." }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

export const StaticRendererDemo = () => {
  const [doc, setDoc] = useState(CONTENT);
  const [json, setJson] = useState<JSONContent | null>(null);
  const editor = useEditor({
    content: CONTENT,
    extensions,
    immediatelyRender: false,
    onCreate: ({ editor: ed }) => setJson(ed.getJSON()),
    onUpdate: ({ editor: ed }) => {
      setDoc(ed.getHTML());
      setJson(ed.getJSON());
    },
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="space-y-4 mt-4">
      <div className="overflow-hidden rounded-md border border-border">
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Code />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.H1 />
              <RichTextEditor.H2 />
              <RichTextEditor.H3 />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Blockquote />
              <RichTextEditor.Hr />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.AlignLeft />
              <RichTextEditor.AlignCenter />
              <RichTextEditor.AlignRight />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.BubbleMenu editor={editor} />
          <RichTextEditor.Content />
        </RichTextEditor>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Eye className="size-4" />
            Static output — HTML
          </div>
          <div className="p-5">
            <StaticRenderer content={doc} />
          </div>
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Eye className="size-4" />
            Static output — JSON
          </div>
          <div className="p-5">
            {json && <StaticRenderer content={json} extensions={extensions} />}
          </div>
        </div>
      </div>
    </div>
  );
};
