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

interface TableColumnLayout {
  center: number;
  left: number;
  width: number;
}

interface TableRowLayout {
  center: number;
  height: number;
  top: number;
}

interface TableRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface ColumnControlProps {
  colCenter: number;
  labels: ExtensionLabels;
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  runColumnOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  tableRect: TableRect;
}

const ColumnControl = ({
  colCenter,
  labels,
  menuOpen,
  onOpenChange,
  runColumnOp,
  tableRect,
}: ColumnControlProps) => (
  <div
    className="ext-table-control ext-table-control--column"
    style={{
      left: colCenter,
      top: tableRect.top,
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
  menuOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rowCenter: number;
  runRowOp: (op: (c: ChainedCommands) => ChainedCommands) => void;
  tableRect: TableRect;
}

const RowControl = ({
  labels,
  menuOpen,
  onOpenChange,
  rowCenter,
  runRowOp,
  tableRect,
}: RowControlProps) => (
  <div
    className="ext-table-control ext-table-control--row"
    style={{
      left: tableRect.left,
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
  tableRect: TableRect;
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
          left: tableRect.left + tableRect.width + 6,
          top: tableRect.top,
          width: 20,
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
          height: 20,
          left: tableRect.left,
          top: tableRect.top + tableRect.height + 6,
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

export const TableHoverOverlay = ({
  editor: editorProp,
}: ToolbarComponentProps) => {
  const { labels } = useToolbar();
  const editor = useToolbarEditor(editorProp);

  const anchorRef = useRef<HTMLDivElement>(null);
  const activeTableRef = useRef<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [tableRect, setTableRect] = useState<TableRect | null>(null);
  const [columns, setColumns] = useState<TableColumnLayout[]>([]);
  const [rows, setRows] = useState<TableRowLayout[]>([]);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [rowMenuOpen, setRowMenuOpen] = useState(false);
  const [colCenter, setColCenter] = useState(0);
  const [rowCenter, setRowCenter] = useState(0);

  const isEditable = editor?.isEditable ?? false;
  const hasTable = editor ? extensionPresent(editor, "table") : false;
  const isVisible = tableRect !== null;

  const scheduleHide = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      activeTableRef.current = null;
      setTableRect(null);
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
    if (!table || !anchor || !table.isConnected) {
      setTableRect(null);
      return;
    }
    const aRect = anchor.getBoundingClientRect();
    const tRect = table.getBoundingClientRect();

    const rowElements = [...table.querySelectorAll("tr")];
    let widestCells: HTMLElement[] = [];
    for (const rowEl of rowElements) {
      const cells = [...rowEl.children].filter(
        (cell) => cell.tagName === "TD" || cell.tagName === "TH"
      ) as HTMLElement[];
      if (cells.length > widestCells.length) {
        widestCells = cells;
      }
    }

    const nextColumns = widestCells.map((cell) => {
      const r = cell.getBoundingClientRect();
      return {
        center: r.left + r.width / 2 - aRect.left,
        left: r.left - aRect.left,
        width: r.width,
      };
    });
    const nextRows = rowElements.map((rowEl) => {
      const r = rowEl.getBoundingClientRect();
      return {
        center: r.top + r.height / 2 - aRect.top,
        height: r.height,
        top: r.top - aRect.top,
      };
    });

    setTableRect({
      height: tRect.height,
      left: tRect.x - aRect.x,
      top: tRect.y - aRect.y,
      width: tRect.width,
    });
    setColumns(nextColumns);
    setRows(nextRows);
  }, []);

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

      const cellRect = cell.getBoundingClientRect();
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (anchor) {
        setColCenter(cellRect.left + cellRect.width / 2 - anchor.left);
        setRowCenter(cellRect.top + cellRect.height / 2 - anchor.top);
      }

      recompute();
    };

    const handleLeave = (e: PointerEvent) => {
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
    if (!isVisible) {
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
  }, [isVisible, recompute]);

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
      {tableRect ? (
        <>
          {hoveredCol !== null && columns[hoveredCol] ? (
            <ColumnControl
              colCenter={colCenter}
              labels={labels}
              menuOpen={colMenuOpen}
              onOpenChange={handleColMenuOpen}
              runColumnOp={runColumnOp}
              tableRect={tableRect}
            />
          ) : null}
          {hoveredRow !== null && rows[hoveredRow] ? (
            <RowControl
              labels={labels}
              menuOpen={rowMenuOpen}
              onOpenChange={handleRowMenuOpen}
              rowCenter={rowCenter}
              runRowOp={runRowOp}
              tableRect={tableRect}
            />
          ) : null}
          <AddHandles
            labels={labels}
            runColumnOp={runColumnOp}
            runRowOp={runRowOp}
            showColumn={
              hoveredCol !== null && hoveredCol === columns.length - 1
            }
            showRow={hoveredRow !== null && hoveredRow === rows.length - 1}
            tableRect={tableRect}
          />
        </>
      ) : null}
    </div>
  );
};
