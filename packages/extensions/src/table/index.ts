import type { CommandProps } from "@tiptap/core";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Table as TiptapTable } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";

export interface TableConfigOptions {
  HTMLAttributes?: Record<string, unknown>;
  defaultCols?: number;
  defaultRows?: number;
  tableCellMinWidth?: number;
  withHeaderRow?: boolean;
  resizable?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableControl: {
      insertTableWithHeader: () => ReturnType;
      moveColumn: (from: number, to: number) => ReturnType;
      moveRow: (from: number, to: number) => ReturnType;
    };
  }
}

const clampIndex = (index: number, length: number): number =>
  Math.max(0, Math.min(index, length - 1));

const findTablePosition = (doc: {
  descendants: (
    cb: (node: { type: { name: string } }, pos: number) => boolean | undefined
  ) => void;
}): number => {
  let position = -1;
  doc.descendants((node, pos) => {
    if (position !== -1 || node.type.name !== "table") {
      return position === -1;
    }
    position = pos;
    return false;
  });
  return position;
};

export const Table = TiptapTable.extend<TableConfigOptions>({
  addCommands() {
    return {
      ...this.parent?.(),
      insertTableWithHeader:
        () =>
        ({ commands }: CommandProps) =>
          commands.insertTable({
            cols: this.options.defaultCols ?? 3,
            rows: this.options.defaultRows ?? 3,
            withHeaderRow: this.options.withHeaderRow ?? true,
          }),
      moveColumn:
        (from: number, to: number) =>
        ({ dispatch, state }: CommandProps) => {
          const tablePos = findTablePosition(state.doc);
          if (tablePos === -1 || from === to) {
            return false;
          }
          const table = state.doc.nodeAt(tablePos);
          if (!table) {
            return false;
          }

          const columnCount = table.child(0)?.childCount ?? 0;
          const source = clampIndex(from, columnCount);
          const target = clampIndex(to, columnCount);
          if (source === target) {
            return false;
          }

          const rows = [];
          for (let r = 0; r < table.childCount; r += 1) {
            const row = table.child(r);
            const cells = [];
            for (let c = 0; c < row.childCount; c += 1) {
              cells.push(row.child(c));
            }
            if (cells.length === 0 || source >= cells.length) {
              rows.push(row);
              continue;
            }
            const [moved] = cells.splice(source, 1);
            if (moved === undefined) {
              rows.push(row);
              continue;
            }
            const clampedTarget = Math.min(target, cells.length);
            cells.splice(clampedTarget, 0, moved);
            rows.push(row.type.create(row.attrs, cells));
          }

          const { tr } = state;
          tr.replaceWith(
            tablePos,
            tablePos + table.nodeSize,
            table.type.create(table.attrs, rows)
          );
          dispatch?.(tr);
          return true;
        },
      moveRow:
        (from: number, to: number) =>
        ({ dispatch, state }: CommandProps) => {
          const tablePos = findTablePosition(state.doc);
          if (tablePos === -1 || from === to) {
            return false;
          }
          const table = state.doc.nodeAt(tablePos);
          if (!table) {
            return false;
          }

          const source = clampIndex(from, table.childCount);
          const target = clampIndex(to, table.childCount);
          if (source === target) {
            return false;
          }

          const rows = [];
          for (let r = 0; r < table.childCount; r += 1) {
            rows.push(table.child(r));
          }
          const [moved] = rows.splice(source, 1);
          if (moved === undefined) {
            return false;
          }
          rows.splice(target, 0, moved);

          const { tr } = state;
          tr.replaceWith(
            tablePos,
            tablePos + table.nodeSize,
            table.type.create(table.attrs, rows)
          );
          dispatch?.(tr);
          return true;
        },
    };
  },
  addExtensions() {
    return [TableRow, TableCell, TableHeader, Gapcursor];
  },
  addOptions() {
    return {
      ...this.parent?.(),
      defaultCols: 3,
      defaultRows: 3,
      resizable: true,
      withHeaderRow: true,
    };
  },
});
