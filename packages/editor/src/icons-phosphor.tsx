import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Code,
  CodeBlock,
  Eraser,
  Highlighter,
  Link,
  LinkBreak,
  ListBullets,
  ListNumbers,
  Minus,
  Quotes,
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextHFive,
  TextHFour,
  TextHOne,
  TextHSix,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextSubscript,
  TextSuperscript,
  TextUnderline,
} from "@phosphor-icons/react";

import type { RichTextEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

const iconProps = { className: "rte-editor-icon" };

/**
 * Phosphor Icons preset for `RichTextEditor`.
 *
 * Pairs with `"iconLibrary": "phosphor"` in `components.json`
 * (`@phosphor-icons/react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { phosphorEditorIcons } from "@/components/editor/icons-phosphor";
 *
 * <RichTextEditor editor={editor} icons={phosphorEditorIcons} />;
 * ```
 */
export const phosphorEditorIcons: RichTextEditorIcons = {
  alignCenterControlIcon: <TextAlignCenter {...iconProps} />,
  alignJustifyControlIcon: <TextAlignJustify {...iconProps} />,
  alignLeftControlIcon: <TextAlignLeft {...iconProps} />,
  alignRightControlIcon: <TextAlignRight {...iconProps} />,
  blockquoteControlIcon: <Quotes {...iconProps} />,
  boldControlIcon: <TextB {...iconProps} />,
  bulletListControlIcon: <ListBullets {...iconProps} />,
  clearFormattingControlIcon: <Eraser {...iconProps} />,
  codeBlockControlIcon: <CodeBlock {...iconProps} />,
  codeControlIcon: <Code {...iconProps} />,
  h1ControlIcon: <TextHOne {...iconProps} />,
  h2ControlIcon: <TextHTwo {...iconProps} />,
  h3ControlIcon: <TextHThree {...iconProps} />,
  h4ControlIcon: <TextHFour {...iconProps} />,
  h5ControlIcon: <TextHFive {...iconProps} />,
  h6ControlIcon: <TextHSix {...iconProps} />,
  highlightControlIcon: <Highlighter {...iconProps} />,
  hrControlIcon: <Minus {...iconProps} />,
  italicControlIcon: <TextItalic {...iconProps} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <Link {...iconProps} />,
  orderedListControlIcon: <ListNumbers {...iconProps} />,
  redoControlIcon: <ArrowClockwise {...iconProps} />,
  strikeControlIcon: <TextStrikethrough {...iconProps} />,
  subscriptControlIcon: <TextSubscript {...iconProps} />,
  superscriptControlIcon: <TextSuperscript {...iconProps} />,
  underlineControlIcon: <TextUnderline {...iconProps} />,
  undoControlIcon: <ArrowCounterClockwise {...iconProps} />,
  unlinkControlIcon: <LinkBreak {...iconProps} />,
};
