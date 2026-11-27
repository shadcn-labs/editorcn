import * as React from "react";

import { cn } from "../lib/utils";

export type BubbleDropdownDividerProps = React.HTMLAttributes<HTMLDivElement>;

const BubbleDropdownDivider = React.forwardRef<
  HTMLDivElement,
  BubbleDropdownDividerProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "block-editor-bubble-dropdown-divider my-1 h-px bg-border",
      className
    )}
    {...props}
  />
));
BubbleDropdownDivider.displayName = "BubbleDropdownDivider";

export { BubbleDropdownDivider };
