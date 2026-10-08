import type { ChainedCommands, Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import React from "react";

import type { RichTextEditorIcons } from "../icon-types";
import type { RichTextEditorLabels } from "../labels";
import { useRichTextEditorContext } from "../rte-context";
import type { RichTextEditorControlProps } from "../types";
import { Toggle } from "../ui/toggle";
import { cn } from "../ui/utils";

type IsActiveConfig =
  | { name: string; attributes?: Record<string, unknown> | string }
  | { attrs: Record<string, unknown> };

type ChainCommand = (
  attributes?: Record<string, unknown> | string
) => Pick<ChainedCommands, "run">;

interface CreateControlProps {
  label: keyof RichTextEditorLabels;
  iconKey: Exclude<keyof RichTextEditorIcons, "languageIcons">;
  isActive?: IsActiveConfig;
  isDisabled?: (editor: Editor) => boolean;
  operation: { name: string; attributes?: Record<string, unknown> | string };
}

export const RichTextEditorControl = ({
  active = false,
  interactive: _interactive = true,
  className,
  children,
  onMouseDown,
  onClick,
  disabled,
  ...props
}: RichTextEditorControlProps) => (
  <Toggle
    size="sm"
    pressed={active}
    disabled={disabled}
    aria-label={props["aria-label"]}
    title={props.title}
    className={cn("rte-control-button", className)}
    onMouseDown={(e) => {
      e.preventDefault();
      onMouseDown?.(e);
    }}
    onPressedChange={() => onClick?.({} as React.MouseEvent<HTMLButtonElement>)}
  >
    {children}
  </Toggle>
);

type EditorStateSelector = (ctx: { editor: Editor | null }) => {
  active: boolean;
  disabled: boolean;
};

const resolveIsActive = (
  editor: Editor | null,
  config?: IsActiveConfig
): boolean => {
  if (!editor || !config) {
    return false;
  }
  if ("attrs" in config) {
    return editor.isActive(config.attrs);
  }
  return editor.isActive(config.name, config.attributes);
};

const createSelector =
  (
    isActive?: IsActiveConfig,
    isDisabled?: (editor: Editor) => boolean
  ): EditorStateSelector =>
  (ctx) => {
    const safeEditor =
      ctx.editor && !ctx.editor.isDestroyed ? ctx.editor : null;

    return {
      active: resolveIsActive(safeEditor, isActive),
      disabled: safeEditor ? (isDisabled?.(safeEditor) ?? false) : true,
    };
  };

export const createControl = ({
  label,
  iconKey,
  isActive,
  isDisabled,
  operation,
}: CreateControlProps) => {
  const Control = ({ className }: { className?: string }) => {
    const { editor, labels, icons } = useRichTextEditorContext();
    const ariaLabel = labels[label] as string;

    const selector = createSelector(isActive, isDisabled);
    useEditorState({ editor: editor ?? null, selector });
    const { active, disabled } = selector({ editor: editor ?? null });

    return (
      <RichTextEditorControl
        active={active}
        disabled={disabled}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={className}
        onClick={() => {
          if (!editor || editor.isDestroyed) {
            return;
          }
          const commands = editor.chain().focus() as unknown as Record<
            string,
            ChainCommand
          >;
          commands[operation.name]?.(operation.attributes).run();
        }}
      >
        {icons[iconKey]}
      </RichTextEditorControl>
    );
  };

  Control.displayName = `RichTextEditor.${String(label)}`;
  return Control;
};
