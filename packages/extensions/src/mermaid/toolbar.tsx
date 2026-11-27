"use client";

import { Workflow } from "lucide-react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { useEditable, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";

export const MermaidToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
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
      aria-label={labels.mermaid}
      className={className}
      size="icon-sm"
      disabled={disabled}
      tooltip={labels.mermaid}
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
