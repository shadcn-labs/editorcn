import {
  RiAlignCenter,
  RiAlignLeft,
  RiAlignRight,
  RiArrowDownSLine,
  RiBold,
  RiBracesLine,
  RiCheckLine,
  RiCodeBoxLine,
  RiCodeLine,
  RiDeleteBinLine,
  RiDraggable,
  RiFileCopyLine,
  RiFileTextLine,
  RiHeading,
  RiImageLine,
  RiItalic,
  RiLink,
  RiLinkUnlink,
  RiListCheck,
  RiListOrdered,
  RiListUnordered,
  RiQuoteText,
  RiSearchLine,
  RiSeparator,
  RiStrikethrough,
  RiTableLine,
  RiText,
  RiUnderline,
} from "@remixicon/react";

import type { BlockEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

/**
 * Remix Icon preset for `BlockEditor`.
 *
 * Pairs with `"iconLibrary": "remixicon"` in `components.json`
 * (`@remixicon/react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { remixBlockEditorIcons } from "@/components/block-editor/icons-remix";
 *
 * <BlockEditor editor={editor} icons={remixBlockEditorIcons} />;
 * ```
 */
export const remixBlockEditorIcons: BlockEditorIcons = {
  alignCenterIcon: <RiAlignCenter />,
  alignLeftIcon: <RiAlignLeft />,
  alignRightIcon: <RiAlignRight />,
  boldIcon: <RiBold />,
  checkIcon: <RiCheckLine />,
  codeBlockLanguageIcon: <RiBracesLine />,
  codeIcon: <RiCodeLine />,
  copyIcon: <RiFileCopyLine />,
  deleteIcon: <RiDeleteBinLine />,
  dragHandleIcon: <RiDraggable className="block-editor-drag-handle-icon" />,
  dropdownArrowIcon: <RiArrowDownSLine size={12} />,
  fallbackIcon: <RiFileTextLine />,
  italicIcon: <RiItalic />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <RiLink />,
  searchIcon: <RiSearchLine size={14} />,
  slashBlockquoteIcon: <RiQuoteText />,
  slashBulletListIcon: <RiListUnordered />,
  slashCodeBlockIcon: <RiCodeBoxLine />,
  slashDividerIcon: <RiSeparator />,
  slashHeadingIcon: <RiHeading />,
  slashImageIcon: <RiImageLine />,
  slashOrderedListIcon: <RiListOrdered />,
  slashTableIcon: <RiTableLine />,
  slashTaskListIcon: <RiListCheck />,
  slashTextIcon: <RiText />,
  strikethroughIcon: <RiStrikethrough />,
  underlineIcon: <RiUnderline />,
  unlinkIcon: <RiLinkUnlink />,
};
