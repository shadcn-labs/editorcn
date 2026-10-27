# @editorcn/editor

A **toolbar-style** rich text editor built on [Tiptap](https://tiptap.dev/) with shadcn/ui design tokens. Part of the [editorcn](https://editorcn.vercel.app) editor suite.

## Features

- Compound component API (`RichTextEditor`, `RichTextEditor.Toolbar`, `RichTextEditor.Content`, etc.)
- 20+ built-in toolbar controls (Bold, H1, Link, Undo, etc.)
- Sticky toolbar with configurable control groups
- Fully typed with TypeScript
- Extensible via Tiptap extensions
- Built with shadcn/ui CSS variables — matches your theme

## Installation

### npm

```bash
npm install @editorcn/editor @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link
```

> **Tiptap v3 required.** `@editorcn/editor` is built against Tiptap **v3**. Make sure your `@tiptap/*` packages are on v3, and import `BubbleMenu`/`FloatingMenu` from `@tiptap/react/menus` (not the `@tiptap/react` root) if you use them directly.

### shadcn registry

```bash
npx shadcn@latest add @editorcn/editor
```

Make sure your `components.json` includes the editorcn registry:

```json
{
  "registries": {
    "@editorcn": "https://editorcn.vercel.app/r/{name}.json"
  }
}
```

## Usage

```tsx
"use client";

import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { RichTextEditor, Link } from "@editorcn/editor";
import "@editorcn/editor/style.css";

export function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit, Link, Underline],
    content: "<p>Start typing...</p>",
  });

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar sticky>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
```

## Documentation

Full API reference at [editorcn.vercel.app/docs/editor](https://editorcn.vercel.app/docs/editor).

## License

MIT
