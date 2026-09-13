import { Button } from "@editorcn/ui/components/button";
import { DialogFooter } from "@editorcn/ui/components/dialog";
import { Input } from "@editorcn/ui/components/input";
import { Label } from "@editorcn/ui/components/label";
import type { Editor } from "@tiptap/core";
import { Link as LinkIcon } from "lucide-react";
import { useState } from "react";

import { createContentControl } from "../../core/content-control";
import { useEditorControls } from "../../core/context";

const LINK_PATTERN = /^https?:\/\/\S+$/;

export interface InsertLinkDialogContentProps {
  editor: Editor;
  onClose: () => void;
}

export const InsertLinkDialogContent = ({
  editor,
  onClose,
}: InsertLinkDialogContentProps) => {
  const { labels } = useEditorControls();
  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, " ").trim();
  const [url, setUrl] = useState(() =>
    LINK_PATTERN.test(selectedText) ? selectedText : ""
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const href = url.trim();
    if (!href) {
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    onClose();
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="editor-controls-link-url">{labels.linkUrl}</Label>
        <Input
          autoFocus
          id="editor-controls-link-url"
          placeholder={labels.linkPlaceholder}
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          {labels.cancel}
        </Button>
        <Button type="submit" disabled={!url.trim()}>
          {labels.insert}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const InsertLinkControl = createContentControl({
  dialog: (editor, close) => (
    <InsertLinkDialogContent editor={editor} onClose={close} />
  ),
  extensionName: "link",
  icon: <LinkIcon />,
  label: "insertLink",
  nodeName: "link",
});
