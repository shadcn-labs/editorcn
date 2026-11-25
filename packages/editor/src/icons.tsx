import React from "react";

import { IconPlaceholder } from "./icon-placeholder";
import type { RichTextEditorIcons } from "./icon-types";
import { DEFAULT_LANGUAGE_ICONS } from "./language-icons";

// ---------------------------------------------------------------------------
// Embed toolbar icons (used by ResizableNodeView / EmbedToolbar)
// ---------------------------------------------------------------------------

type AlignDir = "left" | "center" | "right";

export const ALIGN_PATHS: Record<AlignDir, React.ReactNode> = {
  center: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="17" y1="12" x2="7" y2="12" />
      <line x1="19" y1="18" x2="5" y2="18" />
    </>
  ),
  left: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="15" y1="12" x2="3" y2="12" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </>
  ),
  right: (
    <>
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="12" x2="9" y2="12" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </>
  ),
};

export type { AlignDir };

export const AlignIcon = ({ dir }: { dir: AlignDir }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    {ALIGN_PATHS[dir]}
  </svg>
);

export const EditUrlIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const OpenInYouTubeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const DeleteEmbedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="rte-editor-icon"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const iconProps = { className: "rte-editor-icon" };

export const DEFAULT_ICONS: RichTextEditorIcons = {
  alignCenterControlIcon: (
    <IconPlaceholder
      lucide="TextAlignCenter"
      tabler="IconAlignCenter"
      hugeicons="TextAlignCenterIcon"
      phosphor="TextAlignCenterIcon"
      remixicon="RiAlignCenter"
      {...iconProps}
    />
  ),
  alignJustifyControlIcon: (
    <IconPlaceholder
      lucide="TextAlignJustify"
      tabler="IconAlignJustified"
      hugeicons="TextAlignJustifyCenterIcon"
      phosphor="TextAlignJustifyIcon"
      remixicon="RiAlignJustify"
      {...iconProps}
    />
  ),
  alignLeftControlIcon: (
    <IconPlaceholder
      lucide="TextAlignStart"
      tabler="IconAlignLeft"
      hugeicons="TextAlignLeftIcon"
      phosphor="TextAlignLeftIcon"
      remixicon="RiAlignLeft"
      {...iconProps}
    />
  ),
  alignRightControlIcon: (
    <IconPlaceholder
      lucide="TextAlignEnd"
      tabler="IconAlignRight"
      hugeicons="TextAlignRightIcon"
      phosphor="TextAlignRightIcon"
      remixicon="RiAlignRight"
      {...iconProps}
    />
  ),
  blockquoteControlIcon: (
    <IconPlaceholder
      lucide="TextQuote"
      tabler="IconQuote"
      hugeicons="LeftToRightBlockQuoteIcon"
      phosphor="QuotesIcon"
      remixicon="RiQuoteText"
      {...iconProps}
    />
  ),
  boldControlIcon: (
    <IconPlaceholder
      lucide="Bold"
      tabler="IconBold"
      hugeicons="BoldIcon"
      phosphor="TextBIcon"
      remixicon="RiBold"
      {...iconProps}
    />
  ),
  bulletListControlIcon: (
    <IconPlaceholder
      lucide="List"
      tabler="IconList"
      hugeicons="LeftToRightListBulletIcon"
      phosphor="ListBulletsIcon"
      remixicon="RiListUnordered"
      {...iconProps}
    />
  ),
  clearFormattingControlIcon: (
    <IconPlaceholder
      lucide="RemoveFormatting"
      tabler="IconEraser"
      hugeicons="TextClearIcon"
      phosphor="EraserIcon"
      remixicon="RiFormatClear"
      {...iconProps}
    />
  ),
  codeBlockControlIcon: (
    <IconPlaceholder
      lucide="SquareCode"
      tabler="IconSourceCode"
      hugeicons="SourceCodeSquareIcon"
      phosphor="CodeBlockIcon"
      remixicon="RiCodeBoxLine"
      {...iconProps}
    />
  ),
  codeControlIcon: (
    <IconPlaceholder
      lucide="Code"
      tabler="IconCode"
      hugeicons="SourceCodeIcon"
      phosphor="CodeIcon"
      remixicon="RiCodeLine"
      {...iconProps}
    />
  ),
  h1ControlIcon: (
    <IconPlaceholder
      lucide="Heading1"
      tabler="IconH1"
      hugeicons="Heading01Icon"
      phosphor="TextHOneIcon"
      remixicon="RiH1"
      {...iconProps}
    />
  ),
  h2ControlIcon: (
    <IconPlaceholder
      lucide="Heading2"
      tabler="IconH2"
      hugeicons="Heading02Icon"
      phosphor="TextHTwoIcon"
      remixicon="RiH2"
      {...iconProps}
    />
  ),
  h3ControlIcon: (
    <IconPlaceholder
      lucide="Heading3"
      tabler="IconH3"
      hugeicons="Heading03Icon"
      phosphor="TextHThreeIcon"
      remixicon="RiH3"
      {...iconProps}
    />
  ),
  h4ControlIcon: (
    <IconPlaceholder
      lucide="Heading4"
      tabler="IconH4"
      hugeicons="Heading04Icon"
      phosphor="TextHFourIcon"
      remixicon="RiH4"
      {...iconProps}
    />
  ),
  h5ControlIcon: (
    <IconPlaceholder
      lucide="Heading5"
      tabler="IconH5"
      hugeicons="Heading05Icon"
      phosphor="TextHFiveIcon"
      remixicon="RiH5"
      {...iconProps}
    />
  ),
  h6ControlIcon: (
    <IconPlaceholder
      lucide="Heading6"
      tabler="IconH6"
      hugeicons="Heading06Icon"
      phosphor="TextHSixIcon"
      remixicon="RiH6"
      {...iconProps}
    />
  ),
  highlightControlIcon: (
    <IconPlaceholder
      lucide="Highlighter"
      tabler="IconHighlight"
      hugeicons="HighlighterIcon"
      phosphor="HighlighterIcon"
      remixicon="RiMarkPenLine"
      {...iconProps}
    />
  ),
  hrControlIcon: (
    <IconPlaceholder
      lucide="Minus"
      tabler="IconMinus"
      hugeicons="MinusSignIcon"
      phosphor="MinusIcon"
      remixicon="RiSeparator"
      {...iconProps}
    />
  ),
  italicControlIcon: (
    <IconPlaceholder
      lucide="Italic"
      tabler="IconItalic"
      hugeicons="ItalicIcon"
      phosphor="TextItalicIcon"
      remixicon="RiItalic"
      {...iconProps}
    />
  ),
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: (
    <IconPlaceholder
      lucide="Link"
      tabler="IconLink"
      hugeicons="Link01Icon"
      phosphor="LinkIcon"
      remixicon="RiLink"
      {...iconProps}
    />
  ),
  orderedListControlIcon: (
    <IconPlaceholder
      lucide="ListOrdered"
      tabler="IconListNumbers"
      hugeicons="LeftToRightListNumberIcon"
      phosphor="ListNumbersIcon"
      remixicon="RiListOrdered"
      {...iconProps}
    />
  ),
  redoControlIcon: (
    <IconPlaceholder
      lucide="Redo2"
      tabler="IconArrowForwardUp"
      hugeicons="RedoIcon"
      phosphor="ArrowClockwiseIcon"
      remixicon="RiArrowGoForwardLine"
      {...iconProps}
    />
  ),
  strikeControlIcon: (
    <IconPlaceholder
      lucide="Strikethrough"
      tabler="IconStrikethrough"
      hugeicons="StrikethroughIcon"
      phosphor="TextStrikethroughIcon"
      remixicon="RiStrikethrough"
      {...iconProps}
    />
  ),
  subscriptControlIcon: (
    <IconPlaceholder
      lucide="Subscript"
      tabler="IconSubscript"
      hugeicons="SubscriptIcon"
      phosphor="TextSubscriptIcon"
      remixicon="RiSubscript"
      {...iconProps}
    />
  ),
  superscriptControlIcon: (
    <IconPlaceholder
      lucide="Superscript"
      tabler="IconSuperscript"
      hugeicons="SuperscriptIcon"
      phosphor="TextSuperscriptIcon"
      remixicon="RiSuperscript"
      {...iconProps}
    />
  ),
  underlineControlIcon: (
    <IconPlaceholder
      lucide="Underline"
      tabler="IconUnderline"
      hugeicons="UnderlineIcon"
      phosphor="TextUnderlineIcon"
      remixicon="RiUnderline"
      {...iconProps}
    />
  ),
  undoControlIcon: (
    <IconPlaceholder
      lucide="Undo2"
      tabler="IconArrowBackUp"
      hugeicons="UndoIcon"
      phosphor="ArrowCounterClockwiseIcon"
      remixicon="RiArrowGoBackLine"
      {...iconProps}
    />
  ),
  unlinkControlIcon: (
    <IconPlaceholder
      lucide="Link2Off"
      tabler="IconUnlink"
      hugeicons="UnlinkIcon"
      phosphor="LinkBreakIcon"
      remixicon="RiLinkUnlink"
      {...iconProps}
    />
  ),
};
