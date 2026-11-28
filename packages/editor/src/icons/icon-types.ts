import type React from "react";

export interface RichTextEditorIcons {
  boldControlIcon: React.ReactNode;
  italicControlIcon: React.ReactNode;
  underlineControlIcon: React.ReactNode;
  strikeControlIcon: React.ReactNode;
  clearFormattingControlIcon: React.ReactNode;
  codeControlIcon: React.ReactNode;
  codeBlockControlIcon: React.ReactNode;
  h1ControlIcon: React.ReactNode;
  h2ControlIcon: React.ReactNode;
  h3ControlIcon: React.ReactNode;
  h4ControlIcon: React.ReactNode;
  h5ControlIcon: React.ReactNode;
  h6ControlIcon: React.ReactNode;
  bulletListControlIcon: React.ReactNode;
  orderedListControlIcon: React.ReactNode;
  blockquoteControlIcon: React.ReactNode;
  hrControlIcon: React.ReactNode;
  linkControlIcon: React.ReactNode;
  unlinkControlIcon: React.ReactNode;
  undoControlIcon: React.ReactNode;
  redoControlIcon: React.ReactNode;
  alignLeftControlIcon: React.ReactNode;
  alignCenterControlIcon: React.ReactNode;
  alignRightControlIcon: React.ReactNode;
  alignJustifyControlIcon: React.ReactNode;
  highlightControlIcon: React.ReactNode;
  subscriptControlIcon: React.ReactNode;
  superscriptControlIcon: React.ReactNode;
  languageIcons: Record<string, React.ReactNode>;
}
