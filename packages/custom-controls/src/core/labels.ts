export interface ControlsLabels {
  addColumnLeft: string;
  addColumnRight: string;
  addRowAbove: string;
  addRowBelow: string;
  cancel: string;
  columns: string;
  deleteColumn: string;
  deleteRow: string;
  deleteTable: string;
  h1: string;
  h2: string;
  h3: string;
  headerRow: string;
  highlightColor: string;
  image: string;
  imageUrl: string;
  imagePlaceholder: string;
  insert: string;
  insertLink: string;
  insertTable: string;
  linkPlaceholder: string;
  linkUrl: string;
  mergeCells: string;
  paragraph: string;
  removeHighlight: string;
  rows: string;
  splitCell: string;
}

export type ControlsLabelKey = keyof ControlsLabels;

export const DEFAULT_CONTROLS_LABELS: ControlsLabels = {
  addColumnLeft: "Add column left",
  addColumnRight: "Add column right",
  addRowAbove: "Add row above",
  addRowBelow: "Add row below",
  cancel: "Cancel",
  columns: "Columns",
  deleteColumn: "Delete column",
  deleteRow: "Delete row",
  deleteTable: "Delete table",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  headerRow: "Header row",
  highlightColor: "Highlight color",
  image: "Image",
  imagePlaceholder: "https://example.com/image.png",
  imageUrl: "Image URL",
  insert: "Insert",
  insertLink: "Insert link",
  insertTable: "Insert table",
  linkPlaceholder: "https://example.com",
  linkUrl: "URL",
  mergeCells: "Merge cells",
  paragraph: "Paragraph",
  removeHighlight: "Remove highlight",
  rows: "Rows",
  splitCell: "Split cell",
};
