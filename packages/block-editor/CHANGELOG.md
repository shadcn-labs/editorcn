# @editorcn/block-editor

## 0.5.0

The block editor chrome is now styled with Tailwind classes instead of a hand-written stylesheet. It looks the same, but npm installs need two lines of Tailwind setup.

### Upgrading

In the CSS file that imports `tailwindcss`, import the block editor theme and add the package to Tailwind's sources (the path is relative to that file):

```css
@import "@editorcn/block-editor/theme.css";
@source "../node_modules/@editorcn/block-editor/dist";
```

Keep importing `@editorcn/block-editor/style.css` as before. Without `@source`, the bubble menu, slash menu and drag handle are unstyled, and the touch toolbar shows on desktop. Without the theme import, the build still passes, but the menus don't animate.

### Changes

- The drag handle, bubble menu, dropdowns, color picker, link form, slash menu and touch toolbar use Tailwind utility classes. The old class names (`.block-editor-bubble-menu`, `.block-editor-slash-menu` and so on) stay on the elements, so your CSS that targets them keeps working. Because the utilities live in Tailwind's `utilities` layer, plain CSS now overrides them without `!important`.
- New `preset` prop on `BlockEditor`: `"block"` (default, the current look) or `"document"` (the toolbar editor's typography). The content element gets `editorcn-content` and `data-preset`.
- Animations are Tailwind theme variables (`--animate-block-editor-bubble-pop-in`, `--animate-block-editor-slide-in`, `--animate-block-editor-fade-in`, `--animate-block-editor-fade-out`) in the new `theme.css` export. Override one by setting it again in your own `@theme` block.
- The bubble menu keyframe is renamed from `bubble-pop-in` to `block-editor-bubble-pop-in`.

## 0.4.1

- The package now ships `dist`. 0.4.0 only contained `src`, so importing it failed with `ERR_MODULE_NOT_FOUND`.
