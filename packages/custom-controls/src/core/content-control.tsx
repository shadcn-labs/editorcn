import { Button } from "@editorcn/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@editorcn/ui/components/dialog";
import type { Editor } from "@tiptap/core";
import type { ReactNode } from "react";
import { memo, useCallback, useState } from "react";

import { useEditorControls, useResolvedEditor } from "./context";
import { nodeActive, extensionPresent } from "./detection";
import { shallowEqual, useEditorState } from "./editor-state";
import type { ControlsLabels } from "./labels";

export interface CreateContentControlOptions {
  dialog?: (editor: Editor, close: () => void) => ReactNode;
  dialogDescription?: string;
  dialogTitle?: string;
  extensionName: string;
  icon: ReactNode;
  label: keyof ControlsLabels | string;
  nodeName?: string;
  run?: (editor: Editor) => void;
}

export interface ContentControlProps {
  className?: string;
  editor?: Editor | null;
  size?: "icon" | "icon-lg" | "icon-sm";
}

export const createContentControl = (options: CreateContentControlOptions) => {
  const Control = memo(
    ({
      className,
      editor: editorProp,
      size = "icon-sm",
    }: ContentControlProps) => {
      const { labels } = useEditorControls();
      const editor = useResolvedEditor(editorProp);
      const [open, setOpen] = useState(false);

      const editorState = useEditorState(
        editor,
        (edit) => ({
          active: options.nodeName ? nodeActive(edit, options.nodeName) : false,
          disabled: !extensionPresent(edit, options.extensionName),
        }),
        shallowEqual
      ) ?? { active: false, disabled: true };

      const label =
        labels[options.label as keyof ControlsLabels] ?? options.label;

      const close = useCallback(() => setOpen(false), []);

      const run = useCallback(() => {
        if (!editor || editor.isDestroyed || editorState.disabled) {
          return;
        }
        options.run?.(editor);
      }, [editor, editorState.disabled]);

      if (!options.dialog) {
        return (
          <Button
            aria-label={label}
            className={className}
            data-active={editorState.active ? "true" : undefined}
            disabled={editorState.disabled}
            size={size}
            title={label}
            variant="ghost"
            onClick={run}
          >
            {options.icon}
          </Button>
        );
      }

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            disabled={editorState.disabled}
            render={
              <Button
                aria-label={label}
                className={className}
                disabled={editorState.disabled}
                size={size}
                title={label}
                variant="ghost"
              />
            }
          >
            {options.icon}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{options.dialogTitle ?? label}</DialogTitle>
              {options.dialogDescription ? (
                <DialogDescription>
                  {options.dialogDescription}
                </DialogDescription>
              ) : null}
            </DialogHeader>
            {editor ? options.dialog(editor, close) : null}
          </DialogContent>
        </Dialog>
      );
    }
  );
  Control.displayName = `createContentControl(${options.label})`;
  return Control;
};
