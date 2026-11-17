"use client";

import { RichTextEditor } from "@editorcn/editor";

export const Toolbar = () => (
  <div className="flex flex-wrap items-center gap-1 border-b px-2.5 py-1.5">
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.Bold />
      <RichTextEditor.Italic />
      <RichTextEditor.Underline />
      <RichTextEditor.Link />
    </RichTextEditor.ControlsGroup>
    <RichTextEditor.ControlsGroup>
      <RichTextEditor.BulletList />
      <RichTextEditor.OrderedList />
    </RichTextEditor.ControlsGroup>
  </div>
);
