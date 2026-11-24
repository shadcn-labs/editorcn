# @editorcn/editor

## 0.5.0

The editor chrome is now styled with Tailwind classes instead of a hand-written stylesheet. It looks the same, but npm installs need two lines of Tailwind setup.

### Upgrading

In the CSS file that imports `tailwindcss`, import the editor theme and add the package to Tailwind's sources (the path is relative to that file):

```css
@import "@editorcn/editor/theme.css";
@source "../node_modules/@editorcn/editor/dist";
```

Keep importing `@editorcn/editor/style.css` as before. Without `@source`, the toolbar, menus and popovers are unstyled. Without the theme import, the build still passes, but menus and the toolbar fade don't animate.

### Changes

- The toolbar, controls, bubble menu, dropdowns, link editor, embed toolbar and footer use Tailwind utility classes. The old class names (`.rte-toolbar`, `.rte-bubble-menu` and so on) stay on the elements, so your CSS that targets them keeps working. Because the utilities live in Tailwind's `utilities` layer, plain CSS now overrides them without `!important`.
- `className` on `Toolbar`, `Footer`, `ControlsGroup` and `Content` is merged last, so it now wins over the variant styles. Before, rules like `.rte-root[data-variant="default"] .rte-toolbar[data-sticky]` beat it.
- New `preset` prop on `RichTextEditor`: `"document"` (default, the current look) or `"block"` (the block editor's typography). The content element gets `editorcn-content` and `data-preset`.
- Animations are Tailwind theme variables (`--animate-rte-bubble-pop-in`, `--animate-rte-toolbar-fade`) in the new `theme.css` export. Override one by setting it again in your own `@theme` block.
- The embed loading state uses Tailwind's `animate-pulse`.
