import { cn } from "@editorcn/editor-ui/lib/cn";

import type { RichTextEditorControlsGroupProps } from "./types";

export const ControlsGroup = ({
  children,
  className,
}: RichTextEditorControlsGroupProps) => (
  <div className={cn("rte-controls-group", className)}>{children}</div>
);
