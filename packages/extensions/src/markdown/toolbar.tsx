"use client";

import type { Editor } from "@tiptap/core";
import { Copy, FileDown, FileText, FileUp } from "lucide-react";
import { useState } from "react";

import { copyMarkdown, downloadMarkdown, importMarkdownFile } from ".";
import { useToolbar, useToolbarEditor } from "../core/context";
import { useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";

export interface MarkdownToolbarProps extends ToolbarComponentProps {
  filename?: string;
}

export const MarkdownToolbar = ({
  className,
  editor: editorProp,
  filename,
}: MarkdownToolbarProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);
  const [open, setOpen] = useState(false);

  const disabled =
    useEditorState(editor, (edit) => edit.isDestroyed || !edit.markdown) ??
    true;

  const run = (action: (target: Editor) => unknown) => {
    setOpen(false);
    if (editor && !disabled) {
      action(editor);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      sideOffset={6}
      trigger={
        <Button
          aria-label={labels.markdown}
          className={["ext-btn--icon-sm", className].filter(Boolean).join(" ")}
          disabled={disabled}
          tooltip={labels.markdown}
        >
          <FileText />
        </Button>
      }
    >
      <PopoverContent role="menu" style={{ minWidth: "11rem", padding: 4 }}>
        <DropdownMenuItem onClick={() => run(importMarkdownFile)}>
          <FileUp />
          {labels.importMarkdown}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => run((target) => downloadMarkdown(target, filename))}
        >
          <FileDown />
          {labels.exportMarkdown}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => run(copyMarkdown)}>
          <Copy />
          {labels.copyMarkdown}
        </DropdownMenuItem>
      </PopoverContent>
    </Popover>
  );
};
