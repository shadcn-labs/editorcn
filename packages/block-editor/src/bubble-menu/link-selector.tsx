import {
  BubbleButton,
  BubbleDropdown,
  BubbleDropdownIcon,
  BubbleDropdownItem,
  DropdownOverlay,
} from "@editorcn/editor-ui/block-editor/ui";
import type { Editor } from "@tiptap/react";
import { useState, useRef, useCallback, useEffect } from "react";

import { DEFAULT_ICONS } from "../icons";

interface LinkableChain {
  extendMarkRange(type: string): LinkableChain;
  run(): boolean;
  setLink(options: { href: string }): LinkableChain;
  unsetLink(): LinkableChain;
}

export const LinkSelector = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [{ isLink, linkUrl }, setLinkState] = useState(() => ({
    isLink: editor.isActive("link"),
    linkUrl: editor.getAttributes("link").href || "",
  }));

  useEffect(() => {
    const update = () => {
      setLinkState({
        isLink: editor.isActive("link"),
        linkUrl: editor.getAttributes("link").href || "",
      });
    };
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor]);

  const handleSubmit = useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();
      let url = inputRef.current?.value?.trim();
      if (!url) {
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      (editor.chain().focus() as unknown as LinkableChain)
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setOpen(false);
    },
    [editor]
  );

  const handleUnlink = useCallback(() => {
    (editor.chain().focus() as unknown as LinkableChain).unsetLink().run();
    setOpen(false);
  }, [editor]);

  return (
    <div style={{ position: "relative" }}>
      <BubbleButton
        active={isLink}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        title="Link"
      >
        {DEFAULT_ICONS.linkIcon}
      </BubbleButton>
      {open && (
        <>
          <DropdownOverlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <BubbleDropdown style={{ left: "auto", minWidth: "220px", right: 0 }}>
            <form className="block-editor-link-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                className="block-editor-link-input"
                placeholder="Paste a link..."
                defaultValue={linkUrl}
                autoFocus
              />
              <div className="block-editor-link-actions">
                {isLink && (
                  <BubbleDropdownItem
                    danger
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleUnlink}
                    style={{ justifyContent: "center" }}
                  >
                    <BubbleDropdownIcon>
                      {DEFAULT_ICONS.unlinkIcon}
                    </BubbleDropdownIcon>
                    <span>Remove</span>
                  </BubbleDropdownItem>
                )}
                <BubbleDropdownItem
                  onMouseDown={(e) => e.preventDefault()}
                  type="submit"
                  style={{ justifyContent: "center" }}
                >
                  <BubbleDropdownIcon>
                    {DEFAULT_ICONS.checkIcon}
                  </BubbleDropdownIcon>
                  <span>{isLink ? "Update" : "Add"}</span>
                </BubbleDropdownItem>
              </div>
            </form>
          </BubbleDropdown>
        </>
      )}
    </div>
  );
};
