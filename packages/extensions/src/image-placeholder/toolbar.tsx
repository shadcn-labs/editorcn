"use client";

import { Button } from "@editorcn/ui/components/button";
import { cn } from "@editorcn/ui/lib/utils";
import { useToolbar, useToolbarEditor } from "../core/context";
import { useEditorState } from "../core/editor-state";
import { Image } from "lucide-react";
import type { ToolbarComponentProps } from "../core/types";

export const ImagePlaceholderToolbar = ({
  className,
  editor: editorProp,
  size = "icon-sm",
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
      className={cn("data-active:bg-accent data-active:text-accent-foreground", className)}
      disabled={disabled}
      size={size}
      title={labels.image}
      variant="ghost"
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