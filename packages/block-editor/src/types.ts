import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";

import type { BlockEditorIcons } from "./icon-types";

export interface BlockEditorLabels {
  paragraphLabel?: string;
  headingLabel?: string;
  bulletListLabel?: string;
  orderedListLabel?: string;
  taskListLabel?: string;
  blockquoteLabel?: string;
  codeBlockLabel?: string;
  dividerLabel?: string;
}

export type BlockEditorPreset =
  | "document"
  | "block"
  | (string & Record<never, never>);

export interface BlockEditorProps {
  editor: Editor | null;
  children?: ReactNode;
  className?: string;
  labels?: Partial<BlockEditorLabels>;
  icons?: Partial<BlockEditorIcons>;
  preset?: BlockEditorPreset;
}

export interface BlockEditorContextValue {
  editor: Editor | null;
  labels: BlockEditorLabels;
  icons: BlockEditorIcons;
  preset: BlockEditorPreset;
}
