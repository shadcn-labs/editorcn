# @editorcn/static-renderer

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
