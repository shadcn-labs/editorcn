import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Toggle,
} from "@editorcn/editor-ui/editor";
import { useEditorState } from "@tiptap/react";
import * as React from "react";
import { useCallback, useState } from "react";

import { useRichTextEditorContext } from "../rte-context";

export const LinkControl = () => {
  const { editor, labels, icons } = useRichTextEditorContext();
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);

  const active = useEditorState({
    editor: editor ?? null,
    selector: (ctx) =>
      ctx.editor && !ctx.editor.isDestroyed
        ? ctx.editor.isActive("link")
        : false,
  });

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        const linkData = editor?.getAttributes("link");
        setUrl(linkData?.href || "");
      } else {
        setUrl("");
      }
      setOpen(isOpen);
    },
    [editor]
  );

  const handleSave = () => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    setOpen(false);
    setUrl("");
  };

  const handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void = (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  React.useEffect(() => {
    const handler = () => handleOpen(true);
    window.addEventListener("edit-link", handler);
    return () => window.removeEventListener("edit-link", handler);
  }, [handleOpen]);

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger
        render={
          <Toggle
            size="sm"
            pressed={active ?? false}
            aria-label={labels.linkControlLabel}
            title={labels.linkControlLabel}
            className="p-0"
          />
        }
        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      >
        {icons.linkControlIcon}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="rte-link-editor">
          <Input
            type="url"
            placeholder={labels.linkEditorInputPlaceholder}
            aria-label={labels.linkEditorInputLabel}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rte-link-editor-input h-8 text-sm"
          />
          <Button
            size="sm"
            variant="default"
            onClick={handleSave}
            className="rte-link-editor-save h-8"
          >
            {labels.linkEditorSave}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
