"use client";

import { Button } from "@editorcn/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@editorcn/ui/components/popover";
import { Separator } from "@editorcn/ui/components/separator";
import { cn } from "@editorcn/ui/lib/utils";
import type { ChainedCommands, Editor } from "@tiptap/core";
import { CheckIcon, Grid3x3 as GridIcon } from "lucide-react";
import { useRef, useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { shallowEqual, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";

const GRID_INIT_SIZE = 6;
const GRID_MAX_SIZE = 10;
const GRID_DEFAULT = { rows: 1, cols: 1 };

const createRange = (length: number) =>
  Array.from({ length }, (_, index) => index + 1);

const run = (
  editor: Editor,
  operation: (chain: ChainedCommands) => ChainedCommands,
  disabled: boolean
) => {
  if (!editor || editor.isDestroyed || disabled) return;
  operation(editor.chain().focus()).run();
};

const menuItemClass =
  "flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";

export const TableToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);
  const [open, setOpen] = useState(false);
  const [gridSize, setGridSize] = useState({
    rows: GRID_INIT_SIZE,
    cols: GRID_INIT_SIZE,
  });
  const [selected, setSelected] = useState(GRID_DEFAULT);
  const selectedRef = useRef(GRID_DEFAULT);
  const activePointerId = useRef<number | null>(null);

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

  const resetGrid = () => {
    setGridSize({ rows: GRID_INIT_SIZE, cols: GRID_INIT_SIZE });
    selectedRef.current = GRID_DEFAULT;
    setSelected(GRID_DEFAULT);
  };

  const selectGridSize = (rows: number, cols: number) => {
    if (rows === gridSize.rows && rows < GRID_MAX_SIZE) {
      setGridSize((prev) => ({ ...prev, rows: prev.rows + 1 }));
    }
    if (cols === gridSize.cols && cols < GRID_MAX_SIZE) {
      setGridSize((prev) => ({ ...prev, cols: prev.cols + 1 }));
    }
    const next = { rows, cols };
    selectedRef.current = next;
    setSelected(next);
  };

  const selectGridFromPointer = (
    event: React.PointerEvent<HTMLDivElement>
  ): boolean => {
    const cell =
      event.target instanceof Element &&
      event.target.closest<HTMLElement>("[data-table-grid-cell]");
    if (cell && event.currentTarget.contains(cell)) {
      return selectCell(cell);
    }

    const elementAtPointer = document.elementFromPoint(
      event.clientX,
      event.clientY
    );
    const fallback = elementAtPointer?.closest<HTMLElement>(
      "[data-table-grid-cell]"
    );
    return fallback ? selectCell(fallback) : false;
  };

  const selectCell = (cell: HTMLElement): boolean => {
    const rows = Number(cell.dataset.rows);
    const cols = Number(cell.dataset.cols);
    if (Number.isNaN(rows) || Number.isNaN(cols)) return false;
    selectGridSize(rows, cols);
    return true;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }
    if (!selectGridFromPointer(event)) return;

    event.preventDefault();
    event.stopPropagation();
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== null && activePointerId.current !== event.pointerId) {
      return;
    }
    if (activePointerId.current !== null) {
      event.preventDefault();
      event.stopPropagation();
    }
    selectGridFromPointer(event);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    selectGridFromPointer(event);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId.current = null;

    const { rows, cols } = selectedRef.current;
    if (!editor || editor.isDestroyed || state.disabled) return;
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setOpen(false);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId.current = null;
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) resetGrid();
  };

  return (
    <Popover modal onOpenChange={onOpenChange} open={open}>
      <PopoverTrigger
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
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2" sideOffset={6}>
        {state.inTable ? (
          <div className="grid min-w-44 gap-0.5" role="menu">
            <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
              {labels.rows}
            </p>
            <button
              className={menuItemClass}
              type="button"
              onClick={() => run(editor!, (c) => c.addRowBefore(), state.disabled)}
            >
              {labels.addRowAbove}
            </button>
            <button
              className={menuItemClass}
              type="button"
              onClick={() => run(editor!, (c) => c.addRowAfter(), state.disabled)}
            >
              {labels.addRowBelow}
            </button>
            <button
              className={menuItemClass}
              disabled={!state.canDeleteRow}
              type="button"
              onClick={() => run(editor!, (c) => c.deleteRow(), state.disabled)}
            >
              {labels.deleteRow}
            </button>
            <Separator className="my-1" />
            <p className="px-2 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">
              {labels.columns}
            </p>
            <button
              className={menuItemClass}
              type="button"
              onClick={() => run(editor!, (c) => c.addColumnBefore(), state.disabled)}
            >
              {labels.addColumnLeft}
            </button>
            <button
              className={menuItemClass}
              type="button"
              onClick={() => run(editor!, (c) => c.addColumnAfter(), state.disabled)}
            >
              {labels.addColumnRight}
            </button>
            <button
              className={menuItemClass}
              disabled={!state.canDeleteColumn}
              type="button"
              onClick={() => run(editor!, (c) => c.deleteColumn(), state.disabled)}
            >
              {labels.deleteColumn}
            </button>
            <Separator className="my-1" />
            <button
              className={menuItemClass}
              type="button"
              onClick={() => run(editor!, (c) => c.toggleHeaderRow(), state.disabled)}
            >
              <span className="flex-1">{labels.headerRow}</span>
              {state.headerOn ? <CheckIcon className="size-4" /> : null}
            </button>
            <button
              className={menuItemClass}
              disabled={!state.canMerge}
              type="button"
              onClick={() => run(editor!, (c) => c.mergeCells(), state.disabled)}
            >
              {labels.mergeCells}
            </button>
            <button
              className={menuItemClass}
              disabled={!state.canSplit}
              type="button"
              onClick={() => run(editor!, (c) => c.splitCell(), state.disabled)}
            >
              {labels.splitCell}
            </button>
            <Separator className="my-1" />
            <button
              className={cn(
                menuItemClass,
                "text-destructive hover:bg-destructive/10 hover:text-destructive"
              )}
              type="button"
              onClick={() => run(editor!, (c) => c.deleteTable(), state.disabled)}
            >
              {labels.deleteTable}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <div
              className="flex flex-col gap-1"
              onPointerCancel={onPointerCancel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{ touchAction: "none" }}
            >
              {createRange(gridSize.rows).map((row) => (
                <div className="flex gap-1" key={`table-row-${row}`}>
                  {createRange(gridSize.cols).map((col) => (
                    <div
                      className={cn(
                        "size-4 cursor-pointer rounded-[2px] border border-border transition-colors",
                        col <= selected.cols &&
                          row <= selected.rows &&
                          "border-primary bg-primary"
                      )}
                      data-cols={col}
                      data-rows={row}
                      data-table-grid-cell
                      key={`table-col-${col}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="rounded-sm bg-muted px-2 py-1 text-center text-xs font-medium text-muted-foreground">
              {selected.rows} x {selected.cols}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};