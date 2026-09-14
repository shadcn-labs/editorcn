"use client";

import { Button } from "@editorcn/ui/components/button";
import { cn } from "@editorcn/ui/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editorcn/ui/components/popover";
import { Highlighter } from "lucide-react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { shallowEqual, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";

const HIGHLIGHT_COLORS = [
  { color: "#fef08a", label: "Yellow" },
  { color: "#bbf7d0", label: "Green" },
  { color: "#bfdbfe", label: "Blue" },
  { color: "#fbcfe8", label: "Pink" },
] as const;

export const HighlightToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);

  const { activeColor, disabled } = useEditorState(
    editor,
    (edit) => ({
      activeColor: edit.isActive("highlight")
        ? (edit.getAttributes("highlight").color as string | undefined)
        : undefined,
      disabled: !extensionPresent(edit, "highlight"),
    }),
    shallowEqual
  ) ?? { activeColor: undefined, disabled: true };

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            aria-label={labels.highlightColor}
            className={className}
            data-active={activeColor ? "true" : undefined}
            disabled={disabled}
            size="icon-sm"
            title={labels.highlightColor}
            variant="ghost"
          />
        }
      >
        <Highlighter />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-2" sideOffset={6}>
        <div className="grid grid-cols-4 gap-2">
          {HIGHLIGHT_COLORS.map((item) => (
            <button
              key={item.color}
              aria-label={item.label}
              className={cn(
                "size-6 rounded-full border border-black/10 outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring",
                activeColor === item.color && "ring-2 ring-ring ring-offset-2"
              )}
              style={{ backgroundColor: item.color }}
              title={item.label}
              type="button"
              onClick={() => {
                if (editor && !editor.isDestroyed) {
                  editor
                    .chain()
                    .focus()
                    .setHighlight({ color: item.color })
                    .run();
                }
              }}
            />
          ))}
        </div>
        {activeColor ? (
          <Button
            className="w-full"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => {
              if (editor && !editor.isDestroyed) {
                editor.chain().focus().unsetHighlight().run();
              }
            }}
          >
            {labels.removeHighlight}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
};