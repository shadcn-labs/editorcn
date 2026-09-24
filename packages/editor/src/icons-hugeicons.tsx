import {
  BoldIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  Heading04Icon,
  Heading05Icon,
  Heading06Icon,
  HighlighterIcon,
  ItalicIcon,
  LeftToRightBlockQuoteIcon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  MinusSignIcon,
  RedoIcon,
  SourceCodeIcon,
  SourceCodeSquareIcon,
  StrikethroughIcon,
  SubscriptIcon,
  SuperscriptIcon,
  TextAlignCenterIcon,
  TextAlignJustifyCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextClearIcon,
  UnderlineIcon,
  UndoIcon,
  UnlinkIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import type { RichTextEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

const iconProps = {
  className: "rte-editor-icon",
  strokeWidth: 2,
} as const;

const H = ({ icon }: { icon: typeof BoldIcon }) => (
  <HugeiconsIcon icon={icon} {...iconProps} />
);

/**
 * HugeIcons preset for `RichTextEditor`.
 *
 * Pairs with `"iconLibrary": "hugeicons"` in `components.json`
 * (`@hugeicons/react` + `@hugeicons/core-free-icons`). Pass it via the
 * `icons` prop:
 *
 * ```tsx
 * import { hugeiconsEditorIcons } from "@/components/editor/icons-hugeicons";
 *
 * <RichTextEditor editor={editor} icons={hugeiconsEditorIcons} />;
 * ```
 */
export const hugeiconsEditorIcons: RichTextEditorIcons = {
  alignCenterControlIcon: <H icon={TextAlignCenterIcon} />,
  alignJustifyControlIcon: <H icon={TextAlignJustifyCenterIcon} />,
  alignLeftControlIcon: <H icon={TextAlignLeftIcon} />,
  alignRightControlIcon: <H icon={TextAlignRightIcon} />,
  blockquoteControlIcon: <H icon={LeftToRightBlockQuoteIcon} />,
  boldControlIcon: <H icon={BoldIcon} />,
  bulletListControlIcon: <H icon={LeftToRightListBulletIcon} />,
  clearFormattingControlIcon: <H icon={TextClearIcon} />,
  codeBlockControlIcon: <H icon={SourceCodeSquareIcon} />,
  codeControlIcon: <H icon={SourceCodeIcon} />,
  h1ControlIcon: <H icon={Heading01Icon} />,
  h2ControlIcon: <H icon={Heading02Icon} />,
  h3ControlIcon: <H icon={Heading03Icon} />,
  h4ControlIcon: <H icon={Heading04Icon} />,
  h5ControlIcon: <H icon={Heading05Icon} />,
  h6ControlIcon: <H icon={Heading06Icon} />,
  highlightControlIcon: <H icon={HighlighterIcon} />,
  hrControlIcon: <H icon={MinusSignIcon} />,
  italicControlIcon: <H icon={ItalicIcon} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <H icon={Link01Icon} />,
  orderedListControlIcon: <H icon={LeftToRightListNumberIcon} />,
  redoControlIcon: <H icon={RedoIcon} />,
  strikeControlIcon: <H icon={StrikethroughIcon} />,
  subscriptControlIcon: <H icon={SubscriptIcon} />,
  superscriptControlIcon: <H icon={SuperscriptIcon} />,
  underlineControlIcon: <H icon={UnderlineIcon} />,
  undoControlIcon: <H icon={UndoIcon} />,
  unlinkControlIcon: <H icon={UnlinkIcon} />,
};
