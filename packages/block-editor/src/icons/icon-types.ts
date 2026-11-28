import type React from "react";

export interface BlockEditorIcons {
  slashTextIcon: React.ReactNode;
  slashHeadingIcon: React.ReactNode;
  slashBulletListIcon: React.ReactNode;
  slashOrderedListIcon: React.ReactNode;
  slashTaskListIcon: React.ReactNode;
  slashBlockquoteIcon: React.ReactNode;
  slashCodeBlockIcon: React.ReactNode;
  slashDividerIcon: React.ReactNode;
  slashImageIcon: React.ReactNode;
  slashTableIcon: React.ReactNode;
  slashCalloutIcon: React.ReactNode;
  slashToggleIcon: React.ReactNode;
  slashImportMarkdownIcon: React.ReactNode;
  slashExportMarkdownIcon: React.ReactNode;
  searchIcon: React.ReactNode;
  fallbackIcon: React.ReactNode;
  dragHandleIcon: React.ReactNode;
  boldIcon: React.ReactNode;
  italicIcon: React.ReactNode;
  underlineIcon: React.ReactNode;
  strikethroughIcon: React.ReactNode;
  codeIcon: React.ReactNode;
  alignLeftIcon: React.ReactNode;
  alignCenterIcon: React.ReactNode;
  alignRightIcon: React.ReactNode;
  linkIcon: React.ReactNode;
  unlinkIcon: React.ReactNode;
  checkIcon: React.ReactNode;
  copyIcon: React.ReactNode;
  deleteIcon: React.ReactNode;
  dropdownArrowIcon: React.ReactNode;
  codeBlockLanguageIcon: React.ReactNode;
  languageIcons: Record<string, React.ReactNode>;
}
