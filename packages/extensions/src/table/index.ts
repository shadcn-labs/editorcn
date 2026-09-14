import type { CommandProps } from "@tiptap/core";
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
    };
  }
}

export const Table = TiptapTable.extend<TableConfigOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultCols: 3,
      defaultRows: 3,
      withHeaderRow: true,
      resizable: true,
    };
  },
  addExtensions() {
    return [TableRow, TableCell, TableHeader];
  },
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
    };
  },
});