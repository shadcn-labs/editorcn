export interface ExtensionLabels {
  addColumnLeft: string;
  addColumnRight: string;
  addRowAbove: string;
  addRowBelow: string;
  columnActions: string;
  columns: string;
  copyMarkdown: string;
  deleteColumn: string;
  deleteRow: string;
  deleteTable: string;
  exportMarkdown: string;
  headerRow: string;
  image: string;
  imagePlaceholder: string;
  importMarkdown: string;
  insertTable: string;
  markdown: string;
  mergeCells: string;
  rowActions: string;
  rows: string;
  splitCell: string;
  tableActions: string;
}

export type ExtensionLabelKey = keyof ExtensionLabels;

export const DEFAULT_EXTENSION_LABELS: ExtensionLabels = {
  addColumnLeft: "Insert Left",
  addColumnRight: "Insert Right",
  addRowAbove: "Insert Above",
  addRowBelow: "Insert Below",
  columnActions: "Column actions",
  columns: "Columns",
  copyMarkdown: "Copy as Markdown",
  deleteColumn: "Delete column",
  deleteRow: "Delete row",
  deleteTable: "Delete table",
  exportMarkdown: "Export Markdown",
  headerRow: "Header row",
  image: "Image",
  imagePlaceholder: "Add an image",
  importMarkdown: "Import Markdown",
  insertTable: "Insert table",
  markdown: "Markdown",
  mergeCells: "Merge cells",
  rowActions: "Row actions",
  rows: "Rows",
  splitCell: "Split cell",
  tableActions: "Table actions",
};
