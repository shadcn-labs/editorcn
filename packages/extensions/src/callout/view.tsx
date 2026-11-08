"use client";

import type { ReactNodeViewProps } from "@tiptap/react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";

import { useToolbar } from "../core/context";
import { useEditable } from "../core/editor-state";
import { Button } from "../ui/button";
import { DropdownMenu } from "../ui/dropdown-menu";
import { CalloutIcon, CalloutMenu } from "./menu";
import { toCalloutVariant, unwrapCallout } from "./utils";
import type { CalloutVariant } from "./utils";

export const CalloutView = ({
  editor,
  getPos,
  node,
  updateAttributes,
}: ReactNodeViewProps) => {
  const { labels } = useToolbar();
  const variant = toCalloutVariant(node.attrs.variant);
  const emoji = (node.attrs.emoji as string | null) || null;
  const editable = useEditable(editor);
  const [open, setOpen] = useState(false);

  if (open && !editable) {
    setOpen(false);
  }

  const select = (next: CalloutVariant) => {
    setOpen(false);
    if (editor.isEditable) {
      updateAttributes({ variant: next });
    }
  };

  const resetEmoji = () => {
    setOpen(false);
    if (editor.isEditable) {
      updateAttributes({ emoji: null });
    }
  };

  const remove = () => {
    setOpen(false);
    const pos = getPos();
    if (!editor.isEditable || typeof pos !== "number") {
      return;
    }
    editor
      .chain()
      .focus()
      .command(({ tr }) => unwrapCallout(tr, pos, node))
      .run();
  };

  const icon = <CalloutIcon emoji={emoji} variant={variant} />;

  return (
    <NodeViewWrapper
      className="ext-callout"
      data-type="callout"
      data-variant={variant}
    >
      <div className="ext-callout-icon" contentEditable={false}>
        {editable ? (
          <DropdownMenu
            open={open}
            onOpenChange={setOpen}
            trigger={
              <Button
                className="ext-btn--icon-sm ext-callout-trigger"
                aria-label={labels.calloutType}
              >
                {icon}
              </Button>
            }
          >
            <CalloutMenu
              value={variant}
              onSelect={select}
              onResetEmoji={emoji ? resetEmoji : undefined}
              onRemove={remove}
            />
          </DropdownMenu>
        ) : (
          <span className="ext-callout-trigger" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <NodeViewContent className="ext-callout-content" />
    </NodeViewWrapper>
  );
};
