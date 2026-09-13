import { Button } from "@editorcn/ui/components/button";
import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { memo } from "react";

import { runOperation } from "./commands";
import type { ControlOperation } from "./commands";
import { useEditorControls, useResolvedEditor } from "./context";
import { shallowEqual, useEditorState } from "./editor-state";
import type { ControlsLabels } from "./labels";

export interface CreateControlOptions {
  icon: ReactNode;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
  label: keyof ControlsLabels | string;
  operation: ControlOperation;
}

export interface ControlProps {
  className?: string;
  editor?: Editor | null;
  size?: "icon" | "icon-lg" | "icon-sm";
}

export const createControl = (options: CreateControlOptions) => {
  const Control = memo(
    ({ className, editor: editorProp, size = "icon-sm" }: ControlProps) => {
      const { labels } = useEditorControls();
      const editor = useResolvedEditor(editorProp);

      const editorState = useEditorState(
        editor,
        (edit) => ({
          active: options.isActive?.(edit) ?? false,
          disabled: options.isDisabled?.(edit) ?? false,
        }),
        shallowEqual
      ) ?? { active: false, disabled: true };

      const label =
        labels[options.label as keyof ControlsLabels] ?? options.label;

      return (
        <Button
          aria-label={label}
          aria-pressed={editorState.active}
          className={className}
          data-active={editorState.active ? "true" : undefined}
          disabled={editorState.disabled}
          size={size}
          title={label}
          variant="ghost"
          onClick={() => {
            if (editor && !editor.isDestroyed && !editorState.disabled) {
              runOperation(editor, options.operation);
            }
          }}
        >
          {options.icon}
        </Button>
      );
    }
  );
  Control.displayName = `createControl(${options.label})`;
  return Control;
};
