# @editorcn/block-editor

A **Notion-style** block-type rich text editor built on [Tiptap](https://tiptap.dev/) with shadcn/ui design tokens. Part of the [editorcn](https://editorcn.vercel.app) editor suite.

## Features

- Block-based editing (Notion, Linear-style)
- Slash command menu — type `/` to insert blocks
- Bubble menu for inline formatting
- Block-level actions (copy, delete, reorder via drag handle)
- Built-in image and table blocks
- Fully typed with TypeScript
- Extensible via Tiptap extensions
- Built with shadcn/ui CSS variables — matches your theme
- Icons powered by [lucide-react](https://lucide.dev), inheriting your theme's colors

## Installation

### npm

```bash
npm install @editorcn/block-editor @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link lucide-react
```

> **Tiptap v3 required.** `@editorcn/block-editor` is built against Tiptap **v3**. Make sure your `@tiptap/*` packages are on v3, and import `BubbleMenu`/`FloatingMenu` from `@tiptap/react/menus` (not the `@tiptap/react` root) if you use them directly.

### shadcn registry

```bash
npx shadcn@latest add @editorcn/block-editor
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
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { BlockEditor } from "@editorcn/block-editor";
import "@editorcn/block-editor/style.css";

export function MyEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "Type / for commands..." }),
      Underline,
    ],
  });

  return <BlockEditor editor={editor} />;
}
```

## Documentation

Full API reference at [editorcn.vercel.app/docs/block-editor](https://editorcn.vercel.app/docs/block-editor).

## License

MIT
