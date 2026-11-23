import * as React from "react";

import { cn } from "../lib/utils";

export type BubbleDropdownIconProps = React.HTMLAttributes<HTMLSpanElement>;

const BubbleDropdownIcon = React.forwardRef<
  HTMLSpanElement,
  BubbleDropdownIconProps
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "block-editor-bubble-dropdown-icon flex size-4 shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-full",
      className
    )}
    {...props}
  />
));
BubbleDropdownIcon.displayName = "BubbleDropdownIcon";

export { BubbleDropdownIcon };
