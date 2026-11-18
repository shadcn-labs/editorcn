"use client";

import { RichTextEditor } from "@editorcn/editor";

// Quiet ghost buttons on the gray footer: size-8 squares, size-4 icons, and a
// plain white fill for hover and the active format instead of a tinted ring.
const BUTTONS = [
  "[&_.rte-controls-group>button]:size-8!",
  "[&_.rte-controls-group>button]:rounded-md!",
  "[&_.rte-controls-group>button:hover]:bg-background!",
  "[&_.rte-controls-group>button[aria-pressed=true]]:bg-background!",
  "[&_.rte-controls-group>button[aria-pressed=true]]:text-foreground!",
  "[&_.rte-controls-group>button[aria-pressed=true]]:shadow-none!",
  "[&_.rte-controls-group>button[data-state=on]]:bg-background!",
  "[&_.rte-controls-group>button[data-state=on]]:text-foreground!",
  "[&_.rte-controls-group>button[data-state=on]]:shadow-none!",
  "[&_.rte-editor-icon]:size-4!",
].join(" ");

export const Toolbar = () => (
  <div className={`flex min-w-0 items-center ${BUTTONS}`}>
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
