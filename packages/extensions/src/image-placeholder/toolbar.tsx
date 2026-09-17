"use client";

import { Image } from "lucide-react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";

export const ImagePlaceholderToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);

  const disabled =
    useEditorState(
      editor,
      (edit) =>
        edit.isDestroyed ||
        !edit.extensionManager.extensions.some(
          (e) => e.name === "imagePlaceholder"
        )
    ) ?? true;

  return (
    <Button
      aria-label={labels.image}
      className={["ext-btn--icon-sm", className].filter(Boolean).join(" ")}
      disabled={disabled}
      title={labels.image}
      onClick={() => {
        if (editor && !editor.isDestroyed && !disabled) {
          editor.chain().focus().insertImagePlaceholder().run();
        }
      }}
    >
      <Image />
    </Button>
  );
};
