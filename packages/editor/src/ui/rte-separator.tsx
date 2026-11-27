import * as React from "react";

import { cn } from "./utils";

export type RteSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const RteSeparator = React.forwardRef<HTMLDivElement, RteSeparatorProps>(
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
RteSeparator.displayName = "RteSeparator";

export { RteSeparator };
