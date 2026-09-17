"use client";
import type { ChainedCommands, Editor } from "@tiptap/core";
import { CheckIcon, Grid3x3 as GridIcon } from "lucide-react";
import { useRef, useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import { shallowEqual, useEditorState } from "../core/editor-state";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { Popover } from "../ui/popover";
import { PopoverContent } from "../ui/popover-content";
import { Separator } from "../ui/separator";

const GRID_INIT_SIZE = 6;
const GRID_MAX_SIZE = 10;
const GRID_DEFAULT = { cols: 1, rows: 1 };

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
          aria-label={labels.insertTable}
          active={state.inTable}
          className={["ext-btn--icon-sm", className].filter(Boolean).join(" ")}
          disabled={state.disabled}
          title={labels.insertTable}
        >
          <GridIcon />
        </Button>
      }
    >
      <PopoverContent className="ext-table-toolbar-popover">
        {state.inTable ? (
          <div className="ext-table-grid" role="menu">
            <p className="ext-table-toolbar-label">{labels.rows}</p>
            <DropdownMenuItem
              onClick={() =>
                run(editor, (c) => c.addRowBefore(), state.disabled)
              }
            >
              {labels.addRowAbove}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                run(editor, (c) => c.addRowAfter(), state.disabled)
              }
            >
              {labels.addRowBelow}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canDeleteRow}
              onClick={() => run(editor, (c) => c.deleteRow(), state.disabled)}
            >
              {labels.deleteRow}
            </DropdownMenuItem>
            <Separator />
            <p className="ext-table-toolbar-label">{labels.columns}</p>
            <DropdownMenuItem
              onClick={() =>
                run(editor, (c) => c.addColumnBefore(), state.disabled)
              }
            >
              {labels.addColumnLeft}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                run(editor, (c) => c.addColumnAfter(), state.disabled)
              }
            >
              {labels.addColumnRight}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canDeleteColumn}
              onClick={() =>
                run(editor, (c) => c.deleteColumn(), state.disabled)
              }
            >
              {labels.deleteColumn}
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem
              onClick={() =>
                run(editor, (c) => c.toggleHeaderRow(), state.disabled)
              }
            >
              <span className="ext-table-toolbar-item-spacer">
                {labels.headerRow}
              </span>
              {state.headerOn ? <CheckIcon /> : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canMerge}
              onClick={() => run(editor, (c) => c.mergeCells(), state.disabled)}
            >
              {labels.mergeCells}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!state.canSplit}
              onClick={() => run(editor, (c) => c.splitCell(), state.disabled)}
            >
              {labels.splitCell}
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem
              danger
              onClick={() =>
                run(editor, (c) => c.deleteTable(), state.disabled)
              }
            >
              {labels.deleteTable}
            </DropdownMenuItem>
          </div>
        ) : (
          <div className="ext-table-grid-popover">
            <div
              className="ext-table-grid ext-table-grid--picker"
              onPointerCancel={onPointerCancel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{ touchAction: "none" }}
            >
              {createRange(gridSize.rows).map((row) => (
                <div className="ext-table-grid-row" key={`table-row-${row}`}>
                  {createRange(gridSize.cols).map((col) => (
                    <div
                      className={[
                        "ext-table-grid-cell",
                        col <= selected.cols &&
                          row <= selected.rows &&
                          "ext-table-grid-cell--selected",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      data-cols={col}
                      data-rows={row}
                      data-table-grid-cell
                      key={`table-col-${col}`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="ext-table-grid-result">
              {selected.rows} x {selected.cols}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
