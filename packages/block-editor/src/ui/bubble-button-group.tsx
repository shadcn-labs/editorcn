import * as React from "react";

import { cn } from "../lib/utils";

export type BubbleButtonGroupProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleButtonGroup = React.forwardRef<
  HTMLDivElement,
  BubbleButtonGroupProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "block-editor-bubble-group flex items-center gap-px",
      className
    )}
    {...props}
  />
));
BubbleButtonGroup.displayName = "BubbleButtonGroup";

export { BubbleButtonGroup };
