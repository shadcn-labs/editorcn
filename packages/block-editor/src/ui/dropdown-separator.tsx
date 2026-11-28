import * as React from "react";

import { cn } from "./utils";

export type DropdownSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownSeparatorProps
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
DropdownSeparator.displayName = "DropdownSeparator";

export { DropdownSeparator };
