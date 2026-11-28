export interface ExtensionLabels {
  addColumn: string;
  addColumnLeft: string;
  addColumnRight: string;
  addRow: string;
  addRowAbove: string;
  addRowBelow: string;
  alignCenter: string;
  alignLeft: string;
  alignRight: string;
  apply: string;
  callout: string;
  calloutDanger: string;
  calloutInfo: string;
  calloutNote: string;
  calloutTip: string;
  calloutType: string;
  calloutWarning: string;
  cancel: string;
  caption: string;
  captionPlaceholder: string;
  code: string;
  codeActions: string;
  columnActions: string;
  columns: string;
  copied: string;
  copy: string;
  copyCode: string;
  copyMarkdown: string;
  copySource: string;
  deleteColumn: string;
  deleteDiagram: string;
  deleteImage: string;
  deleteRow: string;
  deleteTable: string;
  diagram: string;
  diagramError: string;
  diagramLayout: string;
  diagramLine: string;
  diagramLines: string;
  diagramSource: string;
  duplicate: string;
  editDiagram: string;
  emptyDiagram: string;
  embedImage: string;
  embedImageHint: string;
  embedLink: string;
  exportMarkdown: string;
  formatCode: string;
  fullWidth: string;
  headerRow: string;
  image: string;
  imageOptions: string;
  imagePlaceholder: string;
  imageUrlPlaceholder: string;
  importMarkdown: string;
  insertTable: string;
  invalidImageUrl: string;
  language: string;
  languages: string;
  layoutCode: string;
  layoutPreview: string;
  layoutSplit: string;
  markdown: string;
  mergeCells: string;
  noResults: string;
  removeCallout: string;
  renderingDiagram: string;
  resetCalloutIcon: string;
  rowActions: string;
  rows: string;
  searchActions: string;
  searchLanguages: string;
  splitCell: string;
  tableActions: string;
  toApply: string;
  toCancel: string;
  upload: string;
  uploadImageHint: string;
  wrapCode: string;
}

export type ExtensionLabelKey = keyof ExtensionLabels;

export const DEFAULT_EXTENSION_LABELS: ExtensionLabels = {
  addColumn: "Add column",
  addColumnLeft: "Insert column left",
  addColumnRight: "Insert column right",
  addRow: "Add row",
  addRowAbove: "Insert row above",
  addRowBelow: "Insert row below",
  alignCenter: "Align center",
  alignLeft: "Align left",
  alignRight: "Align right",
  apply: "Apply",
  callout: "Callout",
  calloutDanger: "Danger",
  calloutInfo: "Info",
  calloutNote: "Note",
  calloutTip: "Tip",
  calloutType: "Change callout type",
  calloutWarning: "Warning",
  cancel: "Cancel",
  caption: "Caption",
  captionPlaceholder: "Write a caption...",
  code: "Code",
  codeActions: "More",
  columnActions: "Column actions",
  columns: "Columns",
  copied: "Copied",
  copy: "Copy",
  copyCode: "Copy code",
  copyMarkdown: "Copy as Markdown",
  copySource: "Copy source",
  deleteColumn: "Delete column",
  deleteDiagram: "Delete",
  deleteImage: "Delete image",
  deleteRow: "Delete row",
  deleteTable: "Delete table",
  diagram: "Diagram",
  diagramError: "Failed to render diagram",
  diagramLayout: "Layout",
  diagramLine: "line",
  diagramLines: "lines",
  diagramSource: "Mermaid source",
  duplicate: "Duplicate",
  editDiagram: "Edit",
  embedImage: "Embed image",
  embedImageHint: "Works with any image from the web",
  embedLink: "Embed link",
  emptyDiagram: "Empty diagram",
  exportMarkdown: "Export Markdown",
  formatCode: "Format code",
  fullWidth: "Full width",
  headerRow: "Header row",
  image: "Image",
  imageOptions: "Image options",
  imagePlaceholder: "Add an image",
  imageUrlPlaceholder: "Paste the image link...",
  importMarkdown: "Import Markdown",
  insertTable: "Insert table",
  invalidImageUrl: "Please enter a valid URL",
  language: "Language",
  languages: "Languages",
  layoutCode: "Code",
  layoutPreview: "Preview",
  layoutSplit: "Split",
  markdown: "Markdown",
  mergeCells: "Merge cells",
  noResults: "No results",
  removeCallout: "Remove callout",
  renderingDiagram: "Rendering diagram...",
  resetCalloutIcon: "Use default icon",
  rowActions: "Row actions",
  rows: "Rows",
  searchActions: "Search actions",
  searchLanguages: "Search for a language",
  splitCell: "Split cell",
  tableActions: "Table actions",
  toApply: "to apply",
  toCancel: "to cancel",
  upload: "Upload",
  uploadImageHint: "Drag & drop or click to upload",
  wrapCode: "Wrap code",
};
