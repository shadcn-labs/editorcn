# @editorcn/editor

## 0.6.0

### Changes

- The source follows the extensions layout: `core/`, `icons/`, `ui/` and a folder per feature. Components in `ui/` have plain names (`Button`, `Dropdown`, `DropdownItem`, `DropdownSeparator`, `Separator`, `Overlay`) instead of `Rte*` / `Bubble*`.
- The Base UI primitives moved from `ui/` to `primitives/base/` and their Radix twins to `primitives/radix/`. Registry installs get them at `editor/primitives/<name>.tsx`.
- `rte-text-editor.tsx` is now `rich-text-editor.tsx`, and the other `rte-*.tsx` files lost their prefix.
- No change to exports, styles or behavior for npm users. Registry users get new file paths; see the [changelog entry](https://www.rtecn.space/docs/changelog/2026-11-28-ui-structure).

## 0.5.3

### Fixes

- When the toolbar wraps onto more than one row, the first group on each new row no longer starts with a stray separator. The toolbar marks those groups with `data-line-start` and updates them when its width changes.
- `RichTextEditor.Control` has a display name, so `react/display-name` no longer flags it.
- The Twitter embed's lint suppression uses an `oxlint-disable` comment, so ESLint no longer reports `Definition for rule 'promise/avoid-new' was not found` in projects that install the editor through the registry.

## 0.5.1

### Fixes

- Dialog controls opened from the toolbar (for example the YouTube embed) get the trigger's ref, `aria-*` attributes and click event, so focus returns to the button when the dialog closes.
- The toggle used by toolbar controls forwards its ref on React 18.

### Dependencies

- `@tiptap/react` peer range is now `>=3.0.1 <4`. The bubble menu imports `@tiptap/react/menus`, which 3.0.0 doesn't export.
- `lucide-react` range is now `>=0.400.0 <2.0.0`, so projects on lucide-react 1.x don't get a second copy.

### Changes

- No visible change to the icons. `icons.tsx` is now shared with the shadcn registry (where it follows the project's `iconLibrary`), and the npm build still renders lucide icons.

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
