export interface RichTextEditorLabels {
  boldControlLabel: string;
  italicControlLabel: string;
  underlineControlLabel: string;
  strikeControlLabel: string;
  clearFormattingControlLabel: string;
  codeControlLabel: string;
  codeBlockControlLabel: string;
  h1ControlLabel: string;
  h2ControlLabel: string;
  h3ControlLabel: string;
  h4ControlLabel: string;
  h5ControlLabel: string;
  h6ControlLabel: string;
  bulletListControlLabel: string;
  orderedListControlLabel: string;
  blockquoteControlLabel: string;
  hrControlLabel: string;
  linkControlLabel: string;
  unlinkControlLabel: string;
  undoControlLabel: string;
  redoControlLabel: string;
  alignLeftControlLabel: string;
  alignCenterControlLabel: string;
  alignRightControlLabel: string;
  alignJustifyControlLabel: string;
  highlightControlLabel: string;
  subscriptControlLabel: string;
  superscriptControlLabel: string;
  tasksControlLabel: string;
  tasksSinkLabel: string;
  tasksLiftLabel: string;
  sourceCodeControlLabel: string;
  // link editor
  linkEditorInputLabel: string;
  linkEditorInputPlaceholder: string;
  linkEditorExternalLink: string;
  linkEditorInternalLink: string;
  linkEditorSave: string;
}

export const DEFAULT_LABELS: RichTextEditorLabels = {
  alignCenterControlLabel: "Align center",
  alignJustifyControlLabel: "Align justify",
  alignLeftControlLabel: "Align left",
  alignRightControlLabel: "Align right",
  blockquoteControlLabel: "Blockquote",
  boldControlLabel: "Bold",
  bulletListControlLabel: "Bullet list",
  clearFormattingControlLabel: "Clear formatting",
  codeBlockControlLabel: "Code block",
  codeControlLabel: "Code",
  h1ControlLabel: "Heading 1",
  h2ControlLabel: "Heading 2",
  h3ControlLabel: "Heading 3",
  h4ControlLabel: "Heading 4",
  h5ControlLabel: "Heading 5",
  h6ControlLabel: "Heading 6",
  highlightControlLabel: "Highlight",
  hrControlLabel: "Horizontal rule",
  italicControlLabel: "Italic",
  linkControlLabel: "Link",
  linkEditorExternalLink: "Open in new tab",
  linkEditorInputLabel: "Enter URL",
  linkEditorInputPlaceholder: "https://example.com",
  linkEditorInternalLink: "Open in same tab",
  linkEditorSave: "Save",
  orderedListControlLabel: "Ordered list",
  redoControlLabel: "Redo",
  sourceCodeControlLabel: "Source code",
  strikeControlLabel: "Strikethrough",
  subscriptControlLabel: "Subscript",
  superscriptControlLabel: "Superscript",
  tasksControlLabel: "Task list",
  tasksLiftLabel: "Increase task level",
  tasksSinkLabel: "Decrease task level",
  underlineControlLabel: "Underline",
  undoControlLabel: "Undo",
  unlinkControlLabel: "Remove link",
};
