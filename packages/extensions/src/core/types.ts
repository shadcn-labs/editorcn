import type { Editor } from "@tiptap/core";

export interface ToolbarComponentProps {
  className?: string;
  editor?: Editor | null;
  size?: "icon" | "icon-lg" | "icon-sm";
}