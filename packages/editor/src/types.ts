import type { Editor } from "@tiptap/react";

import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";

export type RichTextEditorVariant = "default" | "subtle" | "compact";

export type RichTextEditorPreset =
  | "document"
  | "block"
  | (string & Record<never, never>);

export interface RichTextEditorProps {
  editor: Editor | null;
  children: React.ReactNode;
  className?: string;
  labels?: Partial<RichTextEditorLabels>;
  icons?: Partial<RichTextEditorIcons>;
  variant?: RichTextEditorVariant;
  preset?: RichTextEditorPreset;
  editable?: boolean;
}

export interface RichTextEditorToolbarProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
  stickyOffset?: number | string;
}

export interface RichTextEditorContentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface RichTextEditorControlsGroupProps {
  children: React.ReactNode;
  className?: string;
}

export interface RichTextEditorControlProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  interactive?: boolean;
}

export interface WordCountInfo {
  words: number;
  characters: number;
}

export interface RichTextEditorFooterProps {
  children?: React.ReactNode;
  className?: string;
  sticky?: boolean;
  stickyOffset?: number | string;
  showWordCount?: boolean;
  wordCountClassName?: string;
  wordCountFormatter?: (info: WordCountInfo) => string;
}
