export interface ExtensionLabels {
  addColumnLeft: string;
  addColumnRight: string;
  addRowAbove: string;
  addRowBelow: string;
  columnActions: string;
  columns: string;
  deleteColumn: string;
  deleteRow: string;
  deleteTable: string;
  headerRow: string;
  image: string;
  imagePlaceholder: string;
  insertTable: string;
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
  deleteColumn: "Delete column",
  deleteRow: "Delete row",
  deleteTable: "Delete table",
  headerRow: "Header row",
  image: "Image",
  imagePlaceholder: "Add an image",
  insertTable: "Insert table",
  mergeCells: "Merge cells",
  rowActions: "Row actions",
  rows: "Rows",
  splitCell: "Split cell",
  tableActions: "Table actions",
};
