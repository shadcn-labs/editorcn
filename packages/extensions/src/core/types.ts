import type { Editor, Range } from "@tiptap/core";
import type { ReactNode } from "react";

export interface ToolbarComponentProps {
  className?: string;
  editor?: Editor | null;
  size?: "icon" | "icon-lg" | "icon-sm";
}

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon?: ReactNode;
  command: (props: { editor: Editor; range: Range }) => void;
}
