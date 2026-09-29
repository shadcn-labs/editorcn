"use client";

import { RichTextEditor } from "@editorcn/editor";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useState } from "react";

import "@editorcn/editor/style.css";

export interface DocumentEditorProps {
  className?: string;
  initialTitle?: string;
  onChange?: (html: string) => void;
  titlePlaceholder?: string;
}

export const DocumentEditor = ({
  className,
  initialTitle = "",
  onChange,
  titlePlaceholder = "Untitled document",
}: DocumentEditorProps) => {
  const [title, setTitle] = useState(initialTitle);

  const editor = useEditor({
    content: "<p>Start writing your document…</p>",
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: updated }) => onChange?.(updated.getHTML()),
    shouldRerenderOnTransaction: false,
  });

  return (
    <div
      className={[
        "overflow-hidden rounded-xl border border-border bg-background",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        aria-label="Document title"
        className="w-full border-b border-border bg-transparent px-5 pt-5 pb-3 text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground"
        onChange={(e) => setTitle(e.target.value)}
        placeholder={titlePlaceholder}
        value={title}
      />
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
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
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content className="min-h-64" />
      </RichTextEditor>
    </div>
  );
};
