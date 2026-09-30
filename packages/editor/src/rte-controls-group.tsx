import { cn } from "@editorcn/editor-ui/editor/ui/utils";

import type { RichTextEditorControlsGroupProps } from "./types";

export const ControlsGroup = ({
  children,
  className,
}: RichTextEditorControlsGroupProps) => (
  <div className={cn("rte-controls-group", className)}>{children}</div>
);
