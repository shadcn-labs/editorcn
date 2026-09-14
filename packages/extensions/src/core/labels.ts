export interface ExtensionLabels {
  addColumnLeft: string;
  addColumnRight: string;
  addRowAbove: string;
  addRowBelow: string;
  columns: string;
  deleteColumn: string;
  deleteRow: string;
  deleteTable: string;
  headerRow: string;
  highlightColor: string;
  image: string;
  imagePlaceholder: string;
  insertTable: string;
  mergeCells: string;
  removeHighlight: string;
  rows: string;
  splitCell: string;
}

export type ExtensionLabelKey = keyof ExtensionLabels;

export const DEFAULT_EXTENSION_LABELS: ExtensionLabels = {
  addColumnLeft: "Add column left",
  addColumnRight: "Add column right",
  addRowAbove: "Add row above",
  addRowBelow: "Add row below",
  columns: "Columns",
  deleteColumn: "Delete column",
  deleteRow: "Delete row",
  deleteTable: "Delete table",
  headerRow: "Header row",
  highlightColor: "Highlight color",
  image: "Image",
  imagePlaceholder: "Add an image",
  insertTable: "Insert table",
  mergeCells: "Merge cells",
  removeHighlight: "Remove highlight",
  rows: "Rows",
  splitCell: "Split cell",
};