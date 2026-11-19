"use client";

import {
  RichTextEditor,
  Link,
  useRichTextEditorContext,
} from "@editorcn/editor";
import type { RichTextEditorLabels } from "@editorcn/editor";
import { Highlight } from "@tiptap/extension-highlight";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Underline } from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

import "@editorcn/editor/style.css";

const EDITOR_CONTENT = `
<h1 style="text-align: center;">Rich Text Editing</h1>
<h2>Formatting</h2>
<p>Use the toolbar above to apply <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <code>inline code</code>.</p>
<h2>Lists &amp; Quotes</h2>
<ul>
  <li>Unordered list item</li>
  <li>Another item</li>
</ul>
<ol>
  <li>First ordered item</li>
  <li>Second ordered item</li>
</ol>
<blockquote><p>A well-known quote inside a blockquote element.</p></blockquote>
`.trim();

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
  Link,
  Underline,
  Highlight,
  Subscript,
  Superscript,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({ placeholder: "Start typing..." }),
];

const EditorToolbar = () => (
  <>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Bold />
      <RichTextEditor.Italic />
      <RichTextEditor.Underline />
      <RichTextEditor.Strikethrough />
      <RichTextEditor.Code />
      <RichTextEditor.ClearFormatting />
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
      <RichTextEditor.Link />
      <RichTextEditor.Unlink />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Undo />
      <RichTextEditor.Redo />
    </RichTextEditor.ControlsGroup>
  </>
);

export const EditorVariantsDemo = () => {
  const a = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  const b = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  const c = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          default
        </p>
        <RichTextEditor editor={a} variant="default">
          <RichTextEditor.Toolbar>
            <EditorToolbar />
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">subtle</p>
        <RichTextEditor editor={b} variant="subtle">
          <RichTextEditor.Toolbar>
            <EditorToolbar />
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          compact
        </p>
        <RichTextEditor editor={c} variant="compact">
          <RichTextEditor.Toolbar>
            <EditorToolbar />
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </div>
    </div>
  );
};

export const EditorClassNameDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <RichTextEditor
      editor={editor}
      className="rounded-2xl border-dashed border-border"
    >
      <RichTextEditor.Toolbar>
        <EditorToolbar />
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export const EditorThemingDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <div
      style={
        {
          "--accent": "oklch(0.9 0.05 25)",
          "--accent-foreground": "oklch(0.3 0.1 25)",
          "--border": "oklch(0.6 0.15 25 / 0.3)",
          "--muted": "oklch(0.95 0.02 25)",
          "--primary": "oklch(0.6 0.2 25)",
          "--radius": "0.75rem",
        } as React.CSSProperties
      }
    >
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <EditorToolbar />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
    </div>
  );
};

export const EditorStickyToolbarDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar
        sticky
        stickyOffset={0}
        className="bg-accent/30 backdrop-blur-sm"
      >
        <EditorToolbar />
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

const CustomStarControl = () => {
  const { editor } = useRichTextEditorContext();
  return (
    <RichTextEditor.Control
      onClick={() => editor?.chain().focus().insertContent("⭐ ").run()}
      title="Insert star emoji"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </RichTextEditor.Control>
  );
};

const CustomGreetingControl = () => {
  const { editor } = useRichTextEditorContext();
  return (
    <RichTextEditor.Control
      onClick={() =>
        editor?.chain().focus().insertContent("Hello there! ").run()
      }
      title="Insert greeting"
    >
      <span className="text-sm">👋</span>
    </RichTextEditor.Control>
  );
};

export const EditorCustomControlsDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <CustomStarControl />
          <CustomGreetingControl />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

export const EditorReadOnlyDemo = () => {
  const [isEditable, setIsEditable] = useState(true);
  const editor = useEditor({
    content: EDITOR_CONTENT,
    editable: isEditable,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });

  const toggle = () => {
    if (!editor) {
      return;
    }
    const next = !editor.isEditable;
    editor.setEditable(next);
    setIsEditable(next);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        onClick={toggle}
      >
        {isEditable ? (
          <Lock className="h-4 w-4" />
        ) : (
          <Unlock className="h-4 w-4" />
        )}
        {isEditable ? "Switch to Read-only" : "Switch to Editable"}
      </button>
      <RichTextEditor editor={editor} editable={isEditable}>
        <RichTextEditor.Toolbar>
          <EditorToolbar />
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content />
      </RichTextEditor>
    </div>
  );
};

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="rte-editor-icon"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    className="rte-editor-icon"
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const EditorCustomIconsDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <RichTextEditor
      editor={editor}
      icons={{
        boldControlIcon: <StarIcon />,
        italicControlIcon: <HeartIcon />,
      }}
    >
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};

const customLabels: Partial<RichTextEditorLabels> = {
  boldControlLabel: "Bold (B)",
  bulletListControlLabel: "List",
  h1ControlLabel: "Title",
  h2ControlLabel: "Subtitle",
  italicControlLabel: "Italic (I)",
  linkControlLabel: "🔗 Link",
  underlineControlLabel: "Underline (U)",
};

export const EditorCustomLabelsDemo = () => {
  const editor = useEditor({
    content: EDITOR_CONTENT,
    extensions,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
  });
  return (
    <RichTextEditor editor={editor} labels={customLabels}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
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
      <RichTextEditor.Content />
    </RichTextEditor>
  );
};
