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
      "rte-bubble-dropdown-divider -mx-1 my-1 h-px bg-[color-mix(in_srgb,var(--border)_60%,transparent)]",
      className
    )}
    {...props}
  />
));
DropdownSeparator.displayName = "DropdownSeparator";

export { DropdownSeparator };
