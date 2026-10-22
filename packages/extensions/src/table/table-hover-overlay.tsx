"use client";

import type { ChainedCommands } from "@tiptap/core";
import {
  MoreHorizontal,
  MoreVertical,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useToolbar, useToolbarEditor } from "../core/context";
import { extensionPresent } from "../core/detection";
import type { ExtensionLabels } from "../core/labels";
import type { ToolbarComponentProps } from "../core/types";
import { DropdownMenuContent } from "../ui/dropdown-content";
import { DropdownMenuItem } from "../ui/dropdown-item";
import { DropdownMenu } from "../ui/dropdown-menu";
import { DropdownMenuSeparator } from "../ui/dropdown-separator";

interface Box {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

interface TableColumnLayout {
  left: number;
  width: number;
}

interface TableRowLayout {
  height: number;
  top: number;
}

/**
 * Everything the overlay draws for one frame.
 *
 * `visible` is the editor's visible box — the intersection of every scroll/clip
 * container above the editable area. The controls live inside a clip box of
 * exactly that size, so a handle can never paint over the surrounding UI, and
 * the box is what `columns`, `rows` and `table` are measured against.
 */
interface OverlayLayout {
  /** The table's trailing edge is under the scroll box, so it has no handle. */
  clippedBottom: boolean;
  clippedRight: boolean;
  columns: TableColumnLayout[];
  /** Offset of the visible box from the overlay's origin. */
  offset: { left: number; top: number };
  rows: TableRowLayout[];
  /** The part of the table that is on screen. */
  table: Box;
  /** Size of the editor's visible box. */
  visible: { height: number; width: number };
}

/** Half of a 1.1rem grip, so grips stay fully inside the visible box. */
const GRIP_INSET = 9;
/** Footprint of the add handles. */
const ADD_SIZE = 20;
/** Gap between the table edge and an add handle. */
const ADD_GAP = 6;

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

/** Visible area of a scroll/clip container, without its borders or scrollbars. */
const clientBox = (node: HTMLElement): Box => {
  const r = node.getBoundingClientRect();
  const left = r.left + node.clientLeft;
  const top = r.top + node.clientTop;
  return toBox(left, top, left + node.clientWidth, top + node.clientHeight);
};

/**
 * Visible box of the editor in viewport coordinates: the intersection of every
 * scroll or clip container between the editable area and the document.
 *
 * The table node view's `.tableWrapper` is not part of this chain — it hugs the
 * table, so intersecting with it would cut the row handle under its bottom
 * padding. Its visible width is applied separately while measuring the table.
 */
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
  // Nothing clips the editor, so its own box is the visible area.
  const r = dom.getBoundingClientRect();
  return toBox(r.left, r.top, r.right, r.bottom);
};

/**
 * Center of the visible slice of `start`/`size` inside `from`/`to`, or `null`
 * when it is scrolled out entirely. The center is nudged so the grip stays
 * fully inside the visible box.
 */
const fitCenter = (
  start: number,
  size: number,
  from: number,
  to: number
): number | null => {
  const visibleFrom = Math.max(start, from);
  const visibleTo = Math.min(start + size, to);
  if (visibleTo - visibleFrom <= 0) {
    return null;
  }
  const min = from + GRIP_INSET;
  const max = Math.max(min, to - GRIP_INSET);
  return Math.min(Math.max((visibleFrom + visibleTo) / 2, min), max);
};

/** Keep a grip that straddles a table edge fully inside the visible box. */
const fitEdge = (value: number, from: number, to: number): number => {
  const min = from + GRIP_INSET;
  const max = Math.max(min, to - GRIP_INSET);
  return Math.min(Math.max(value, min), max);
};

const cellChildren = (row: Element): HTMLElement[] =>
  [...row.children].filter(
    (cell) => cell.tagName === "TD" || cell.tagName === "TH"
  ) as HTMLElement[];

/**
 * Measure the hovered table for one frame, or `null` when it has no visible
 * part to draw controls for.
 */
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

  // The node view scrolls wide tables sideways. Its scrollport is a fixed box in
  // viewport coordinates — the table's own rect already accounts for how far it
  // is scrolled — so narrowing the table to that width gives the part of the
  // table that is actually on screen. Folding `scrollLeft` in here would shift
  // the box and collapse it once the table is scrolled past its own width.
  //
  // Only the width is narrowed: the scroller's client height excludes the
  // horizontal scrollbar, so intersecting vertically would clip the table's
  // last row.
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

  // Controls are placed inside the clip box, so they are measured relative to
  // the visible box's top-left corner.
  const originX = visible.left;
  const originY = visible.top;

  return {
    clippedBottom: tableBox.bottom > tableBounds.bottom + 1,
    clippedRight: tableBox.right > tableBounds.right + 1,
    columns: widestCells.map((cell) => {
      const r = cell.getBoundingClientRect();
      return { left: r.left - originX, width: r.width };
    }),
    offset: {
      left: visible.left - anchorRect.left,
      top: visible.top - anchorRect.top,
    },
    rows: rowElements.map((rowEl) => {
      const r = rowEl.getBoundingClientRect();
      return { height: r.height, top: r.top - originY };
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

interface ColumnControlProps {
  colCenter: number;
  labels: ExtensionLabels;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  runColumnOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  top: number;
}

const ColumnControl = ({
  colCenter,
  labels,
  menuOpen,
  onOpenChange,
  runColumnOp,
  top,
}: ColumnControlProps) => (
  <div
    className="ext-table-control ext-table-control--column"
    style={{
      left: colCenter,
      top,
      transform: "translate(-50%, -50%)",
    }}
  >
    <DropdownMenu
      open={menuOpen}
      onOpenChange={onOpenChange}
      side="bottom"
      trigger={
        <button
          type="button"
          aria-label={labels.columnActions}
          className="ext-table-grip"
          data-state={menuOpen ? "open" : "closed"}
        >
          <span
            className="ext-table-grip-stroke ext-table-grip-stroke--column"
            aria-hidden
          />
          <MoreHorizontal />
        </button>
      }
    >
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => runColumnOp((c) => c.addColumnBefore())}
        >
          <ArrowLeft />
          {labels.addColumnLeft}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => runColumnOp((c) => c.addColumnAfter())}
        >
          <ArrowRight />
          {labels.addColumnRight}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          danger
          onClick={() => runColumnOp((c) => c.deleteColumn())}
        >
          <Trash2 />
          {labels.deleteColumn}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

interface RowControlProps {
  labels: ExtensionLabels;
  left: number;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rowCenter: number;
  runRowOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
}

const RowControl = ({
  labels,
  left,
  menuOpen,
  onOpenChange,
  rowCenter,
  runRowOp,
}: RowControlProps) => (
  <div
    className="ext-table-control ext-table-control--row"
    style={{
      left,
      top: rowCenter,
      transform: "translate(-50%, -50%)",
    }}
  >
    <DropdownMenu
      open={menuOpen}
      onOpenChange={onOpenChange}
      side="right"
      trigger={
        <button
          type="button"
          aria-label={labels.rowActions}
          className="ext-table-grip ext-table-grip--row"
          data-state={menuOpen ? "open" : "closed"}
        >
          <span
            className="ext-table-grip-stroke ext-table-grip-stroke--row"
            aria-hidden
          />
          <MoreVertical />
        </button>
      }
    >
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => runRowOp((c) => c.addRowBefore())}>
          <ArrowUp />
          {labels.addRowAbove}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => runRowOp((c) => c.addRowAfter())}>
          <ArrowDown />
          {labels.addRowBelow}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem danger onClick={() => runRowOp((c) => c.deleteRow())}>
          <Trash2 />
          {labels.deleteRow}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);

interface AddHandlesProps {
  labels: ExtensionLabels;
  runColumnOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  runRowOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  showColumn: boolean;
  showRow: boolean;
  tableRect: Box;
}

const AddHandles = ({
  labels,
  runColumnOp,
  runRowOp,
  showColumn,
  showRow,
  tableRect,
}: AddHandlesProps) => (
  <>
    {showColumn ? (
      <button
        type="button"
        aria-label={labels.addColumnRight}
        className="ext-table-add"
        style={{
          cursor: "col-resize",
          height: tableRect.height,
          left: tableRect.right + ADD_GAP,
          top: tableRect.top,
          width: ADD_SIZE,
        }}
        title={labels.addColumnRight}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            runColumnOp((c) => c.addColumnAfter());
          }
        }}
        onClick={() => runColumnOp((c) => c.addColumnAfter())}
      >
        <Plus />
      </button>
    ) : null}
    {showRow ? (
      <button
        type="button"
        aria-label={labels.addRowBelow}
        className="ext-table-add"
        style={{
          cursor: "row-resize",
          height: ADD_SIZE,
          left: tableRect.left,
          top: tableRect.bottom + ADD_GAP,
          width: tableRect.width,
        }}
        title={labels.addRowBelow}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            runRowOp((c) => c.addRowAfter());
          }
        }}
        onClick={() => runRowOp((c) => c.addRowAfter())}
      >
        <Plus />
      </button>
    ) : null}
  </>
);

interface OverlayControlsProps {
  colMenuOpen: boolean;
  hoveredCol: number | null;
  hoveredRow: number | null;
  labels: ExtensionLabels;
  layout: OverlayLayout | null;
  onColMenuOpenChange: (open: boolean) => void;
  onRowMenuOpenChange: (open: boolean) => void;
  rowMenuOpen: boolean;
  runColumnOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  runRowOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
}

const OverlayControls = ({
  colMenuOpen,
  hoveredCol,
  hoveredRow,
  labels,
  layout,
  onColMenuOpenChange,
  onRowMenuOpenChange,
  rowMenuOpen,
  runColumnOp,
  runRowOp,
}: OverlayControlsProps) => {
  if (!layout) {
    return null;
  }

  const { clippedBottom, clippedRight, columns, rows, table, visible } = layout;
  const column = hoveredCol === null ? undefined : columns[hoveredCol];
  const row = hoveredRow === null ? undefined : rows[hoveredRow];

  // Derived from the measured layout every frame, so the grips follow the table
  // while it scrolls or resizes instead of freezing on the cell that was hovered
  // when they appeared.
  const colCenter = column
    ? fitCenter(column.left, column.width, 0, visible.width)
    : null;
  const rowCenter = row
    ? fitCenter(row.top, row.height, 0, visible.height)
    : null;

  // The trailing handles sit outside the table, so they are only shown when the
  // table's trailing edge is on screen and their whole footprint still fits
  // inside the visible box — otherwise the clip would cut them in half.
  const showColumn =
    colCenter !== null &&
    hoveredCol === columns.length - 1 &&
    !clippedRight &&
    table.right + ADD_GAP + ADD_SIZE <= visible.width;
  const showRow =
    rowCenter !== null &&
    hoveredRow === rows.length - 1 &&
    !clippedBottom &&
    table.bottom + ADD_GAP + ADD_SIZE <= visible.height;

  return (
    <>
      {colCenter !== null && (
        <ColumnControl
          colCenter={colCenter}
          labels={labels}
          menuOpen={colMenuOpen}
          onOpenChange={onColMenuOpenChange}
          runColumnOp={runColumnOp}
          top={fitEdge(table.top, 0, visible.height)}
        />
      )}
      {rowCenter !== null && (
        <RowControl
          labels={labels}
          left={fitEdge(table.left, 0, visible.width)}
          menuOpen={rowMenuOpen}
          onOpenChange={onRowMenuOpenChange}
          rowCenter={rowCenter}
          runRowOp={runRowOp}
        />
      )}
      <AddHandles
        labels={labels}
        runColumnOp={runColumnOp}
        runRowOp={runRowOp}
        showColumn={showColumn}
        showRow={showRow}
        tableRect={table}
      />
    </>
  );
};

export const TableHoverOverlay = ({
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);

  const anchorRef = useRef<HTMLDivElement>(null);
  const activeTableRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [layout, setLayout] = useState<OverlayLayout | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);

  const isEditable = editor?.isEditable ?? false;
  const hasTable = editor ? extensionPresent(editor, "table") : false;
  // The measure loop runs while a table is hovered, not while it is laid out.
  // A table scrolled out of view has no layout to show, and stopping the loop
  // there would leave it blank when it scrolls back in.
  const isActive = hoveredCol !== null || hoveredRow !== null;

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      activeTableRef.current = null;
      setHoveredCol(null);
      setHoveredRow(null);
      setColMenuOpen(false);
      setRowMenuOpen(false);
    }, 200);
  }, []);

  const cancelHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const recompute = useCallback(() => {
    const table = activeTableRef.current;
    const anchor = anchorRef.current;
    const dom = editor?.view.dom as HTMLElement | undefined;
    setLayout(
      table && anchor && dom ? measureLayout(anchor, dom, table) : null
    );
  }, [editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }
    const dom = editor.view.dom as HTMLElement;

    const handleOver = (e: PointerEvent) => {
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
      const table = cell?.closest?.("table") as HTMLElement | undefined;
      if (!cell || !table) {
        // The pointer is in the wrapper's scroll gutter, not on a cell. The
        // handles stay where they are — that is intentional — unless this is a
        // different table than the active one.
        if (
          activeTableRef.current &&
          !tableWrapper.contains(activeTableRef.current)
        ) {
          scheduleHide();
        }
        return;
      }

      activeTableRef.current = table;

      const rowEl = cell.parentElement;
      const allRows = [...table.querySelectorAll("tr")];
      const colIdx = rowEl ? [...rowEl.children].indexOf(cell) : -1;
      const rowIdx = rowEl ? allRows.indexOf(rowEl as HTMLTableRowElement) : -1;

      if (colIdx >= 0) {
        setHoveredCol(colIdx);
      }
      if (rowIdx >= 0) {
        setHoveredRow(rowIdx);
      }

      recompute();
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

    const handleOverlayOver = () => {
      cancelHide();
    };

    dom.addEventListener("pointerover", handleOver);
    dom.addEventListener("pointerleave", handleLeave);
    const anchor = anchorRef.current;
    anchor?.addEventListener("pointerover", handleOverlayOver);
    return () => {
      dom.removeEventListener("pointerover", handleOver);
      dom.removeEventListener("pointerleave", handleLeave);
      anchor?.removeEventListener("pointerover", handleOverlayOver);
    };
  }, [editor, recompute, cancelHide, scheduleHide]);

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

  const cellAt = (rowIdx: number, colIdx: number): HTMLElement | undefined => {
    const table = activeTableRef.current;
    if (!table) {
      return undefined;
    }
    const rowEl = table.querySelectorAll("tr")[rowIdx];
    const cell = rowEl?.children[colIdx] as HTMLElement | undefined;
    return cell?.tagName === "TD" || cell?.tagName === "TH" ? cell : undefined;
  };

  const cellPos = (cell: HTMLElement): number | null => {
    if (!editor || editor.isDestroyed) {
      return null;
    }
    const pos = editor.view.posAtDOM(cell, 0, 0);
    return pos ?? null;
  };

  const runCellOp = (
    cell: HTMLElement | undefined,
    op: (c: ChainedCommands) => ChainedCommands
  ) => {
    if (!editor || editor.isDestroyed || cell === undefined) {
      return;
    }
    const pos = cellPos(cell);
    if (pos === null) {
      return;
    }
    op(editor.chain().focus().setTextSelection(pos)).run();
  };

  const runColumnOp = (op: (c: ChainedCommands) => ChainedCommands) => {
    const col = hoveredCol ?? 0;
    const cell = cellAt(0, col);
    runCellOp(cell, op);
  };

  const runRowOp = (op: (c: ChainedCommands) => ChainedCommands) => {
    const row = hoveredRow ?? 0;
    const cell = cellAt(row, 0);
    runCellOp(cell, op);
  };

  const handleColMenuOpen = (open: boolean) => {
    setColMenuOpen(open);
  };

  const handleRowMenuOpen = (open: boolean) => {
    setRowMenuOpen(open);
  };

  if (!hasTable || !isEditable) {
    return null;
  }

  return (
    <div ref={anchorRef} className="ext-table-overlay">
      {layout ? (
        <div
          className="ext-table-clip"
          style={{
            height: layout.visible.height,
            left: layout.offset.left,
            top: layout.offset.top,
            width: layout.visible.width,
          }}
        >
          <OverlayControls
            colMenuOpen={colMenuOpen}
            hoveredCol={hoveredCol}
            hoveredRow={hoveredRow}
            labels={labels}
            layout={layout}
            onColMenuOpenChange={handleColMenuOpen}
            onRowMenuOpenChange={handleRowMenuOpen}
            rowMenuOpen={rowMenuOpen}
            runColumnOp={runColumnOp}
            runRowOp={runRowOp}
          />
        </div>
      ) : null}
    </div>
  );
};
