import type { Editor } from "@tiptap/react";
import { useState, useRef, useCallback, useEffect } from "react";

import { DEFAULT_ICONS } from "../icons/icons";
import { Button, Dropdown, DropdownIcon, DropdownItem, Overlay } from "../ui";

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
      <Button
        active={isLink}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        title="Link"
      >
        {DEFAULT_ICONS.linkIcon}
      </Button>
      {open && (
        <>
          <Overlay
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          <Dropdown style={{ left: "auto", minWidth: "220px", right: 0 }}>
            <form
              className="block-editor-link-form flex flex-col gap-2 p-1"
              onSubmit={handleSubmit}
            >
              <input
                ref={inputRef}
                type="text"
                className="block-editor-link-input h-8 w-full rounded-sm border border-border bg-transparent px-2 text-[0.8125rem] [font-family:inherit] text-popover-foreground outline-none [transition:border-color_150ms_ease-out,box-shadow_150ms_ease-out] placeholder:text-muted-foreground focus:border-ring focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_20%,transparent)]"
                placeholder="Paste a link..."
                defaultValue={linkUrl}
                autoFocus
              />
              <div className="block-editor-link-actions flex gap-1">
                {isLink && (
                  <DropdownItem
                    danger
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleUnlink}
                    style={{ justifyContent: "center" }}
                  >
                    <DropdownIcon>{DEFAULT_ICONS.unlinkIcon}</DropdownIcon>
                    <span>Remove</span>
                  </DropdownItem>
                )}
                <DropdownItem
                  onMouseDown={(e) => e.preventDefault()}
                  type="submit"
                  style={{ justifyContent: "center" }}
                >
                  <DropdownIcon>{DEFAULT_ICONS.checkIcon}</DropdownIcon>
                  <span>{isLink ? "Update" : "Add"}</span>
                </DropdownItem>
              </div>
            </form>
          </Dropdown>
        </>
      )}
    </div>
  );
};
