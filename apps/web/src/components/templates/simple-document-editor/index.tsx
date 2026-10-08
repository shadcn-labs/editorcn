"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import {
  ImagePlaceholder,
  ResizableImage,
} from "@editorcn/extensions/image-placeholder";
import { Table } from "@editorcn/extensions/table";
import { TableHoverOverlay } from "@editorcn/extensions/table-hover-overlay";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEditor, useEditorState } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { ChevronRight, FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  CANVAS,
  SAMPLE_COLLABORATORS,
  SAMPLE_CONTENT,
  SCROLLBAR,
} from "./constants";
import { Collaborators, MoreMenu } from "./header";
import { ShortcutsPopover } from "./shortcuts";
import { Toolbar } from "./toolbar";
import type { SimpleDocumentEditorProps } from "./types";
import { readState } from "./utils";

import "@editorcn/editor/style.css";
import "@editorcn/extensions/image-placeholder/style.css";
import "@editorcn/extensions/table/style.css";
import "@editorcn/extensions/ui/style.css";

export const SimpleDocumentEditor = ({
  className,
  collaborators = SAMPLE_COLLABORATORS,
  initialContent = SAMPLE_CONTENT,
  initialTitle = "Onboarding redesign",
  onChange,
  onShare,
  onTitleChange,
  path = ["Product", "Specs"],
}: SimpleDocumentEditorProps) => {
  const [title, setTitle] = useState(initialTitle);

  const editor = useEditor({
    content: initialContent,
    extensions: [
      StarterKit.configure({
        gapcursor: false,
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Link,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Table.configure({ resizable: true }),
      ResizableImage,
      ImagePlaceholder,
      TaskList.configure({ HTMLAttributes: { class: "rte-task-list" } }),
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: updated }) => onChange?.(updated.getJSON()),
    shouldRerenderOnTransaction: false,
  });

  const state =
    useEditorState({
      editor,
      selector: ({ editor: e }) => (e && !e.isDestroyed ? readState(e) : null),
    }) ?? (editor ? readState(editor) : null);

  const words = state?.words ?? 0;

  return (
    <div
      className={cn(
        "bg-background text-foreground flex max-h-[41rem] flex-col overflow-hidden rounded-xl border shadow-sm",
        className
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <FileText className="text-muted-foreground size-4 shrink-0" />
        <nav
          aria-label="Breadcrumb"
          className="text-muted-foreground flex min-w-0 items-center gap-1 text-sm"
        >
          {path.map((segment) => (
            <span key={segment} className="hidden items-center gap-1 sm:flex">
              {segment}
              <ChevronRight className="size-3.5 opacity-50" />
            </span>
          ))}
          <span className="text-foreground truncate font-medium">
            {title || "Untitled"}
          </span>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <Collaborators people={collaborators} />
          </div>
          {onShare && (
            <Button
              className="h-7 rounded-md px-3 text-xs"
              onClick={onShare}
              size="sm"
            >
              Share
            </Button>
          )}
          <MoreMenu editor={editor} />
        </div>
      </header>

      <RichTextEditor
        editor={editor}
        variant="subtle"
        className={cn(
          "min-h-0 flex-1 overflow-y-auto rounded-none! border-0! shadow-none!",
          CANVAS,
          SCROLLBAR
        )}
      >
        <Toolbar editor={editor} state={state} />
        <article className="bg-background mx-3 mt-4 mb-6 rounded-lg border px-5 py-6 shadow-xs sm:mx-auto sm:max-w-3xl sm:px-14 sm:py-12">
          <input
            aria-label="Document title"
            className="placeholder:text-muted-foreground/60 mb-4 w-full bg-transparent text-2xl font-bold tracking-tight outline-none sm:text-3xl"
            onChange={(e) => {
              setTitle(e.target.value);
              onTitleChange?.(e.target.value);
            }}
            placeholder="Untitled"
            value={title}
          />
          <RichTextEditor.Content className="[&_.ProseMirror]:min-h-64! [&_.ProseMirror]:p-0! [&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:text-inherit [&_mark:not([style])]:bg-yellow-400/40" />
        </article>
      </RichTextEditor>
      <TableHoverOverlay editor={editor} />

      <footer className="text-muted-foreground flex h-9 shrink-0 items-center gap-3 border-t px-3 text-xs tabular-nums">
        <span>{words.toLocaleString()} words</span>
        <span>{(state?.characters ?? 0).toLocaleString()} characters</span>
        <span className="hidden sm:inline">
          {Math.max(1, Math.ceil(words / 200))} min read
        </span>
        <div className="ml-auto">
          <ShortcutsPopover />
        </div>
      </footer>
    </div>
  );
};

export type { DocumentCollaborator, SimpleDocumentEditorProps } from "./types";
