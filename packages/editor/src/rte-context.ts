import type { Tooltip } from "@base-ui/react/tooltip";
import type { Editor } from "@tiptap/react";
import { createContext, useContext } from "react";

import type { RichTextEditorIcons } from "./icon-types";
import type { RichTextEditorLabels } from "./labels";
import type { RichTextEditorVariant } from "./types";

interface RichTextEditorContextValue {
  editor: Editor | null;
  labels: RichTextEditorLabels;
  icons: RichTextEditorIcons;
  variant: RichTextEditorVariant;
  editable: boolean;
  tooltip: Tooltip.Handle<string>;
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
