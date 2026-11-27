"use client";

import { Workflow } from "lucide-react";

import { useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { useEditable, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";

export interface MermaidToolbarProps extends ToolbarComponentProps {
  label?: string;
}

export const MermaidToolbar = ({
  className,
  editor: editorProp,
  label = "Diagram",
}: MermaidToolbarProps) => {
  const editor = useToolbarEditor(editorProp);
  const editable = useEditable(editor);

  const unavailable =
    useEditorState(
      editor,
      (edit) =>
        edit.isDestroyed ||
        !extensionPresent(edit, "mermaid") ||
        !edit.can().setMermaid()
    ) ?? true;
  const disabled = unavailable || !editable;

  return (
    <Button
      aria-label={label}
      className={className}
      size="icon-sm"
      disabled={disabled}
      tooltip={label}
      onClick={() => {
        if (editor && !editor.isDestroyed && !disabled) {
          editor.chain().focus().setMermaid().run();
        }
      }}
    >
      <Workflow />
    </Button>
  );
};
