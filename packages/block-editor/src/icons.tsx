import React from "react";

import { IconPlaceholder } from "./icon-placeholder";
import type { BlockEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

const headingIcons: Record<number, React.ReactNode> = {
  1: (
    <IconPlaceholder
      lucide="Heading1"
      tabler="IconH1"
      hugeicons="Heading01Icon"
      phosphor="TextHOneIcon"
      remixicon="RiH1"
    />
  ),
  2: (
    <IconPlaceholder
      lucide="Heading2"
      tabler="IconH2"
      hugeicons="Heading02Icon"
      phosphor="TextHTwoIcon"
      remixicon="RiH2"
    />
  ),
  3: (
    <IconPlaceholder
      lucide="Heading3"
      tabler="IconH3"
      hugeicons="Heading03Icon"
      phosphor="TextHThreeIcon"
      remixicon="RiH3"
    />
  ),
};

export const HeadingIcon = ({ level }: { level: number }) =>
  headingIcons[level] ?? (
    <IconPlaceholder
      lucide="Heading"
      tabler="IconHeading"
      hugeicons="Heading01Icon"
      phosphor="TextH"
      remixicon="RiHeading"
    />
  );

export const DEFAULT_ICONS: BlockEditorIcons = {
  alignCenterIcon: (
    <IconPlaceholder
      lucide="AlignCenter"
      tabler="IconAlignCenter"
      hugeicons="TextAlignCenterIcon"
      phosphor="TextAlignCenterIcon"
      remixicon="RiAlignCenter"
    />
  ),
  alignLeftIcon: (
    <IconPlaceholder
      lucide="AlignLeft"
      tabler="IconAlignLeft"
      hugeicons="TextAlignLeftIcon"
      phosphor="TextAlignLeftIcon"
      remixicon="RiAlignLeft"
    />
  ),
  alignRightIcon: (
    <IconPlaceholder
      lucide="AlignRight"
      tabler="IconAlignRight"
      hugeicons="TextAlignRightIcon"
      phosphor="TextAlignRightIcon"
      remixicon="RiAlignRight"
    />
  ),
  boldIcon: (
    <IconPlaceholder
      lucide="Bold"
      tabler="IconBold"
      hugeicons="BoldIcon"
      phosphor="TextBIcon"
      remixicon="RiBold"
    />
  ),
  checkIcon: (
    <IconPlaceholder
      lucide="Check"
      tabler="IconCheck"
      hugeicons="Tick01Icon"
      phosphor="CheckIcon"
      remixicon="RiCheckLine"
    />
  ),
  codeBlockLanguageIcon: (
    <IconPlaceholder
      lucide="Braces"
      tabler="IconBraces"
      hugeicons="BracesIcon"
      phosphor="BracketsCurlyIcon"
      remixicon="RiBracesLine"
    />
  ),
  codeIcon: (
    <IconPlaceholder
      lucide="Code"
      tabler="IconCode"
      hugeicons="SourceCodeIcon"
      phosphor="CodeIcon"
      remixicon="RiCodeLine"
    />
  ),
  copyIcon: (
    <IconPlaceholder
      lucide="Copy"
      tabler="IconCopy"
      hugeicons="CopyIcon"
      phosphor="CopyIcon"
      remixicon="RiFileCopyLine"
    />
  ),
  deleteIcon: (
    <IconPlaceholder
      lucide="Trash2"
      tabler="IconTrash"
      hugeicons="Delete02Icon"
      phosphor="TrashIcon"
      remixicon="RiDeleteBinLine"
    />
  ),
  dragHandleIcon: (
    <IconPlaceholder
      lucide="GripVertical"
      tabler="IconGripVertical"
      hugeicons="Drag01Icon"
      phosphor="DotsSixVerticalIcon"
      remixicon="RiDraggable"
      className="block-editor-drag-handle-icon"
    />
  ),
  dropdownArrowIcon: (
    <IconPlaceholder
      lucide="ChevronDown"
      tabler="IconChevronDown"
      hugeicons="ChevronDownIcon"
      phosphor="CaretDownIcon"
      remixicon="RiArrowDownSLine"
      size={12}
    />
  ),
  fallbackIcon: (
    <IconPlaceholder
      lucide="FileText"
      tabler="IconFileText"
      hugeicons="FileTextIcon"
      phosphor="FileTextIcon"
      remixicon="RiFileTextLine"
    />
  ),
  italicIcon: (
    <IconPlaceholder
      lucide="Italic"
      tabler="IconItalic"
      hugeicons="ItalicIcon"
      phosphor="TextItalicIcon"
      remixicon="RiItalic"
    />
  ),
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkIcon: (
    <IconPlaceholder
      lucide="Link"
      tabler="IconLink"
      hugeicons="Link01Icon"
      phosphor="LinkIcon"
      remixicon="RiLink"
    />
  ),
  searchIcon: (
    <IconPlaceholder
      lucide="Search"
      tabler="IconSearch"
      hugeicons="Search01Icon"
      phosphor="MagnifyingGlassIcon"
      remixicon="RiSearchLine"
      size={14}
    />
  ),
  slashBlockquoteIcon: (
    <IconPlaceholder
      lucide="TextQuote"
      tabler="IconQuote"
      hugeicons="LeftToRightBlockQuoteIcon"
      phosphor="QuotesIcon"
      remixicon="RiQuoteText"
    />
  ),
  slashBulletListIcon: (
    <IconPlaceholder
      lucide="List"
      tabler="IconList"
      hugeicons="LeftToRightListBulletIcon"
      phosphor="ListBulletsIcon"
      remixicon="RiListUnordered"
    />
  ),
  slashCalloutIcon: (
    <IconPlaceholder
      lucide="MessageSquareWarning"
      tabler="IconMessageExclamation"
      hugeicons="MessageNotification01Icon"
      phosphor="WarningCircleIcon"
      remixicon="RiErrorWarningLine"
    />
  ),
  slashCodeBlockIcon: (
    <IconPlaceholder
      lucide="SquareCode"
      tabler="IconSourceCode"
      hugeicons="SourceCodeSquareIcon"
      phosphor="CodeBlockIcon"
      remixicon="RiCodeBoxLine"
    />
  ),
  slashDividerIcon: (
    <IconPlaceholder
      lucide="Minus"
      tabler="IconMinus"
      hugeicons="MinusSignIcon"
      phosphor="MinusIcon"
      remixicon="RiSeparator"
    />
  ),
  slashExportMarkdownIcon: (
    <IconPlaceholder
      lucide="FileDown"
      tabler="IconFileDownload"
      hugeicons="FileDownloadIcon"
      phosphor="FileArrowDownIcon"
      remixicon="RiFileDownloadLine"
    />
  ),
  slashHeadingIcon: (
    <IconPlaceholder
      lucide="Heading"
      tabler="IconHeading"
      hugeicons="Heading01Icon"
      phosphor="TextHIcon"
      remixicon="RiHeading"
    />
  ),
  slashImageIcon: (
    <IconPlaceholder
      lucide="Image"
      tabler="IconPhoto"
      hugeicons="Image01Icon"
      phosphor="ImageIcon"
      remixicon="RiImageLine"
    />
  ),
  slashImportMarkdownIcon: (
    <IconPlaceholder
      lucide="FileUp"
      tabler="IconFileUpload"
      hugeicons="FileUploadIcon"
      phosphor="FileArrowUpIcon"
      remixicon="RiFileUploadLine"
    />
  ),
  slashOrderedListIcon: (
    <IconPlaceholder
      lucide="ListOrdered"
      tabler="IconListNumbers"
      hugeicons="LeftToRightListNumberIcon"
      phosphor="ListNumbersIcon"
      remixicon="RiListOrdered"
    />
  ),
  slashTableIcon: (
    <IconPlaceholder
      lucide="Table"
      tabler="IconTable"
      hugeicons="Table01Icon"
      phosphor="TableIcon"
      remixicon="RiTableLine"
    />
  ),
  slashTaskListIcon: (
    <IconPlaceholder
      lucide="ListTodo"
      tabler="IconChecklist"
      hugeicons="Task01Icon"
      phosphor="ListChecksIcon"
      remixicon="RiListCheck"
    />
  ),
  slashTextIcon: (
    <IconPlaceholder
      lucide="Type"
      tabler="IconTypography"
      hugeicons="TextIcon"
      phosphor="TextTSlashIcon"
      remixicon="RiText"
    />
  ),
  slashToggleIcon: (
    <IconPlaceholder
      lucide="ChevronRight"
      tabler="IconChevronRight"
      hugeicons="ArrowRight01Icon"
      phosphor="CaretRightIcon"
      remixicon="RiArrowRightSLine"
    />
  ),
  strikethroughIcon: (
    <IconPlaceholder
      lucide="Strikethrough"
      tabler="IconStrikethrough"
      hugeicons="StrikethroughIcon"
      phosphor="TextStrikethroughIcon"
      remixicon="RiStrikethrough"
    />
  ),
  underlineIcon: (
    <IconPlaceholder
      lucide="Underline"
      tabler="IconUnderline"
      hugeicons="UnderlineIcon"
      phosphor="TextUnderlineIcon"
      remixicon="RiUnderline"
    />
  ),
  unlinkIcon: (
    <IconPlaceholder
      lucide="Link2Off"
      tabler="IconUnlink"
      hugeicons="UnlinkIcon"
      phosphor="LinkSimpleBreakIcon"
      remixicon="RiLinkUnlink"
    />
  ),
};
