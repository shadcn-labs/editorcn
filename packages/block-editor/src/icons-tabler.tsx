import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconBold,
  IconBraces,
  IconCheck,
  IconChecklist,
  IconChevronDown,
  IconCode,
  IconCopy,
  IconFileText,
  IconGripVertical,
  IconHeading,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconMinus,
  IconPhoto,
  IconQuote,
  IconSearch,
  IconSourceCode,
  IconStrikethrough,
  IconTable,
  IconTrash,
  IconTypography,
  IconUnderline,
  IconUnlink,
} from "@tabler/icons-react";

import type { BlockEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

/**
 * Tabler Icons preset for `BlockEditor`.
 *
 * Pairs with `"iconLibrary": "tabler"` in `components.json`
 * (`@tabler/icons-react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { tablerBlockEditorIcons } from "@/components/block-editor/icons-tabler";
 *
 * <BlockEditor editor={editor} icons={tablerBlockEditorIcons} />;
 * ```
 */
export const tablerBlockEditorIcons: BlockEditorIcons = {
  alignCenterIcon: <IconAlignCenter />,
  alignLeftIcon: <IconAlignLeft />,
  alignRightIcon: <IconAlignRight />,
  boldIcon: <IconBold />,
  checkIcon: <IconCheck />,
  codeBlockLanguageIcon: <IconBraces />,
  codeIcon: <IconCode />,
  copyIcon: <IconCopy />,
  deleteIcon: <IconTrash />,
  dragHandleIcon: (
    <IconGripVertical className="block-editor-drag-handle-icon" />
  ),
  dropdownArrowIcon: <IconChevronDown size={12} />,
  fallbackIcon: <IconFileText />,
  italicIcon: <IconItalic />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <IconLink />,
  searchIcon: <IconSearch size={14} />,
  slashBlockquoteIcon: <IconQuote />,
  slashBulletListIcon: <IconList />,
  slashCodeBlockIcon: <IconSourceCode />,
  slashDividerIcon: <IconMinus />,
  slashHeadingIcon: <IconHeading />,
  slashImageIcon: <IconPhoto />,
  slashOrderedListIcon: <IconListNumbers />,
  slashTableIcon: <IconTable />,
  slashTaskListIcon: <IconChecklist />,
  slashTextIcon: <IconTypography />,
  strikethroughIcon: <IconStrikethrough />,
  underlineIcon: <IconUnderline />,
  unlinkIcon: <IconUnlink />,
};
