import { Button } from "@editorcn/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@editorcn/ui/components/dropdown-menu";
import { cn } from "@editorcn/ui/lib/utils";
import type { ChainedCommands, Editor } from "@tiptap/core";
import { CheckIcon, Grid3x3 as GridIcon } from "lucide-react";
import { useCallback } from "react";

import { useEditorControls, useResolvedEditor } from "../../core/context";
import { extensionPresent } from "../../core/detection";
import { shallowEqual, useEditorState } from "../../core/editor-state";

export interface TableControlProps {
  className?: string;
  editor?: Editor | null;
}

export const TableControl = ({
  className,
  editor: editorProp,
}: TableControlProps) => {
  const { labels } = useEditorControls();
  const editor = useResolvedEditor(editorProp);

  const state = useEditorState(
    editor,
    (edit) => ({
      canDeleteColumn: edit.can().deleteColumn(),
      canDeleteRow: edit.can().deleteRow(),
      canMerge: edit.can().mergeCells(),
      canSplit: edit.can().splitCell(),
      disabled: !extensionPresent(edit, "table"),
      headerOn: edit.isActive("tableHeader"),
      inTable: edit.isActive("table"),
    }),
    shallowEqual
  ) ?? {
    canDeleteColumn: false,
    canDeleteRow: false,
    canMerge: false,
    canSplit: false,
    disabled: true,
    headerOn: false,
    inTable: false,
  };

  const run = useCallback(
    (operation: (chain: ChainedCommands) => ChainedCommands) => {
      if (!editor || editor.isDestroyed || state.disabled) {
        return;
      }
      operation(editor.chain().focus()).run();
    },
    [editor, state.disabled]
  );

  const insertTable = useCallback(() => {
    if (!editor || editor.isDestroyed || state.disabled) {
      return;
    }
    editor
      .chain()
      .focus()
      .insertTable({ cols: 3, rows: 3, withHeaderRow: true })
      .run();
  }, [editor, state.disabled]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={labels.insertTable}
            className={cn(
              "data-active:bg-accent data-active:text-accent-foreground",
              className
            )}
            data-active={state.inTable || undefined}
            disabled={state.disabled}
            size="icon-sm"
            title={labels.insertTable}
            variant="ghost"
          />
        }
      >
        <GridIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-44" sideOffset={6}>
        {state.inTable ? (
          <>
            <DropdownMenuLabel>{labels.rows}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => run((chain) => chain.addRowBefore())}
            >
              {labels.addRowAbove}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => run((chain) => chain.addRowAfter())}
            >
              {labels.addRowBelow}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canDeleteRow}
              onClick={() => run((chain) => chain.deleteRow())}
            >
              {labels.deleteRow}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => run((chain) => chain.addColumnBefore())}
            >
              {labels.addColumnLeft}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => run((chain) => chain.addColumnAfter())}
            >
              {labels.addColumnRight}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canDeleteColumn}
              onClick={() => run((chain) => chain.deleteColumn())}
            >
              {labels.deleteColumn}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => run((chain) => chain.toggleHeaderRow())}
            >
              <span className="flex-1">{labels.headerRow}</span>
              {state.headerOn ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canMerge}
              onClick={() => run((chain) => chain.mergeCells())}
            >
              {labels.mergeCells}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canSplit}
              onClick={() => run((chain) => chain.splitCell())}
            >
              {labels.splitCell}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => run((chain) => chain.deleteTable())}
            >
              {labels.deleteTable}
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={insertTable}>
            {labels.insertTable}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
