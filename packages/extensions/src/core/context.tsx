import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { ExtensionLabels } from "./labels";
import { DEFAULT_EXTENSION_LABELS } from "./labels";

export interface ToolbarContextValue {
  editor: Editor | null;
  labels: ExtensionLabels;
}

const ToolbarContext = createContext<ToolbarContextValue>({
  editor: null,
  labels: DEFAULT_EXTENSION_LABELS,
});

export interface ToolbarProviderProps {
  children: ReactNode;
  editor?: Editor | null;
  labels?: Partial<ExtensionLabels>;
}

export const ToolbarProvider = ({
  children,
  editor = null,
  labels,
}: ToolbarProviderProps) => {
  const value = useMemo(
    () => ({
      editor,
      labels: { ...DEFAULT_EXTENSION_LABELS, ...labels },
    }),
    [editor, labels]
  );

  return (
    <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
  );
};

export const useToolbar = (): ToolbarContextValue => useContext(ToolbarContext);

export const useToolbarEditor = (
  editor: Editor | null | undefined
): Editor | null => {
  const context = useContext(ToolbarContext);
  return editor ?? context.editor ?? null;
};
