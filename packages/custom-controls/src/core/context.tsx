import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { ControlsLabels } from "./labels";
import { DEFAULT_CONTROLS_LABELS } from "./labels";

export interface EditorControlsContextValue {
  editor: Editor | null;
  labels: ControlsLabels;
}

const EditorControlsContext = createContext<EditorControlsContextValue>({
  editor: null,
  labels: DEFAULT_CONTROLS_LABELS,
});

export interface EditorControlsProviderProps {
  children: ReactNode;
  editor?: Editor | null;
  labels?: Partial<ControlsLabels>;
}

export const EditorControlsProvider = ({
  children,
  editor = null,
  labels,
}: EditorControlsProviderProps) => {
  const value = useMemo(
    () => ({
      editor,
      labels: { ...DEFAULT_CONTROLS_LABELS, ...labels },
    }),
    [editor, labels]
  );

  return (
    <EditorControlsContext.Provider value={value}>
      {children}
    </EditorControlsContext.Provider>
  );
};

export const useEditorControls = (): EditorControlsContextValue =>
  useContext(EditorControlsContext);

export const useResolvedEditor = (
  editor: Editor | null | undefined
): Editor | null => {
  const context = useContext(EditorControlsContext);
  return editor ?? context.editor ?? null;
};
