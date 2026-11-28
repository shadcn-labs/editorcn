import * as React from "react";

import { cn } from "./utils";

export type SeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rte-bubble-separator mx-0.5 h-4 w-px shrink-0 bg-border",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
