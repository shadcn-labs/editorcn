import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Italic,
  Link,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  TextQuote,
  Underline,
  Undo2,
} from "lucide-react";
import React from "react";

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

export interface RichTextEditorIcons {
  boldControlIcon: React.ReactNode;
  italicControlIcon: React.ReactNode;
  underlineControlIcon: React.ReactNode;
  strikeControlIcon: React.ReactNode;
  clearFormattingControlIcon: React.ReactNode;
  codeControlIcon: React.ReactNode;
  codeBlockControlIcon: React.ReactNode;
  h1ControlIcon: React.ReactNode;
  h2ControlIcon: React.ReactNode;
  h3ControlIcon: React.ReactNode;
  h4ControlIcon: React.ReactNode;
  h5ControlIcon: React.ReactNode;
  h6ControlIcon: React.ReactNode;
  bulletListControlIcon: React.ReactNode;
  orderedListControlIcon: React.ReactNode;
  blockquoteControlIcon: React.ReactNode;
  hrControlIcon: React.ReactNode;
  linkControlIcon: React.ReactNode;
  unlinkControlIcon: React.ReactNode;
  undoControlIcon: React.ReactNode;
  redoControlIcon: React.ReactNode;
  alignLeftControlIcon: React.ReactNode;
  alignCenterControlIcon: React.ReactNode;
  alignRightControlIcon: React.ReactNode;
  alignJustifyControlIcon: React.ReactNode;
  highlightControlIcon: React.ReactNode;
  subscriptControlIcon: React.ReactNode;
  superscriptControlIcon: React.ReactNode;
  languageIcons: Record<string, React.ReactNode>;
}

const iconProps = { className: "rte-editor-icon" };

const LangIcon = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

export const DEFAULT_LANGUAGE_ICONS: Record<string, React.ReactNode> = {
  bash: (
    <LangIcon>
      <rect x="2.5" y="4" width="19" height="16" rx="2" />
      <path d="M6.5 9.5l3.5 3-3.5 3" />
      <path d="M12 15.5h5.5" />
    </LangIcon>
  ),
  c: (
    <LangIcon>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.6 9.3a4.5 4.5 0 1 0 0 5.4" />
    </LangIcon>
  ),
  cpp: (
    <LangIcon>
      <circle cx="9.5" cy="12" r="6.5" />
      <path d="M12.3 9.7a3.3 3.3 0 1 0 0 4.6" />
      <path d="M15.7 10.5v3M14.2 12h3" />
      <path d="M19.3 10.5v3M17.8 12h3" />
    </LangIcon>
  ),
  css: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.7 7.5l-1 9" />
      <path d="M15.3 7.5l-1 9" />
      <path d="M7 10.3h11" />
      <path d="M6.5 14.3h11" />
    </LangIcon>
  ),
  go: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12.6 9.7A3.3 3.3 0 1 0 12.6 14.3" />
      <path d="M12.6 12h-1.9" />
      <circle cx="17" cy="12" r="2.9" />
    </LangIcon>
  ),
  html: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9.5 8.5L6.5 12l3 3.5" />
      <path d="M14.5 8.5L17.5 12l-3 3.5" />
      <path d="M13 7.3l-2 9.4" />
    </LangIcon>
  ),
  java: (
    <LangIcon>
      <path d="M6 10h10v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5z" />
      <path d="M16 12h1.3a1.8 1.8 0 0 1 0 3.6H16" />
      <path d="M9.3 3.8c-.9.8-.9 1.6 0 2.4M13.3 3.8c-.9.8-.9 1.6 0 2.4" />
      <path d="M6 19.3h10" />
    </LangIcon>
  ),
  javascript: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M10.5 8v6.5a2 2 0 0 1-3.5 1.3" />
      <path d="M17 8.8a2 2 0 0 0-2-.8c-1.1 0-2.2.6-2.2 1.7 0 1 .9 1.4 2.2 1.7 1.3.3 2.3.7 2.3 1.9 0 1.1-1 1.8-2.3 1.8a2.4 2.4 0 0 1-2.3-1.4" />
    </LangIcon>
  ),
  json: (
    <LangIcon>
      <path d="M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2" />
      <path d="M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2" />
    </LangIcon>
  ),
  kotlin: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M9 7.5v9" />
      <path d="M9 12l6-4.5" />
      <path d="M9 12l6 4.5" />
    </LangIcon>
  ),
  markdown: (
    <LangIcon>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M6 15V9l3 4 3-4v6" />
      <path d="M16.5 9v6" />
      <path d="M14.5 13l2 2 2-2" />
    </LangIcon>
  ),
  php: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M11.5 8.5L7.5 12l4 3.5" />
      <path d="M15.2 8.2c1.1 0 1.9.6 1.9 1.6 0 1.1-.9 1.5-1.8 1.8-.6.2-1 .5-1 1.1" />
      <circle cx="14.3" cy="16.2" r=".5" fill="currentColor" stroke="none" />
    </LangIcon>
  ),
  plaintext: (
    <LangIcon>
      <rect x="4" y="2.5" width="16" height="19" rx="2" />
      <line x1="7.5" y1="7.5" x2="16.5" y2="7.5" />
      <line x1="7.5" y1="11.5" x2="16.5" y2="11.5" />
      <line x1="7.5" y1="15.5" x2="13.5" y2="15.5" />
    </LangIcon>
  ),
  python: (
    <LangIcon>
      <path d="M4.5 15c0-3 2.5-4.7 5.7-4.7h1.6c2.8 0 5-2 5-4.5" />
      <path d="M9.5 3.3c1.3-.3 2.6 0 3.3 1-.7 1-2 1.3-3.3 1" />
      <circle cx="15.5" cy="4.3" r=".55" fill="currentColor" stroke="none" />
      <path d="M17.8 4.5l1.4-.6M17.8 4.9l1.4.6" />
    </LangIcon>
  ),
  ruby: (
    <LangIcon>
      <polygon points="12 2.5 19.5 8 12 21.5 4.5 8" />
      <path d="M4.5 8h15" />
      <path d="M12 2.5v19" />
    </LangIcon>
  ),
  rust: (
    <LangIcon>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
      <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </LangIcon>
  ),
  sql: (
    <LangIcon>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </LangIcon>
  ),
  swift: (
    <LangIcon>
      <path d="M19 4.5c-2.6 4-5.5 7-8.3 9 2-.2 3.7-1 4.8-2.6-.7 2.8-2.8 5-5.3 6.1 3 .5 5.6-.5 7.2-2.4.4 2-.4 3.9-1.9 4.9 3.7-1.3 6-4.2 6.6-7.6-1 2.6-2.8 4.6-4.6 5.8" />
    </LangIcon>
  ),
  typescript: (
    <LangIcon>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.3 8.2h5M9.8 8.2v7.6" />
      <path d="M17 8.8a2 2 0 0 0-2-.8c-1.1 0-2.2.6-2.2 1.7 0 1 .9 1.4 2.2 1.7 1.3.3 2.3.7 2.3 1.9 0 1.1-1 1.8-2.3 1.8a2.4 2.4 0 0 1-2.3-1.4" />
    </LangIcon>
  ),
  xml: (
    <LangIcon>
      <path d="M8 7l-4.5 5 4.5 5" />
      <path d="M16 7l4.5 5-4.5 5" />
      <path d="M12 8v8" />
    </LangIcon>
  ),
  yaml: (
    <LangIcon>
      <rect x="2.5" y="3" width="19" height="18" rx="2" />
      <path d="M6.5 8h2M9.5 8h8" />
      <path d="M6.5 12h2M9.5 12h6" />
      <path d="M6.5 16h2M9.5 16h7" />
    </LangIcon>
  ),
};

export const DEFAULT_ICONS: RichTextEditorIcons = {
  alignCenterControlIcon: <TextAlignCenter {...iconProps} />,
  alignJustifyControlIcon: <TextAlignJustify {...iconProps} />,
  alignLeftControlIcon: <TextAlignStart {...iconProps} />,
  alignRightControlIcon: <TextAlignEnd {...iconProps} />,
  blockquoteControlIcon: <TextQuote {...iconProps} />,
  boldControlIcon: <Bold {...iconProps} />,
  bulletListControlIcon: <List {...iconProps} />,
  clearFormattingControlIcon: <RemoveFormatting {...iconProps} />,
  codeBlockControlIcon: <SquareCode {...iconProps} />,
  codeControlIcon: <Code {...iconProps} />,
  h1ControlIcon: <Heading1 {...iconProps} />,
  h2ControlIcon: <Heading2 {...iconProps} />,
  h3ControlIcon: <Heading3 {...iconProps} />,
  h4ControlIcon: <Heading4 {...iconProps} />,
  h5ControlIcon: <Heading5 {...iconProps} />,
  h6ControlIcon: <Heading6 {...iconProps} />,
  highlightControlIcon: <Highlighter {...iconProps} />,
  hrControlIcon: <Minus {...iconProps} />,
  italicControlIcon: <Italic {...iconProps} />,
  languageIcons: DEFAULT_LANGUAGE_ICONS,
  linkControlIcon: <Link {...iconProps} />,
  orderedListControlIcon: <ListOrdered {...iconProps} />,
  redoControlIcon: <Redo2 {...iconProps} />,
  strikeControlIcon: <Strikethrough {...iconProps} />,
  subscriptControlIcon: <Subscript {...iconProps} />,
  superscriptControlIcon: <Superscript {...iconProps} />,
  underlineControlIcon: <Underline {...iconProps} />,
  undoControlIcon: <Undo2 {...iconProps} />,
  unlinkControlIcon: <Link2Off {...iconProps} />,
};
