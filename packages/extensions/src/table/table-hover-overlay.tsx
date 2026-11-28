"use client";

import type { Editor } from "@tiptap/core";
import { MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import type { ExtensionLabels } from "../core/labels";
import type { ToolbarComponentProps } from "../core/types";
import { Button } from "../ui/button";
import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenu } from "../ui/dropdown-menu";
import { cn } from "../ui/utils";
import { COLUMN_ACTIONS, ROW_ACTIONS, TableActionItems } from "./actions";
import type { TableAction, TableCommand } from "./actions";

interface Box {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

interface Span {
  size: number;
  start: number;
}

interface OverlayLayout {
  clippedBottom: boolean;
  clippedRight: boolean;
  columns: Span[];
  offset: { left: number; top: number };
  rows: Span[];
  table: Box;
  visible: { height: number; width: number };
}

type OverlayMode = "pointer" | "selection";

interface GripGeometry {
  addAt: number | null;
  cross: number;
  span: Span;
}

const GRIP_THICKNESS = 12;
const GRIP_GAP = 4;
const GRIP_INSET = 2;
const MIN_SLICE = 16;
const DOT_SIZE = 20;
const ADD_SIZE = 20;
const ADD_GAP = 6;

const GRIP_CLASS =
  "ext-table-grip group/grip absolute z-2 h-auto min-w-0 animate-ext-table-pop-in rounded-sm border-border bg-popover p-0 text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] before:absolute before:content-[''] hover:bg-accent hover:text-foreground active:scale-100 data-[state=open]:border-primary data-[state=open]:bg-primary data-[state=open]:text-primary-foreground [&>svg]:size-3";

const COLUMN_GRIP_CLASS =
  "ext-table-grip--column before:inset-x-0 before:-top-1 before:-bottom-1 [@media(pointer:coarse)]:before:-top-7";

const ROW_GRIP_CLASS =
  "ext-table-grip--row before:inset-y-0 before:-right-1 before:-left-1 [@media(pointer:coarse)]:before:-left-7";

const DOT_CLASS =
  "ext-table-add-dot absolute z-3 size-5 min-w-0 animate-ext-table-pop-in rounded-full border-border bg-popover p-0 text-muted-foreground shadow-[0_1px_2px_rgba(0,0,0,0.08)] before:absolute before:-inset-1 before:rounded-full before:content-[''] hover:bg-accent hover:text-foreground [@media(pointer:coarse)]:before:-inset-3 [&>svg]:size-3";

const ADD_CLASS =
  "ext-table-add absolute h-auto min-w-0 animate-ext-table-pop-in rounded-sm border-border bg-popover p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-100 [&>svg]:size-3.5";

const toBox = (
  left: number,
  top: number,
  right: number,
  bottom: number
): Box => ({
  bottom,
  height: bottom - top,
  left,
  right,
  top,
  width: right - left,
});

const intersect = (a: Box, b: Box): Box =>
  toBox(
    Math.max(a.left, b.left),
    Math.max(a.top, b.top),
    Math.min(a.right, b.right),
    Math.min(a.bottom, b.bottom)
  );

const isCollapsed = (box: Box): boolean => box.width <= 0 || box.height <= 0;

const clientBox = (node: HTMLElement): Box => {
  const r = node.getBoundingClientRect();
  const left = r.left + node.clientLeft;
  const top = r.top + node.clientTop;
  return toBox(left, top, left + node.clientWidth, top + node.clientHeight);
};

const visibleBounds = (dom: HTMLElement): Box | null => {
  let bounds: Box | null = null;
  for (let node: HTMLElement | null = dom; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.overflowX === "visible" && style.overflowY === "visible") {
      continue;
    }
    const box = clientBox(node);
    bounds = bounds ? intersect(bounds, box) : box;
    if (isCollapsed(bounds)) {
      return null;
    }
  }
  if (bounds) {
    return bounds;
  }
  const r = dom.getBoundingClientRect();
  return toBox(r.left, r.top, r.right, r.bottom);
};

const cellChildren = (row: Element): HTMLElement[] =>
  [...row.children].filter(
    (cell) => cell.tagName === "TD" || cell.tagName === "TH"
  ) as HTMLElement[];

const measureLayout = (
  anchor: HTMLElement,
  dom: HTMLElement,
  table: HTMLElement
): OverlayLayout | null => {
  const visible = visibleBounds(dom);
  if (!visible || !table.isConnected) {
    return null;
  }

  const tRect = table.getBoundingClientRect();
  const tableBox = toBox(tRect.left, tRect.top, tRect.right, tRect.bottom);
  let tableBounds = intersect(tableBox, visible);

  const scroller = table.closest<HTMLElement>(".tableWrapper");
  if (scroller) {
    const sBox = clientBox(scroller);
    tableBounds = intersect(
      tableBounds,
      toBox(sBox.left, tableBounds.top, sBox.right, tableBounds.bottom)
    );
  }

  if (isCollapsed(tableBounds)) {
    return null;
  }

  const anchorRect = anchor.getBoundingClientRect();
  const rowElements = [...table.querySelectorAll("tr")];
  let widestCells: HTMLElement[] = [];
  for (const rowEl of rowElements) {
    const cells = cellChildren(rowEl);
    if (cells.length > widestCells.length) {
      widestCells = cells;
    }
  }

  const originX = visible.left;
  const originY = visible.top;

  return {
    clippedBottom: tableBox.bottom > tableBounds.bottom + 1,
    clippedRight: tableBox.right > tableBounds.right + 1,
    columns: widestCells.map((cell) => {
      const r = cell.getBoundingClientRect();
      return { size: r.width, start: r.left - originX };
    }),
    offset: {
      left: visible.left - anchorRect.left,
      top: visible.top - anchorRect.top,
    },
    rows: rowElements.map((rowEl) => {
      const r = rowEl.getBoundingClientRect();
      return { size: r.height, start: r.top - originY };
    }),
    table: toBox(
      tableBounds.left - originX,
      tableBounds.top - originY,
      tableBounds.right - originX,
      tableBounds.bottom - originY
    ),
    visible: { height: visible.height, width: visible.width },
  };
};

const visibleSlice = (span: Span, from: number, to: number): Span | null => {
  const start = Math.max(span.start, from);
  const end = Math.min(span.start + span.size, to);
  return end - start < MIN_SLICE ? null : { size: end - start, start };
};

const borderWithin = (span: Span, from: number, to: number): number | null => {
  const border = span.start + span.size;
  return border >= from - 0.5 && border <= to + 0.5 ? border : null;
};

const columnGeometry = (
  layout: OverlayLayout,
  index: number | null,
  withAdd: boolean
): GripGeometry | null => {
  const column = index === null ? undefined : layout.columns[index];
  if (!column) {
    return null;
  }
  const { table } = layout;
  const span = visibleSlice(column, table.left, table.right);
  if (!span) {
    return null;
  }
  return {
    addAt: withAdd ? borderWithin(column, table.left, table.right) : null,
    cross: Math.max(0, table.top - GRIP_GAP - GRIP_THICKNESS),
    span,
  };
};

const rowGeometry = (
  layout: OverlayLayout,
  index: number | null,
  withAdd: boolean
): GripGeometry | null => {
  const row = index === null ? undefined : layout.rows[index];
  if (!row) {
    return null;
  }
  const { table } = layout;
  const span = visibleSlice(row, table.top, table.bottom);
  if (!span) {
    return null;
  }
  return {
    addAt: withAdd ? borderWithin(row, table.top, table.bottom) : null,
    cross: Math.max(0, table.left - GRIP_GAP - GRIP_THICKNESS),
    span,
  };
};

const gripLength = (geometry: GripGeometry): number =>
  geometry.span.size -
  GRIP_INSET * 2 -
  (geometry.addAt === null ? 0 : DOT_SIZE / 2);

interface GripProps {
  axis: "column" | "row";
  geometry: GripGeometry;
  labels: ExtensionLabels;
  menuOpen: boolean;
  onAdd: () => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (action: TableAction) => void;
}

const Grip = ({
  axis,
  geometry,
  labels,
  menuOpen,
  onAdd,
  onOpenChange,
  onSelect,
}: GripProps) => {
  const isColumn = axis === "column";
  const { addAt, cross, span } = geometry;
  const length = gripLength(geometry);
  const crossCenter = cross + GRIP_THICKNESS / 2;

  return (
    <>
      <DropdownMenu
        open={menuOpen}
        onOpenChange={onOpenChange}
        side={isColumn ? "bottom" : "right"}
        trigger={
          <Button
            className={cn(
              GRIP_CLASS,
              isColumn ? COLUMN_GRIP_CLASS : ROW_GRIP_CLASS
            )}
            data-state={menuOpen ? "open" : "closed"}
            style={
              isColumn
                ? {
                    height: GRIP_THICKNESS,
                    left: span.start + GRIP_INSET,
                    top: cross,
                    width: length,
                  }
                : {
                    height: length,
                    left: cross,
                    top: span.start + GRIP_INSET,
                    width: GRIP_THICKNESS,
                  }
            }
            tooltip={isColumn ? labels.columnActions : labels.rowActions}
            tooltipSide="top"
          >
            {isColumn ? <MoreHorizontal /> : <MoreVertical />}
          </Button>
        }
      >
        <DropdownMenuContent>
          <TableActionItems
            groups={isColumn ? COLUMN_ACTIONS : ROW_ACTIONS}
            labels={labels}
            onSelect={onSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      {addAt === null ? null : (
        <Button
          className={DOT_CLASS}
          style={
            isColumn
              ? {
                  left: addAt - DOT_SIZE / 2,
                  top: crossCenter - DOT_SIZE / 2,
                }
              : {
                  left: crossCenter - DOT_SIZE / 2,
                  top: addAt - DOT_SIZE / 2,
                }
          }
          tooltip={isColumn ? labels.addColumnRight : labels.addRowBelow}
          tooltipSide="top"
          onClick={onAdd}
        >
          <Plus />
        </Button>
      )}
    </>
  );
};

interface EdgeAddProps {
  labels: ExtensionLabels;
  layout: OverlayLayout;
  onAddColumn: () => void;
  onAddRow: () => void;
  showColumn: boolean;
  showRow: boolean;
}

const EdgeAdd = ({
  labels,
  layout,
  onAddColumn,
  onAddRow,
  showColumn,
  showRow,
}: EdgeAddProps) => {
  const { table } = layout;
  return (
    <>
      {showColumn ? (
        <Button
          className={cn(ADD_CLASS, "ext-table-add--column")}
          style={{
            height: table.height,
            left: table.right + ADD_GAP,
            top: table.top,
            width: ADD_SIZE,
          }}
          tooltip={labels.addColumn}
          onClick={onAddColumn}
        >
          <Plus />
        </Button>
      ) : null}
      {showRow ? (
        <Button
          className={cn(ADD_CLASS, "ext-table-add--row")}
          style={{
            height: ADD_SIZE,
            left: table.left,
            top: table.bottom + ADD_GAP,
            width: table.width,
          }}
          tooltip={labels.addRow}
          onClick={onAddRow}
        >
          <Plus />
        </Button>
      ) : null}
    </>
  );
};

const edgeVisibility = (
  layout: OverlayLayout | null,
  withAdd: boolean,
  column: GripGeometry | null,
  row: GripGeometry | null,
  hoveredCol: number | null,
  hoveredRow: number | null
): { column: boolean; row: boolean } => {
  if (!layout || withAdd) {
    return { column: false, row: false };
  }
  const { clippedBottom, clippedRight, columns, rows, table, visible } = layout;
  return {
    column:
      column !== null &&
      hoveredCol === columns.length - 1 &&
      !clippedRight &&
      table.right + ADD_GAP + ADD_SIZE <= visible.width,
    row:
      row !== null &&
      hoveredRow === rows.length - 1 &&
      !clippedBottom &&
      table.bottom + ADD_GAP + ADD_SIZE <= visible.height,
  };
};

const selectedCell = (editor: Editor): HTMLElement | null => {
  try {
    const { node } = editor.view.domAtPos(editor.state.selection.from);
    const element = node instanceof HTMLElement ? node : node.parentElement;
    const cell = element?.closest<HTMLElement>("td, th") ?? null;
    return cell && editor.view.dom.contains(cell) ? cell : null;
  } catch {
    return null;
  }
};

export const TableHoverOverlay = ({
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);

  const anchorRef = useRef<HTMLDivElement>(null);
  const activeTableRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointerRef = useRef("mouse");
  const modeRef = useRef<OverlayMode>("pointer");

  const [layout, setLayout] = useState<OverlayLayout | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [mode, setMode] = useState<OverlayMode>("pointer");
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);

  const isEditable = editor?.isEditable ?? false;
  const hasTable = editor ? extensionPresent(editor, "table") : false;
  const isActive = hoveredCol !== null || hoveredRow !== null;

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const resetHover = useCallback(() => {
    activeTableRef.current = null;
    setHoveredCol(null);
    setHoveredRow(null);
    setColMenuOpen(false);
    setRowMenuOpen(false);
  }, []);

  const scheduleHide = useCallback(() => {
    cancelHide();
    hideTimer.current = setTimeout(resetHover, 200);
  }, [cancelHide, resetHover]);

  const switchMode = useCallback((next: OverlayMode) => {
    modeRef.current = next;
    setMode(next);
  }, []);

  const recompute = useCallback(() => {
    const table = activeTableRef.current;
    const anchor = anchorRef.current;
    const dom = editor?.view.dom as HTMLElement | undefined;
    setLayout(
      table && anchor && dom ? measureLayout(anchor, dom, table) : null
    );
  }, [editor]);

  const trackCell = useCallback(
    (cell: HTMLElement) => {
      const table = cell.closest<HTMLElement>("table");
      const rowEl = cell.parentElement;
      if (!table || !rowEl) {
        return;
      }
      if (activeTableRef.current !== table) {
        setColMenuOpen(false);
        setRowMenuOpen(false);
      }
      activeTableRef.current = table;
      const colIdx = [...rowEl.children].indexOf(cell);
      const rowIdx = [...table.querySelectorAll("tr")].indexOf(
        rowEl as HTMLTableRowElement
      );
      if (colIdx !== -1) {
        setHoveredCol(colIdx);
      }
      if (rowIdx !== -1) {
        setHoveredRow(rowIdx);
      }
      recompute();
    },
    [recompute]
  );

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      lastPointerRef.current = e.pointerType;
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    const dom = editor.view.dom as HTMLElement;

    const handleOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        return;
      }
      const target = e.target as HTMLElement;
      if (!dom.contains(target)) {
        return;
      }
      const tableWrapper = target.closest?.(".tableWrapper") as
        | HTMLElement
        | null
        | undefined;
      if (!tableWrapper) {
        scheduleHide();
        return;
      }

      cancelHide();

      const cell = target.closest?.("td, th") as HTMLElement | undefined;
      if (!cell?.closest("table")) {
        if (
          activeTableRef.current &&
          !tableWrapper.contains(activeTableRef.current)
        ) {
          scheduleHide();
        }
        return;
      }

      switchMode("pointer");
      trackCell(cell);
    };

    const handleLeave = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") {
        return;
      }
      const related = e.relatedTarget as HTMLElement | null;
      if (
        related &&
        (anchorRef.current?.contains(related) ||
          (related instanceof HTMLElement &&
            Boolean(related.closest("[data-ext-floating]"))))
      ) {
        cancelHide();
        return;
      }
      scheduleHide();
    };

    const handleSelection = () => {
      if (lastPointerRef.current === "mouse" || editor.isDestroyed) {
        return;
      }
      const cell = selectedCell(editor);
      if (cell) {
        cancelHide();
        switchMode("selection");
        trackCell(cell);
      } else if (modeRef.current === "selection") {
        resetHover();
      }
    };

    const handleOverlayOver = () => {
      cancelHide();
    };

    dom.addEventListener("pointerover", handleOver);
    dom.addEventListener("pointerleave", handleLeave);
    editor.on("selectionUpdate", handleSelection);
    const anchor = anchorRef.current;
    anchor?.addEventListener("pointerover", handleOverlayOver);
    return () => {
      dom.removeEventListener("pointerover", handleOver);
      dom.removeEventListener("pointerleave", handleLeave);
      editor.off("selectionUpdate", handleSelection);
      anchor?.removeEventListener("pointerover", handleOverlayOver);
      cancelHide();
      resetHover();
    };
  }, [editor, cancelHide, scheduleHide, resetHover, switchMode, trackCell]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let frame: number;
    const loop = () => {
      recompute();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [isActive, recompute]);

  const withAdd = mode === "selection";
  const column = layout ? columnGeometry(layout, hoveredCol, withAdd) : null;
  const row = layout ? rowGeometry(layout, hoveredRow, withAdd) : null;
  if (column === null && colMenuOpen) {
    setColMenuOpen(false);
  }
  if (row === null && rowMenuOpen) {
    setRowMenuOpen(false);
  }

  const cellAt = (rowIdx: number, colIdx: number): HTMLElement | undefined => {
    const table = activeTableRef.current;
    if (!table) {
      return undefined;
    }
    const rowEl = table.querySelectorAll("tr")[rowIdx];
    const cell = rowEl?.children[colIdx] as HTMLElement | undefined;
    return cell?.tagName === "TD" || cell?.tagName === "TH" ? cell : undefined;
  };

  const runCellOp = (cell: HTMLElement | undefined, op: TableCommand) => {
    if (!editor || editor.isDestroyed || cell === undefined) {
      return;
    }
    const pos = editor.view.posAtDOM(cell, 0, 0);
    if (pos === null || pos === undefined) {
      return;
    }
    op(editor.chain().focus().setTextSelection(pos)).run();
  };

  const runColumnOp = (op: TableCommand) => {
    runCellOp(cellAt(0, hoveredCol ?? 0), op);
  };

  const runRowOp = (op: TableCommand) => {
    runCellOp(cellAt(hoveredRow ?? 0, 0), op);
  };

  if (!hasTable || !isEditable) {
    return null;
  }

  const edge = edgeVisibility(
    layout,
    withAdd,
    column,
    row,
    hoveredCol,
    hoveredRow
  );

  return (
    <div
      ref={anchorRef}
      className="ext-table-overlay absolute top-0 left-0 size-0 overflow-visible"
    >
      {layout ? (
        <div
          className="ext-table-clip pointer-events-none absolute overflow-hidden *:pointer-events-auto"
          style={{
            height: layout.visible.height,
            left: layout.offset.left,
            top: layout.offset.top,
            width: layout.visible.width,
          }}
        >
          {column ? (
            <Grip
              axis="column"
              geometry={column}
              labels={labels}
              menuOpen={colMenuOpen}
              onAdd={() => runColumnOp((c) => c.addColumnAfter())}
              onOpenChange={setColMenuOpen}
              onSelect={(action) => {
                runColumnOp(action.command);
                setColMenuOpen(false);
              }}
            />
          ) : null}
          {row ? (
            <Grip
              axis="row"
              geometry={row}
              labels={labels}
              menuOpen={rowMenuOpen}
              onAdd={() => runRowOp((c) => c.addRowAfter())}
              onOpenChange={setRowMenuOpen}
              onSelect={(action) => {
                runRowOp(action.command);
                setRowMenuOpen(false);
              }}
            />
          ) : null}
          <EdgeAdd
            labels={labels}
            layout={layout}
            onAddColumn={() => runColumnOp((c) => c.addColumnAfter())}
            onAddRow={() => runRowOp((c) => c.addRowAfter())}
            showColumn={edge.column}
            showRow={edge.row}
          />
        </div>
      ) : null}
    </div>
  );
};
