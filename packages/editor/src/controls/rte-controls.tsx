import { createControl } from "./rte-control";

interface HistoryCanCommands {
  redo: () => boolean;
  undo: () => boolean;
}

export const BoldControl = createControl({
  iconKey: "boldControlIcon",
  isActive: { name: "bold" },
  label: "boldControlLabel",
  operation: { name: "toggleBold" },
});

export const ItalicControl = createControl({
  iconKey: "italicControlIcon",
  isActive: { name: "italic" },
  label: "italicControlLabel",
  operation: { name: "toggleItalic" },
});

export const UnderlineControl = createControl({
  iconKey: "underlineControlIcon",
  isActive: { name: "underline" },
  label: "underlineControlLabel",
  operation: { name: "toggleUnderline" },
});

export const StrikethroughControl = createControl({
  iconKey: "strikeControlIcon",
  isActive: { name: "strike" },
  label: "strikeControlLabel",
  operation: { name: "toggleStrike" },
});

export const ClearFormattingControl = createControl({
  iconKey: "clearFormattingControlIcon",
  label: "clearFormattingControlLabel",
  operation: { name: "unsetAllMarks" },
});

export const CodeControl = createControl({
  iconKey: "codeControlIcon",
  isActive: { name: "code" },
  label: "codeControlLabel",
  operation: { name: "toggleCode" },
});

export const CodeBlockControl = createControl({
  iconKey: "codeBlockControlIcon",
  isActive: { name: "codeBlock" },
  label: "codeBlockControlLabel",
  operation: { name: "toggleCodeBlock" },
});

export const H1Control = createControl({
  iconKey: "h1ControlIcon",
  isActive: { attributes: { level: 1 }, name: "heading" },
  label: "h1ControlLabel",
  operation: { attributes: { level: 1 }, name: "toggleHeading" },
});

export const H2Control = createControl({
  iconKey: "h2ControlIcon",
  isActive: { attributes: { level: 2 }, name: "heading" },
  label: "h2ControlLabel",
  operation: { attributes: { level: 2 }, name: "toggleHeading" },
});

export const H3Control = createControl({
  iconKey: "h3ControlIcon",
  isActive: { attributes: { level: 3 }, name: "heading" },
  label: "h3ControlLabel",
  operation: { attributes: { level: 3 }, name: "toggleHeading" },
});

export const H4Control = createControl({
  iconKey: "h4ControlIcon",
  isActive: { attributes: { level: 4 }, name: "heading" },
  label: "h4ControlLabel",
  operation: { attributes: { level: 4 }, name: "toggleHeading" },
});

export const BulletListControl = createControl({
  iconKey: "bulletListControlIcon",
  isActive: { name: "bulletList" },
  label: "bulletListControlLabel",
  operation: { name: "toggleBulletList" },
});

export const OrderedListControl = createControl({
  iconKey: "orderedListControlIcon",
  isActive: { name: "orderedList" },
  label: "orderedListControlLabel",
  operation: { name: "toggleOrderedList" },
});

export const BlockquoteControl = createControl({
  iconKey: "blockquoteControlIcon",
  isActive: { name: "blockquote" },
  label: "blockquoteControlLabel",
  operation: { name: "toggleBlockquote" },
});

export const HrControl = createControl({
  iconKey: "hrControlIcon",
  label: "hrControlLabel",
  operation: { name: "setHorizontalRule" },
});

export const UnlinkControl = createControl({
  iconKey: "unlinkControlIcon",
  label: "unlinkControlLabel",
  operation: { name: "unsetLink" },
});

export const UndoControl = createControl({
  iconKey: "undoControlIcon",
  isDisabled: (editor) =>
    !(editor.can() as unknown as HistoryCanCommands).undo(),
  label: "undoControlLabel",
  operation: { name: "undo" },
});

export const RedoControl = createControl({
  iconKey: "redoControlIcon",
  isDisabled: (editor) =>
    !(editor.can() as unknown as HistoryCanCommands).redo(),
  label: "redoControlLabel",
  operation: { name: "redo" },
});

export const H5Control = createControl({
  iconKey: "h5ControlIcon",
  isActive: { attributes: { level: 5 }, name: "heading" },
  label: "h5ControlLabel",
  operation: { attributes: { level: 5 }, name: "toggleHeading" },
});

export const H6Control = createControl({
  iconKey: "h6ControlIcon",
  isActive: { attributes: { level: 6 }, name: "heading" },
  label: "h6ControlLabel",
  operation: { attributes: { level: 6 }, name: "toggleHeading" },
});

export const AlignLeftControl = createControl({
  iconKey: "alignLeftControlIcon",
  isActive: { attrs: { textAlign: "left" } },
  label: "alignLeftControlLabel",
  operation: { attributes: "left", name: "setTextAlign" },
});

export const AlignCenterControl = createControl({
  iconKey: "alignCenterControlIcon",
  isActive: { attrs: { textAlign: "center" } },
  label: "alignCenterControlLabel",
  operation: { attributes: "center", name: "setTextAlign" },
});

export const AlignRightControl = createControl({
  iconKey: "alignRightControlIcon",
  isActive: { attrs: { textAlign: "right" } },
  label: "alignRightControlLabel",
  operation: { attributes: "right", name: "setTextAlign" },
});

export const AlignJustifyControl = createControl({
  iconKey: "alignJustifyControlIcon",
  isActive: { attrs: { textAlign: "justify" } },
  label: "alignJustifyControlLabel",
  operation: { attributes: "justify", name: "setTextAlign" },
});

export const HighlightControl = createControl({
  iconKey: "highlightControlIcon",
  isActive: { name: "highlight" },
  label: "highlightControlLabel",
  operation: { name: "toggleHighlight" },
});

export const SubscriptControl = createControl({
  iconKey: "subscriptControlIcon",
  isActive: { name: "subscript" },
  label: "subscriptControlLabel",
  operation: { name: "toggleSubscript" },
});

export const SuperscriptControl = createControl({
  iconKey: "superscriptControlIcon",
  isActive: { name: "superscript" },
  label: "superscriptControlLabel",
  operation: { name: "toggleSuperscript" },
});
