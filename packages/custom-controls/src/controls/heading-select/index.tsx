import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@editorcn/ui/components/select";
import type { Editor } from "@tiptap/core";

import { useEditorControls, useResolvedEditor } from "../../core/context";
import { extensionPresent } from "../../core/detection";
import { shallowEqual, useEditorState } from "../../core/editor-state";
import { DEFAULT_CONTROLS_LABELS } from "../../core/labels";

type HeadingValue = "paragraph" | "h1" | "h2" | "h3";

const HEADING_ITEMS: Record<string, string> = {
  h1: DEFAULT_CONTROLS_LABELS.h1,
  h2: DEFAULT_CONTROLS_LABELS.h2,
  h3: DEFAULT_CONTROLS_LABELS.h3,
  paragraph: DEFAULT_CONTROLS_LABELS.paragraph,
};

export interface HeadingSelectProps {
  className?: string;
  editor?: Editor | null;
  size?: "sm" | "default";
}

export const HeadingSelect = ({
  className,
  editor: editorProp,
  size = "default",
}: HeadingSelectProps) => {
  const { labels } = useEditorControls();
  const editor = useResolvedEditor(editorProp);

  const { disabled, value } = useEditorState(
    editor,
    (edit) => {
      let heading: HeadingValue = "paragraph";
      if (edit.isActive("heading", { level: 1 })) {
        heading = "h1";
      } else if (edit.isActive("heading", { level: 2 })) {
        heading = "h2";
      } else if (edit.isActive("heading", { level: 3 })) {
        heading = "h3";
      }
      return {
        disabled: !extensionPresent(edit, "heading"),
        value: heading,
      };
    },
    shallowEqual
  ) ?? { disabled: true, value: "paragraph" as const };

  const handleValueChange = (next: HeadingValue | null) => {
    if (!editor || editor.isDestroyed || next === null) {
      return;
    }
    if (next === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }
    const level = Number.parseInt(next.slice(1), 10) as 1 | 2 | 3;
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <Select
      disabled={disabled}
      items={HEADING_ITEMS}
      value={value}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className} size={size}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} align="start">
        <SelectItem value="paragraph">{labels.paragraph}</SelectItem>
        <SelectItem value="h1">{labels.h1}</SelectItem>
        <SelectItem value="h2">{labels.h2}</SelectItem>
        <SelectItem value="h3">{labels.h3}</SelectItem>
      </SelectContent>
    </Select>
  );
};
