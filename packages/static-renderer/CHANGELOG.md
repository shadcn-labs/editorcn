# @editorcn/static-renderer

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
