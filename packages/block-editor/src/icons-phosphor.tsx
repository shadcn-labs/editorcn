import {
  BracketsCurly,
  CaretDown,
  Check,
  Code,
  CodeBlock,
  Copy,
  DotsSixVertical,
  FileText,
  Image,
  Link,
  LinkBreak,
  ListBullets,
  ListChecks,
  ListNumbers,
  MagnifyingGlass,
  Minus,
  Quotes,
  Table,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextH,
  TextItalic,
  TextStrikethrough,
  TextT,
  TextUnderline,
  Trash,
} from "@phosphor-icons/react";

import type { BlockEditorIcons } from "./icons";
import { DEFAULT_LANGUAGE_ICONS } from "./icons";

/**
 * Phosphor Icons preset for `BlockEditor`.
 *
 * Pairs with `"iconLibrary": "phosphor"` in `components.json`
 * (`@phosphor-icons/react`). Pass it via the `icons` prop:
 *
 * ```tsx
 * import { phosphorBlockEditorIcons } from "@/components/block-editor/icons-phosphor";
 *
 * <BlockEditor editor={editor} icons={phosphorBlockEditorIcons} />;
 * ```
 */
export const phosphorBlockEditorIcons: BlockEditorIcons = {
  alignCenterIcon: <TextAlignCenter />,
  alignLeftIcon: <TextAlignLeft />,
  alignRightIcon: <TextAlignRight />,
  boldIcon: <TextB />,
  checkIcon: <Check />,
  codeBlockLanguageIcon: <BracketsCurly />,
  codeIcon: <Code />,
  copyIcon: <Copy />,
  deleteIcon: <Trash />,
  dragHandleIcon: <DotsSixVertical className="block-editor-drag-handle-icon" />,
  dropdownArrowIcon: <CaretDown size={12} />,
  fallbackIcon: <FileText />,
  italicIcon: <TextItalic />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: <Link />,
  searchIcon: <MagnifyingGlass size={14} />,
  slashBlockquoteIcon: <Quotes />,
  slashBulletListIcon: <ListBullets />,
  slashCodeBlockIcon: <CodeBlock />,
  slashDividerIcon: <Minus />,
  slashHeadingIcon: <TextH />,
  slashImageIcon: <Image />,
  slashOrderedListIcon: <ListNumbers />,
  slashTableIcon: <Table />,
  slashTaskListIcon: <ListChecks />,
  slashTextIcon: <TextT />,
  strikethroughIcon: <TextStrikethrough />,
  underlineIcon: <TextUnderline />,
  unlinkIcon: <LinkBreak />,
};
