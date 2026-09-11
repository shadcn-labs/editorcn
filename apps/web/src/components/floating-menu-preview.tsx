"use client";

import { Link, RichTextEditor } from "@editorcn/editor";
import { FloatingMenu, FloatingMenuExtension } from "@editorcn/floating-menu";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import type { Editor } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import "@editorcn/floating-menu/style.css";

const DEMO_CONTENT = `
<p>Click on an empty line below — the <strong>floating menu</strong> appears on the same line, right after the cursor, with block actions (headings, lists, quote, code).</p>
<p>Start typing and the menu disappears. <strong>Select some text</strong> instead and the existing <strong>bubble menu</strong> pops above with text formatting.</p>
<p></p>
`.trim();

type Mode = "empty" | "cursor";

// "Follows cursor" demo mode: show at any collapsed cursor, not just
// empty lines. The component default (used by "Empty lines only") is
// stricter: empty textblock only.
const showAtAnyCursor = ({ editor }: { editor: Editor }) =>
  editor.isEditable && editor.isFocused && editor.state.selection.empty;

export const FloatingMenuPreview = () => {
  const [mode, setMode] = useState<Mode>("empty");

  const editor = useEditor({
    content: DEMO_CONTENT,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Link,
      Underline,
      FloatingMenuExtension,
      Placeholder.configure({
        placeholder: "Click to focus — the floating menu follows the cursor…",
      }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <Button
          size="sm"
          variant={mode === "empty" ? "default" : "outline"}
          onClick={() => setMode("empty")}
        >
          Empty lines only
        </Button>
        <Button
          size="sm"
          variant={mode === "cursor" ? "default" : "outline"}
          onClick={() => setMode("cursor")}
        >
          Any cursor position
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border border-border font-inter [&_.ProseMirror]:text-[15px]">
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.Code />
              <RichTextEditor.ClearFormatting />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.BulletList />
              <RichTextEditor.OrderedList />
              <RichTextEditor.Blockquote />
            </RichTextEditor.ControlsGroup>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Undo />
              <RichTextEditor.Redo />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          {/* Existing: text formatting on selection */}
          <RichTextEditor.BubbleMenu editor={editor} />
          {/* New: block actions at the cursor (zero-config defaults) */}
          <FloatingMenu
            editor={editor}
            shouldShow={mode === "cursor" ? showAtAnyCursor : undefined}
          />
          <RichTextEditor.Content className="px-2" />
          <RichTextEditor.Footer showWordCount />
        </RichTextEditor>
      </div>
    </div>
  );
};
