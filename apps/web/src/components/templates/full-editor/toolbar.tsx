"use client";

import { RichTextEditor } from "@editorcn/editor";
import { CalloutToolbar } from "@editorcn/extensions/callout-toolbar";
import { ImagePlaceholderToolbar } from "@editorcn/extensions/image-placeholder-toolbar";
import { MarkdownToolbar } from "@editorcn/extensions/markdown-toolbar";
import { TableToolbar } from "@editorcn/extensions/table-toolbar";
import type { Editor } from "@tiptap/react";

export const FullEditorToolbar = ({
  editor,
  markdownFilename,
}: {
  editor: Editor | null;
  markdownFilename: string;
}) => (
  <RichTextEditor.Toolbar>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Bold />
      <RichTextEditor.Italic />
      <RichTextEditor.Underline />
      <RichTextEditor.Strikethrough />
      <RichTextEditor.Code />
      <RichTextEditor.ClearFormatting />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.H1 />
      <RichTextEditor.H2 />
      <RichTextEditor.H3 />
      <RichTextEditor.H4 />
      <RichTextEditor.H5 />
      <RichTextEditor.H6 />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.BulletList />
      <RichTextEditor.OrderedList />
      <RichTextEditor.Blockquote />
      <RichTextEditor.Hr />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.AlignLeft />
      <RichTextEditor.AlignCenter />
      <RichTextEditor.AlignRight />
      <RichTextEditor.AlignJustify />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Link />
      <RichTextEditor.Unlink />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Highlight />
      <RichTextEditor.Subscript />
      <RichTextEditor.Superscript />
      <RichTextEditor.CodeBlock />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.YouTubeEmbed />
      <RichTextEditor.TwitterEmbed />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <CalloutToolbar editor={editor} />
      <ImagePlaceholderToolbar editor={editor} />
      <TableToolbar editor={editor} />
      <MarkdownToolbar editor={editor} filename={markdownFilename} />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Undo />
      <RichTextEditor.Redo />
    </RichTextEditor.ControlsGroup>
  </RichTextEditor.Toolbar>
);
