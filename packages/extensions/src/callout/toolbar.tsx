"use client";

import { MessageSquareWarning } from "lucide-react";
import { useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import {
  shallowEqual,
  useEditable,
  useEditorState,
} from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { Popover } from "../ui/popover";
import { CalloutMenu } from "./menu";
import { toCalloutVariant } from "./utils";
import type { CalloutVariant } from "./utils";

export const CalloutToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);
  const [open, setOpen] = useState(false);
  const editable = useEditable(editor);

  const state = useEditorState(
    editor,
    (edit) => {
      const active = !edit.isDestroyed && edit.isActive("callout");
      return {
        disabled:
          !extensionPresent(edit, "callout") ||
          !(active || edit.can().setCallout()),
        variant: active
          ? toCalloutVariant(edit.getAttributes("callout").variant)
          : null,
      };
    },
    shallowEqual
  ) ?? { disabled: true, variant: null };
  const disabled = state.disabled || !editable;

  if (open && disabled) {
    setOpen(false);
  }

  const select = (variant: CalloutVariant) => {
    setOpen(false);
    if (!editor || disabled || !editor.isEditable) {
      return;
    }
    const chain = editor.chain().focus();
    if (state.variant) {
      chain.updateCallout({ variant }).run();
    } else {
      chain.setCallout({ variant }).run();
    }
  };

  const remove = () => {
    setOpen(false);
    if (editor?.isEditable) {
      editor.chain().focus().unsetCallout().run();
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
          aria-label={labels.callout}
          active={Boolean(state.variant)}
          className={["ext-btn--icon-sm", className].filter(Boolean).join(" ")}
          disabled={disabled}
          tooltip={labels.callout}
        >
          <MessageSquareWarning />
        </Button>
      }
    >
      <CalloutMenu
        value={state.variant}
        onSelect={select}
        onRemove={state.variant ? remove : undefined}
      />
    </Popover>
  );
};
