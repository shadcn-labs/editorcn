"use client";
import type { ChainedCommands, Editor } from "@tiptap/core";
import { Grid3x3 as GridIcon } from "lucide-react";
import { useRef, useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { shallowEqual, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";
import { Separator } from "../ui/separator";
import { cn } from "../ui/utils";
import { COLUMN_ACTIONS, ROW_ACTIONS, TableActionItems } from "./actions";
import type { TableAction } from "./actions";

const GRID_INIT_SIZE = 6;
const GRID_MAX_SIZE = 10;
const GRID_DEFAULT = { cols: 1, rows: 1 };

const SECTION_LABEL_CLASS =
  "ext-table-toolbar-label px-2 pt-1 pb-1.5 text-[0.75rem] font-medium text-muted-foreground";

const createRange = (length: number) =>
  Array.from({ length }, (_, index) => index + 1);

const selectionInTable = (editor: Editor): boolean => {
  const { $head } = editor.state.selection;
  for (let { depth } = $head; depth > 0; depth -= 1) {
    if ($head.node(depth).type.spec.tableRole === "row") {
      return true;
    }
  }
  return false;
};

const findFirstCellPos = (editor: Editor): number => {
  let position = -1;
  editor.state.doc.descendants((node, nodePos) => {
    if (position !== -1) {
      return false;
    }
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      position = nodePos + 1;
      return false;
    }
    return true;
  });
  return position;
};

const run = (
  editor: Editor | null,
  operation: (chain: ChainedCommands) => ChainedCommands,
  disabled: boolean
) => {
  if (!editor || editor.isDestroyed || disabled) {
    return;
  }
  const chain = editor.chain().focus();
  if (!selectionInTable(editor)) {
    const position = findFirstCellPos(editor);
    if (position !== -1) {
      chain.setTextSelection(position);
    }
  }
  operation(chain).run();
};

export const TableToolbar = ({
  className,
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);
  const [open, setOpen] = useState(false);
  const [gridSize, setGridSize] = useState({
    cols: GRID_INIT_SIZE,
    rows: GRID_INIT_SIZE,
  });
  const [selected, setSelected] = useState(GRID_DEFAULT);
  const selectedRef = useRef(GRID_DEFAULT);
  const activePointerId = useRef<number | null>(null);

  const state = useEditorState(
    editor,
    (edit) =>
      extensionPresent(edit, "table")
        ? {
            canDeleteColumn: edit.can().deleteColumn(),
            canDeleteRow: edit.can().deleteRow(),
            canMerge: edit.can().mergeCells(),
            canSplit: edit.can().splitCell(),
            disabled: false,
            headerOn: edit.isActive("tableHeader"),
            inTable: edit.isActive("table"),
          }
        : {
            canDeleteColumn: false,
            canDeleteRow: false,
            canMerge: false,
            canSplit: false,
            disabled: true,
            headerOn: false,
            inTable: false,
          },
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
    setGridSize({ cols: GRID_INIT_SIZE, rows: GRID_INIT_SIZE });
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
    const next = { cols, rows };
    selectedRef.current = next;
    setSelected(next);
  };

  const selectCell = (cell: HTMLElement): boolean => {
    const rows = Number(cell.dataset.rows);
    const cols = Number(cell.dataset.cols);
    if (Number.isNaN(rows) || Number.isNaN(cols)) {
      return false;
    }
    selectGridSize(rows, cols);
    return true;
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

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !event.isPrimary ||
      (event.pointerType === "mouse" && event.button !== 0)
    ) {
      return;
    }
    if (!selectGridFromPointer(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    activePointerId.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      activePointerId.current !== null &&
      activePointerId.current !== event.pointerId
    ) {
      return;
    }
    if (activePointerId.current !== null) {
      event.preventDefault();
      event.stopPropagation();
    }
    selectGridFromPointer(event);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    selectGridFromPointer(event);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId.current = null;
    const { rows, cols } = selectedRef.current;
    if (!editor || editor.isDestroyed || state.disabled) {
      return;
    }
    editor
      .chain()
      .focus()
      .insertTable({ cols, rows, withHeaderRow: true })
      .run();
    setOpen(false);
  };

  const onPointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== event.pointerId) {
      return;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    activePointerId.current = null;
  };

  const select = (action: TableAction) => {
    run(editor, action.command, state.disabled);
    if (action.id !== "headerRow") {
      setOpen(false);
    }
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      resetGrid();
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      align="start"
      sideOffset={6}
      trigger={
        <Button
          active={state.inTable}
          className={className}
          size="icon-sm"
          disabled={state.disabled}
          tooltip={labels.insertTable}
        >
          <GridIcon />
        </Button>
      }
    >
      <PopoverContent
        className={cn(
          "ext-table-toolbar-popover flex flex-col gap-1.5",
          state.inTable ? "p-1" : "p-2"
        )}
      >
        {state.inTable ? (
          <div
            className="ext-table-grid flex min-w-52 flex-col gap-1"
            role="menu"
          >
            <p className={SECTION_LABEL_CLASS}>{labels.rows}</p>
            <TableActionItems
              disabled={{ deleteRow: !state.canDeleteRow }}
              groups={[ROW_ACTIONS.flat()]}
              labels={labels}
              onSelect={select}
            />
            <Separator />
            <p className={SECTION_LABEL_CLASS}>{labels.columns}</p>
            <TableActionItems
              disabled={{ deleteColumn: !state.canDeleteColumn }}
              groups={[COLUMN_ACTIONS.flat()]}
              labels={labels}
              onSelect={select}
            />
            <Separator />
            <TableActionItems
              checked={{ headerRow: state.headerOn }}
              disabled={{
                mergeCells: !state.canMerge,
                splitCell: !state.canSplit,
              }}
              groups={[
                ["headerRow", "mergeCells", "splitCell"],
                ["deleteTable"],
              ]}
              labels={labels}
              onSelect={select}
            />
          </div>
        ) : (
          <div className="ext-table-grid-popover flex flex-col gap-1.5">
            <div
              className="ext-table-grid ext-table-grid--picker flex min-w-44 flex-col gap-1"
              onPointerCancel={onPointerCancel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{ touchAction: "none" }}
            >
              {createRange(gridSize.rows).map((row) => (
                <div
                  className="ext-table-grid-row flex gap-1"
                  key={`table-row-${row}`}
                >
                  {createRange(gridSize.cols).map((col) => (
                    <div
                      className={cn(
                        "ext-table-grid-cell size-4 cursor-pointer rounded-[2px] border border-border [transition:background-color_100ms_ease-out,border-color_100ms_ease-out]",
                        col <= selected.cols &&
                          row <= selected.rows &&
                          "ext-table-grid-cell--selected border-primary bg-primary"
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
            <div className="ext-table-grid-result rounded-sm bg-muted px-2 py-1 text-center text-[0.75rem] font-medium text-muted-foreground">
              {selected.rows} x {selected.cols}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
