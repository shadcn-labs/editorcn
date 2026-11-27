# @editorcn/static-renderer

## 0.6.0

Mermaid diagrams from the new Mermaid extension get a styled card.

### Changes

- `div[data-type="mermaid"]` renders as a bordered card with its source inside, in light and dark mode, so diagrams saved by the editor read as diagrams instead of a loose code block. Drawn SVGs fit the card's width.
- The sanitizer keeps Mermaid diagram markup, so the source survives HTML mode.
- To draw the diagrams, wrap the renderer in `MermaidDiagrams` from the Mermaid extension, or map the node to `MermaidPreview` in JSON mode. `StaticRenderer` itself doesn't load Mermaid, so it stays synchronous and works in server components. See [Mermaid](https://www.rtecn.space/docs/extensions/mermaid#static-renderer).

## 0.5.0

HTML strings are now sanitized by default.

### Upgrading

`StaticRenderer` used to insert HTML strings as-is unless you passed `sanitize`, and only warned in development. It now runs them through the built-in allowlist by default, so user-written HTML can't inject scripts or event handlers.

- If you already pass `sanitize` or a sanitizer function, nothing changes.
- If you render trusted HTML that uses markup outside the allowlist, pass `sanitize={false}` to keep the old output. Never do this for HTML that users can write.
- JSON content is unaffected. It renders through React, never as raw HTML.

### Changes

- `sanitize` defaults to `true`. The development warning for unsanitized HTML is removed.
- The sanitizer keeps `class="rte-task-list"` on `<ul>` (and drops any other class there), so task lists from the toolbar editor keep their styling in the `document` preset.
- The code block mapping used with `highlighter` is a named component, so `react/display-name` no longer flags it.

## 0.4.0

Code blocks now look like the editor's Code Block, and can be syntax highlighted with Shiki.

### Changes

- Code blocks use the muted theme background, the mono font and a thin scrollbar, in light and dark mode, instead of a dark background. Output with highlight.js classes (`.hljs`) keeps its dark style.
- New `highlighter` prop: pass a Shiki highlighter with the `github-light` and `github-dark` themes to color code blocks the way the editor does, in both HTML and JSON mode. `StaticRenderer` doesn't load Shiki itself, so it stays synchronous and works in server components.
- `data-wrap` on code blocks soft-wraps long lines. The sanitizer now keeps `data-wrap` and `data-caption` on `<pre>`.

## 0.3.0

Content styles are now shared with the editors as presets, so rendered content matches the editor it came from.

### Upgrading

No setup changes. If you render HTML yourself instead of using the component, add the `editorcn-content` class and a `data-preset` attribute next to `rte-static-renderer`:

```tsx
<div
  className="rte-static-renderer editorcn-content"
  data-preset="block"
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
/>
```

### Changes

- New `preset` prop: `"block"` (default) matches the block editor, and `"document"` matches the toolbar editor. Use `"document"` for `RichTextEditor` output.
- With the default `"block"` preset, output now matches the block editor exactly:
  - A heading that's the first child keeps its top margin.
  - Nested bullets use discs instead of circles and squares.
  - Images get the block editor's 1px outline.
  - Links, inline code and quotes get its hover transitions.
  - Inline code uses Tailwind's default mono font stack instead of `var(--font-mono)`.
- Content selectors are now `.editorcn-content[data-preset="block"] p` and so on. Overrides written as `.rte-static-renderer p` are less specific, so they lose to the preset wherever both set the same property. Include `.editorcn-content` in the selector, or scope it under your own class.
