import type { Editor } from "@tiptap/core";
import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { BlockEditorIcons } from "./icon-types";
import { DEFAULT_ICONS } from "./icons";
import { DEFAULT_BLOCK_EDITOR_LABELS } from "./labels";
import type {
  BlockEditorContextValue,
  BlockEditorLabels,
  BlockEditorPreset,
} from "./types";

const BlockEditorContext = createContext<BlockEditorContextValue | null>(null);

export const useBlockEditorContext = () => {
  const ctx = useContext(BlockEditorContext);
  if (!ctx) {
    throw new Error("BlockEditor components must be used within <BlockEditor>");
  }
  return ctx;
};

export interface BlockEditorProviderProps {
  editor: Editor | null;
  children: ReactNode;
  labels?: Partial<BlockEditorLabels>;
  icons?: Partial<BlockEditorIcons>;
  preset?: BlockEditorPreset;
}

export const BlockEditorProvider = ({
  editor,
  children,
  labels,
  icons,
  preset = "block",
}: BlockEditorProviderProps) => {
  const mergedLabels = { ...DEFAULT_BLOCK_EDITOR_LABELS, ...labels };
  const mergedIcons = { ...DEFAULT_ICONS, ...icons };

  return (
    <BlockEditorContext.Provider
      value={{
        editor,
        icons: mergedIcons,
        labels: mergedLabels,
        preset,
      }}
    >
      {children}
    </BlockEditorContext.Provider>
  );
};
