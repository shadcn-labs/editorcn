import {
  RiAlignCenter,
  RiAlignJustify,
  RiAlignLeft,
  RiAlignRight,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeBoxLine,
  RiCodeLine,
  RiFormatClear,
  RiH1,
  RiH2,
  RiH3,
  RiH4,
  RiH5,
  RiH6,
  RiItalic,
  RiLink,
  RiLinkUnlink,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiQuoteText,
  RiSeparator,
  RiStrikethrough,
  RiSubscript,
  RiSuperscript,
  RiUnderline,
} from "@remixicon/react";

import type { RichTextEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

const iconProps = { className: "rte-editor-icon" };

/**
 * Remix Icon preset for `RichTextEditor`.
 *
 * Pairs with `"iconLibrary": "remixicon"` in `components.json`
 * (`@remixicon/react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { remixEditorIcons } from "@/components/editor/icons-remix";
 *
 * <RichTextEditor editor={editor} icons={remixEditorIcons} />;
 * ```
 */
export const remixEditorIcons: RichTextEditorIcons = {
  alignCenterControlIcon: <RiAlignCenter {...iconProps} />,
  alignJustifyControlIcon: <RiAlignJustify {...iconProps} />,
  alignLeftControlIcon: <RiAlignLeft {...iconProps} />,
  alignRightControlIcon: <RiAlignRight {...iconProps} />,
  blockquoteControlIcon: <RiQuoteText {...iconProps} />,
  boldControlIcon: <RiBold {...iconProps} />,
  bulletListControlIcon: <RiListUnordered {...iconProps} />,
  clearFormattingControlIcon: <RiFormatClear {...iconProps} />,
  codeBlockControlIcon: <RiCodeBoxLine {...iconProps} />,
  codeControlIcon: <RiCodeLine {...iconProps} />,
  h1ControlIcon: <RiH1 {...iconProps} />,
  h2ControlIcon: <RiH2 {...iconProps} />,
  h3ControlIcon: <RiH3 {...iconProps} />,
  h4ControlIcon: <RiH4 {...iconProps} />,
  h5ControlIcon: <RiH5 {...iconProps} />,
  h6ControlIcon: <RiH6 {...iconProps} />,
  highlightControlIcon: <RiMarkPenLine {...iconProps} />,
  hrControlIcon: <RiSeparator {...iconProps} />,
  italicControlIcon: <RiItalic {...iconProps} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <RiLink {...iconProps} />,
  orderedListControlIcon: <RiListOrdered {...iconProps} />,
  redoControlIcon: <RiArrowGoForwardLine {...iconProps} />,
  strikeControlIcon: <RiStrikethrough {...iconProps} />,
  subscriptControlIcon: <RiSubscript {...iconProps} />,
  superscriptControlIcon: <RiSuperscript {...iconProps} />,
  underlineControlIcon: <RiUnderline {...iconProps} />,
  undoControlIcon: <RiArrowGoBackLine {...iconProps} />,
  unlinkControlIcon: <RiLinkUnlink {...iconProps} />,
};
