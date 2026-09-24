import {
  IconAlignCenter,
  IconAlignJustified,
  IconAlignLeft,
  IconAlignRight,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconCode,
  IconEraser,
  IconH1,
  IconH2,
  IconH3,
  IconH4,
  IconH5,
  IconH6,
  IconHighlight,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconQuote,
  IconSourceCode,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconUnderline,
  IconUnlink,
} from "@tabler/icons-react";

import type { RichTextEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

const iconProps = { className: "rte-editor-icon" };

/**
 * Tabler Icons preset for `RichTextEditor`.
 *
 * Pairs with `"iconLibrary": "tabler"` in `components.json`
 * (`@tabler/icons-react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { tablerEditorIcons } from "@/components/editor/icons-tabler";
 *
 * <RichTextEditor editor={editor} icons={tablerEditorIcons} />;
 * ```
 */
export const tablerEditorIcons: RichTextEditorIcons = {
  alignCenterControlIcon: <IconAlignCenter {...iconProps} />,
  alignJustifyControlIcon: <IconAlignJustified {...iconProps} />,
  alignLeftControlIcon: <IconAlignLeft {...iconProps} />,
  alignRightControlIcon: <IconAlignRight {...iconProps} />,
  blockquoteControlIcon: <IconQuote {...iconProps} />,
  boldControlIcon: <IconBold {...iconProps} />,
  bulletListControlIcon: <IconList {...iconProps} />,
  clearFormattingControlIcon: <IconEraser {...iconProps} />,
  codeBlockControlIcon: <IconSourceCode {...iconProps} />,
  codeControlIcon: <IconCode {...iconProps} />,
  h1ControlIcon: <IconH1 {...iconProps} />,
  h2ControlIcon: <IconH2 {...iconProps} />,
  h3ControlIcon: <IconH3 {...iconProps} />,
  h4ControlIcon: <IconH4 {...iconProps} />,
  h5ControlIcon: <IconH5 {...iconProps} />,
  h6ControlIcon: <IconH6 {...iconProps} />,
  highlightControlIcon: <IconHighlight {...iconProps} />,
  hrControlIcon: <IconMinus {...iconProps} />,
  italicControlIcon: <IconItalic {...iconProps} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <IconLink {...iconProps} />,
  orderedListControlIcon: <IconListNumbers {...iconProps} />,
  redoControlIcon: <IconArrowForwardUp {...iconProps} />,
  strikeControlIcon: <IconStrikethrough {...iconProps} />,
  subscriptControlIcon: <IconSubscript {...iconProps} />,
  superscriptControlIcon: <IconSuperscript {...iconProps} />,
  underlineControlIcon: <IconUnderline {...iconProps} />,
  undoControlIcon: <IconArrowBackUp {...iconProps} />,
  unlinkControlIcon: <IconUnlink {...iconProps} />,
};
