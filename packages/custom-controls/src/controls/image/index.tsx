import { Button } from "@editorcn/ui/components/button";
import { DialogFooter } from "@editorcn/ui/components/dialog";
import { Input } from "@editorcn/ui/components/input";
import { Label } from "@editorcn/ui/components/label";
import type { Editor } from "@tiptap/core";
import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { createContentControl } from "../../core/content-control";
import { useEditorControls } from "../../core/context";

export interface ImageDialogContentProps {
  editor: Editor;
  onClose: () => void;
}

export const ImageDialogContent = ({
  editor,
  onClose,
}: ImageDialogContentProps) => {
  const { labels } = useEditorControls();
  const [src, setSrc] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const href = src.trim();
    if (!href) {
      return;
    }
    editor.chain().focus().setImage({ src: href }).run();
    onClose();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="editor-controls-image-url">{labels.imageUrl}</Label>
        <Input
          autoFocus
          id="editor-controls-image-url"
          placeholder={labels.imagePlaceholder}
          type="url"
          value={src}
          onChange={(event) => setSrc(event.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {labels.cancel}
        </Button>
        <Button type="submit" disabled={!src.trim()}>
          {labels.insert}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const ImageControl = createContentControl({
  dialog: (editor, close) => (
    <ImageDialogContent editor={editor} onClose={close} />
  ),
  dialogTitle: "Image",
  extensionName: "image",
  icon: <ImageIcon />,
  label: "image",
  nodeName: "image",
});
