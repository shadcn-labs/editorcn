import type { Editor } from "@tiptap/react";
import { createContext, useContext } from "react";

import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";
import type { RichTextEditorPreset, RichTextEditorVariant } from "./types";
import type { TooltipHandle } from "./ui/tooltip";

interface RichTextEditorContextValue {
  editor: Editor | null;
  labels: RichTextEditorLabels;
  icons: RichTextEditorIcons;
  variant: RichTextEditorVariant;
  preset: RichTextEditorPreset;
  editable: boolean;
  tooltip: TooltipHandle;
}

export const RichTextEditorContext =
  createContext<RichTextEditorContextValue | null>(null);

export const useRichTextEditorContext = (): RichTextEditorContextValue => {
  const context = useContext(RichTextEditorContext);
  if (!context) {
    throw new Error(
      "useRichTextEditorContext must be used within RichTextEditor"
    );
  }
  return context;
};
